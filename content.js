(function() {
    'use strict';

    // --- 1. Geminiサイト上での自動送信処理 ---
    // ここで return しないように変更しました
    if (location.hostname === 'gemini.google.com') {
        const autoSubmit = () => {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');
            if (!query) return;

            const timer = setInterval(() => {
                const inputField = document.querySelector('.ql-editor[contenteditable="true"]');
                const sendButton = document.querySelector('button[aria-label*="送信"], button[aria-label*="Send"]');

                if (inputField && sendButton) {
                    clearInterval(timer);
                    inputField.focus();
                    document.execCommand('insertText', false, query);

                    setTimeout(() => {
                        sendButton.click();
                        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                        window.history.replaceState({path: cleanUrl}, '', cleanUrl);
                    }, 300);
                }
            }, 500);
            setTimeout(() => clearInterval(timer), 10000);
        };

        if (document.readyState === 'complete') autoSubmit();
        else window.addEventListener('load', autoSubmit);
    }

    // --- 2. 共通のショートカット処理 ---
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    function selectWord(x, y) {
        const active = document.activeElement;
        // 入力中（contenteditable等）は選択処理を行わない
        if (["INPUT", "TEXTAREA"].includes(active.tagName) || active.isContentEditable) return null;
        
        const sel = window.getSelection();
        const range = document.caretRangeFromPoint(x, y);
        if (range) {
            sel.removeAllRanges();
            sel.addRange(range);
            try {
                sel.modify('move', 'backward', 'word');
                sel.modify('extend', 'forward', 'word');
            } catch (e) {}
            return sel.toString().trim();
        }
        return null;
    }

    window.addEventListener('mouseup', (e) => {
        if (e.button === 0 && window.getSelection().isCollapsed) {
            setTimeout(() => selectWord(e.clientX, e.clientY), 10);
        }
    }, true);

    window.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        
        // 【重要】Geminiの入力欄でタイピングしている時はショートカットを無効化する
        // これがないと、Geminiへの質問文に「w」や「r」が含まれると誤作動します
        if (["INPUT", "TEXTAREA"].includes(active.tagName) || active.isContentEditable) return;

        const key = e.key.toLowerCase();
        function getTargetWord() {
            let word = window.getSelection().toString().trim();
            if (!word) word = selectWord(mouseX, mouseY);
            return word;
        }

        // 【wキー】Google検索
        if (key === 'w') {
            const word = getTargetWord();
            if (word) window.open(`https://www.google.com/search?q=${encodeURIComponent(word)}`, '_blank');
        }

        // 【rキー】Geminiでさらに検索
        if (key === 'r') {
            const word = getTargetWord();
            if (word) {
                const prompt = `${word} とは？`;
                window.open(`https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`, '_blank');
            }
        }

        // 【qキー】タブを閉じる
        if (key === 'q') {
            if (chrome.runtime && chrome.runtime.id) {
                chrome.runtime.sendMessage({action: "close_active_tab"});
            }
        }
    }, true);
})();