chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const video = document.querySelector('video');
  if (message.time && video) {
    video.currentTime = message.time;
    video.play();
  }
});