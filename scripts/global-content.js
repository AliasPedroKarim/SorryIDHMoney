let clearCount = 0;

function checkConsoleClear() {
  clearCount++;
  if (clearCount > 1) {
    console.clear = function () {};
    chrome.runtime.sendMessage({ action: "disableConsoleClear" });
  }
}

console.clear = function () {
  checkConsoleClear();
  console.clear.apply(this, arguments);
};

function handleScriptInsertions(mutationsList, observer) {
  mutationsList.forEach((mutation) => {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName && node.tagName.toLowerCase() === "script") {
          // node.textContent = node.textContent.replace(/debugger;/g, "");
          // node.textContent = script.textContent.replace(/console\.clear\(\);?/g, "");
        }
      });
    }
  });
}

const observer = new MutationObserver(handleScriptInsertions);

const config = { childList: true, subtree: true };

observer.observe(document, config);
