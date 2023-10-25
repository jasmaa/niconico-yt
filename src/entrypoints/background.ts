import { Message } from "../messaging";
import { CommentSettings, OpacityLevel, SpeedLevel } from "../settings";
import { fetchComments } from "../youtube";

const API_KEY = process.env.API_KEY;

let settings: CommentSettings = {
  commentsVisible: true,
  commentOpacity: OpacityLevel.HIGH,
  commentSpeed: SpeedLevel.HIGH,
};

/**
 * Syncs state to all content scripts
 */
function syncState() {
  const syncMessage = {
    id: "set-state",
    args: {
      state: settings,
    },
  };
  chrome.tabs.query({}, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, syncMessage);
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.id === Message.FETCH_COMMENTS) {
    (async () => {
      const { videoId, pageToken } = message.args;
      const res = await fetchComments(API_KEY, videoId, pageToken);
      sendResponse(res);
    })();
    return true;
  } else if (message.id === Message.GET_SETTINGS) {
    sendResponse(settings);
    return true;
  } else if (message.id === Message.MERGE_SETTINGS) {
    settings = { ...settings, ...message.args.state };
    syncState();
    sendResponse(settings);
    return true;
  }
});
