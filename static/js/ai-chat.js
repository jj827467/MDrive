document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 動態注入動畫與微調樣式
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes customFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: customFadeIn 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(style);

    // 2. 封裝 HTML 結構（已加入完整的 FAQ 快捷按鈕）
    const aiChatHTML = `
        <button type="button" id="ai-chat-btn" onclick="toggleChat()" aria-label="開啟 AI 客服" aria-expanded="false" aria-controls="ai-chat-window" class="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white hover:scale-110 hover:shadow-orange-500/50 transition-all duration-300 z-50 group">
            <svg class="w-8 h-8 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
        </button>

        <div id="ai-chat-window" hidden role="region" aria-labelledby="ai-chat-title" class="fixed bottom-28 right-6 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl shadow-gray-900/20 border border-gray-100 flex flex-col overflow-hidden z-50">
            
            <!-- 標題欄 -->
            <div class="bg-gradient-to-r from-amber-400 to-orange-500 p-4 flex shrink-0 justify-between items-center text-white">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                        <h3 id="ai-chat-title" class="font-bold text-base drop-shadow-sm">拓域 AI 助理</h3>
                        <p class="text-xs text-orange-50">為您解答常見問題與服務諮詢</p>
                    </div>
                </div>
                <button type="button" id="ai-chat-close" aria-label="關閉 AI 客服" onclick="toggleChat()" class="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- 對話內容區 -->
            <div id="chat-messages" role="log" aria-live="polite" aria-relevant="additions" class="p-4 h-[320px] overflow-y-auto flex flex-col space-y-4 bg-gray-50/50">
                <div class="flex items-start space-x-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                       <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700 shadow-sm leading-relaxed">
                        您好！我是拓域科技的 AI 助理 👋 <br>請選擇下方感興趣的問題，我會立即為您解答！
                    </div>
                </div>
            </div>

            <!-- 快捷問題選單區 -->
            <div class="p-3 shrink-0 bg-white border-t border-gray-100 max-h-[160px] overflow-y-auto">
                <p class="text-[11px] text-gray-400 mb-2 font-medium">常見問題點擊詢問：</p>
                <div class="flex flex-wrap gap-1.5">
                    <button onclick="sendPredefinedQuestion('q1')" class="text-xs bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-100 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-left">⏱️ 開發與製作週期？</button>
                    <button onclick="sendPredefinedQuestion('q2')" class="text-xs bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-left">🤖 AI 訂閱服務支援哪些？</button>
                    <button onclick="sendPredefinedQuestion('q3')" class="text-xs bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white border border-yellow-100 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-left">🛠️ 定制的技術有哪些？</button>
                    <button onclick="sendPredefinedQuestion('q4')" class="text-xs bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-100 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-left">🎨 AIGC 視覺生成支援？</button>
                    <button onclick="sendPredefinedQuestion('q5')" class="text-xs bg-gray-50 text-gray-600 hover:bg-gray-700 hover:text-white border border-gray-200 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-left">📞 如何與我們聯絡？</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', aiChatHTML);

    const chatWindow = document.getElementById('ai-chat-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatButton = document.getElementById('ai-chat-btn');
    let isTyping = false;

    // 3. 整合 FAQ 與客服資料庫
    const qaDatabase = {
        'q1': {
            question: '專案開發與影片製作週期通常是多長？',
            answer: '視專案的複雜度與規模而定。一般企業網頁或短片製作約需 2-4 週；若是包含後台資料庫或複雜 AI API 串接的客製化系統，約需 1-3 個月。'
        },
        'q2': {
            question: 'AI 訂閱服務支援哪些項目？',
            answer: '我們支援市面上絕大多數主流 AI 服務，包含即夢 AI、可靈 AI、ChatGPT、Gemini、ComfyUI 等等的訂閱，以及開發者所需的各類 API 額度充值。'
        },
        'q3': {
            question: '定制化的技術會有哪些？',
            answer: '我們提供多種定制化技術服務，包括但不限於：數字人、小程序、企業網站開發、電商平台建設、AI 客服系統整合、數據分析後台開發、AIGC 視覺生成、以及各類前沿科技設備的引入與整合。'
        },
        'q4': {
            question: '你們團隊能夠為我們 AIGC 視覺生成提供什麼樣的支援？',
            answer: '我們拓域科技的團隊擁有專業的 AIGC 視覺生成技術能力，能夠根據您的需求，提供高品質的圖像、影片生成設計。我們將運用最先進的 AI 模型，為您打造吸引眼球的視覺內容，無論是企業宣傳片、社群短影音還是其他創意視覺項目，我們都能提供全方位的支援與解決方案。'
        },
        'q5': {
            question: '如何與你們取得聯絡？',
            answer: '您可以直接點擊網頁底部的 WhatsApp 按鈕與我們專人聯繫，或是發送郵件至 topvicmo@gmail.com，我們將盡快回覆您！'
        }
    };

    // 4. 控制對話框開關
    window.toggleChat = function() {
        chatWindow.hidden = !chatWindow.hidden;
        const open = !chatWindow.hidden;
        chatButton.setAttribute('aria-expanded', String(open));
        chatButton.setAttribute('aria-label', open ? '關閉 AI 客服' : '開啟 AI 客服');
        (open ? document.getElementById('ai-chat-close') : chatButton).focus();
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !chatWindow.hidden) window.toggleChat();
    });

    // 5. 觸發問題回答
    window.sendPredefinedQuestion = function(qId) {
        if (isTyping) return;
        const data = qaDatabase[qId];
        if (!data) return;

        isTyping = true;
        appendUserMessage(data.question);
        const typingId = appendTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator(typingId);
            appendAIMessage(data.answer);
            isTyping = false;
        }, 800);
    };

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex items-end justify-end space-x-2 animate-fade-in';
        msgDiv.innerHTML = `
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-2xl rounded-tr-sm text-sm shadow-md max-w-[85%] leading-relaxed">
            </div>
        `;
        msgDiv.firstElementChild.textContent = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendAIMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex items-start space-x-2 animate-fade-in';
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div class="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700 shadow-sm max-w-[85%] leading-relaxed">
            </div>
        `;
        msgDiv.lastElementChild.textContent = text;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.className = 'flex items-start space-x-2 animate-fade-in';
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div class="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
                <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }
});
