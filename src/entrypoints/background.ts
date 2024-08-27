import {
  FetchCommentsRequest,
  GetSettingsResponse,
  MergeSettingsRequest,
  MergeSettingsResponse,
  Message,
  SetSettingsRequest,
} from "../messaging";
import { Settings, OpacityLevel, SpeedLevel } from "../settings";
import { fetchComments } from "../youtube";

const API_KEY = process.env.API_KEY;

const DEFAULT_SETTINGS: Settings = {
  commentsVisible: true,
  commentOpacity: OpacityLevel.HIGH,
  commentSpeed: SpeedLevel.HIGH,
};

let settings: Settings;

/**
 * Syncs settings to all content scripts and storage
 */
function syncSettings() {
  const req: SetSettingsRequest = {
    id: Message.SET_SETTINGS,
    args: {
      settings,
    },
  };
  chrome.tabs.query({}, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, req);
    }
  });
  chrome.storage.local.set({
    settings: settings,
  });
}

/**
 * Load settings from local storage
 */
async function loadSettings() {
  const res = (await new Promise((resolve, reject) => {
    chrome.storage.local.get("settings", (res) => {
      resolve(res);
    });
  })) as any;
  settings = res.settings
    ? (res.settings as Settings)
    : { ...DEFAULT_SETTINGS };
}

(async () => {
  await loadSettings();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.id === Message.FETCH_COMMENTS) {
      (async () => {
        const req = message as FetchCommentsRequest;
        const { videoId, pageToken } = req.args;
        const res = await fetchComments(API_KEY, videoId, pageToken);
        sendResponse(res);
      })();
      return true;
    } else if (message.id === Message.GET_SETTINGS) {
      const res: GetSettingsResponse = {
        settings,
      };
      sendResponse(res);
      return true;
    } else if (message.id === Message.MERGE_SETTINGS) {
      const req = message as MergeSettingsRequest;
      settings = { ...settings, ...req.args.settings };
      syncSettings();
      const res: MergeSettingsResponse = {
        settings,
      };
      sendResponse(res);
      return true;
    }
  });
})();
