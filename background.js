// chrome.runtime.onInstalled.addListener(
//     ()=>{
//         chrome.storage.sync.get(["geminiApiKey"],(result)=>{
//             if(!result.geminiApiKey){
//                 chrome.tabs.create({url : "options.html"})
//             }
//         })
//     }
// )

chrome.action.onClicked.addListener((tab) => {
    chrome.storage.sync.get(["geminiApiKey"],(result)=>{
        if(!result.geminiApiKey){
                chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ["gemini.css"]
                }, () => {
                    chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["gemini.js"]
                    });
                });
        }else{
            chrome.scripting.insertCSS({
                target: { tabId: tab.id },
                files: ["chat.css"]
            }, () => {
                chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["chat.js"]
                });
            });
        }
    })
});
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "startChat") {

    // 1️⃣  prefer the sender’s tab if it exists
    const tabId = sender.tab ? sender.tab.id : null;

    if (tabId) {
      injectChat(tabId);
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length) injectChat(tabs[0].id);
      });
    }
  }
});

function injectChat(tabId) {
  chrome.scripting.insertCSS(
    { target: { tabId }, files: ["chat.css"] },
    () => chrome.scripting.executeScript({
      target: { tabId },
      files: ["chat.js"]
    })
  );
}
