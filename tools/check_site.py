"""Check HTML structure, local assets, links and duplicate IDs without dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
errors = []


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = set()
        self.refs = []
        self.stack = []
        self.feed(path.read_text(encoding='utf-8'))
        if self.stack:
            errors.append(f'{path.name}: unclosed tags {self.stack}')

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag not in VOID:
            self.stack.append(tag)
        if identifier := attrs.get('id'):
            if identifier in self.ids:
                errors.append(f'{self.path.name}: duplicate ID {identifier}')
            self.ids.add(identifier)
        for attribute in ('src', 'href'):
            if value := attrs.get(attribute):
                self.refs.append(value)
        if tag == 'meta' and attrs.get('property') == 'og:image':
            value = attrs.get('content', '')
            if urlsplit(value).hostname == 'topvicmo.com':
                self.refs.append(urlsplit(value).path.lstrip('/'))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack or self.stack[-1] != tag:
            errors.append(f'{self.path.name}:{self.getpos()[0]}: unexpected </{tag}>')
        else:
            self.stack.pop()


pages = {path.name: Page(path) for path in ROOT.glob('*.html')}
for name, page in pages.items():
    for reference in page.refs:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        target = ROOT / unquote(url.path.lstrip('/')) if url.path else page.path
        if not target.is_file():
            errors.append(f'{name}: missing file {reference}')
            continue
        if url.fragment and target.name in pages:
            # Navigation partials are embedded into the full page.
            ids = pages[target.name].ids | pages['navbar.html'].ids | pages['footer.html'].ids
            if unquote(url.fragment) not in ids:
                errors.append(f'{name}: missing anchor {reference}')

if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'PASS: {len(pages)} HTML files; local assets, anchors, IDs and tag structure.')
