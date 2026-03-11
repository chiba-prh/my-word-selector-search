(function() {
    'use strict';

    let mouseX = 0, mouseY = 0;

    // マウス位置を追跡
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // 単語を選択する共通関数
    function selectWord(x, y) {
        const active = document.activeElement;
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

    // クリック（mouseup）時の動作：選択のみ
    window.addEventListener('mouseup', (e) => {
        if (e.button === 0 && window.getSelection().isCollapsed) {
            setTimeout(() => selectWord(e.clientX, e.clientY), 10);
        }
    }, true);

    // キーボード操作
    window.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        // 入力フォーム等では無効化
        if (["INPUT", "TEXTAREA"].includes(active.tagName) || active.isContentEditable) return;

        const key = e.key.toLowerCase();

        // 【wキー】検索（元のeから変更）
        if (key === 'w') {
            const word = selectWord(mouseX, mouseY);
            if (word && word.length > 0) {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(word)}`;
                window.open(searchUrl, '_blank');
            }
        }

        // 【qキー】タブを閉じる（元のwから変更）
        if (key === 'q') {
            if (chrome.runtime && chrome.runtime.id) {
                chrome.runtime.sendMessage({action: "close_active_tab"});
            }
        }
    }, true);
})();