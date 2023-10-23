chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "disableConsoleClear") {
    console.log("console.clear has been disabled.");
  }
});
