// content.jsからのメッセージを受け取ってタブを閉じる
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "close_active_tab") {
        // 命令を送ってきたタブ（自分自身）を閉じる
        chrome.tabs.remove(sender.tab.id);
    }
});