document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const url = new URL(tab.url);
    const hostname = url.hostname;
    let app = "Unknown App";

    if (hostname.includes("youtube.com")) app = "YouTube";
    else if (hostname.includes("netflix.com")) app = "Netflix";
    else if (hostname.includes("ibomma")) app = "iBomma";
    else if (hostname.includes("chat.openai.com")) app = "ChatGPT";

    document.getElementById("appName").textContent = "Detected App: " + app;

    const videoId = app + ":" + (url.searchParams.get("v") || url.pathname);

    chrome.storage.sync.get([videoId], (result) => {
      const bookmarks = result[videoId] || [];
      const list = document.getElementById('bookmarkList');
      list.innerHTML = '';

      bookmarks.forEach((b) => {
        const li = document.createElement('li');
        li.textContent = `${b.title} (${b.time}s)`;
        li.addEventListener('click', () => {
          chrome.tabs.sendMessage(tab.id, { time: b.time });
        });
        list.appendChild(li);
      });
    });

    document.getElementById('saveBookmark').addEventListener('click', () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const video = document.querySelector('video');
          return video ? video.currentTime : window.scrollY;
        }
      }, (injectionResults) => {
        const timestamp = Math.floor(injectionResults[0].result);
        const title = document.getElementById('bookmarkTitle').value || `Bookmark @ ${timestamp}`;
        const bookmark = { time: timestamp, title };

        chrome.storage.sync.get([videoId], (result) => {
          const bookmarks = result[videoId] || [];
          bookmarks.push(bookmark);
          chrome.storage.sync.set({ [videoId]: bookmarks }, () => location.reload());
        });
      });
    });
  });
});