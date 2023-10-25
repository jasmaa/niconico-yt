import {
  GetSettingsRequest,
  GetSettingsResponse,
  MergeSettingsRequest,
  Message,
} from "../../messaging";
import { OpacityLevel, SpeedLevel } from "../../settings";

const commentOpacityInputEl = document.getElementById(
  "comment-opacity-input"
) as HTMLSelectElement;
const commentSpeedInputEl = document.getElementById(
  "comment-speed-input"
) as HTMLSelectElement;
const commentVisibleInputOnEl = document.getElementById(
  "comment-visible-input-on"
) as HTMLInputElement;
const commentVisibleInputOffEl = document.getElementById(
  "comment-visible-input-off"
) as HTMLInputElement;

// TODO: replace callbacks with promises

commentVisibleInputOnEl.addEventListener("change", async (e) => {
  const req: MergeSettingsRequest = {
    id: Message.MERGE_SETTINGS,
    args: {
      settings: {
        commentsVisible: true,
      },
    },
  };
  chrome.runtime.sendMessage(req);
});

commentVisibleInputOffEl.addEventListener("change", async (e) => {
  const req: MergeSettingsRequest = {
    id: Message.MERGE_SETTINGS,
    args: {
      settings: {
        commentsVisible: false,
      },
    },
  };
  chrome.runtime.sendMessage(req);
});

commentOpacityInputEl.addEventListener("change", async (e) => {
  const req: MergeSettingsRequest = {
    id: Message.MERGE_SETTINGS,
    args: {
      settings: {
        commentOpacity: (e.target as HTMLInputElement).value as OpacityLevel,
      },
    },
  };
  chrome.runtime.sendMessage(req);
});

commentSpeedInputEl.addEventListener("change", async (e) => {
  const req: MergeSettingsRequest = {
    id: Message.MERGE_SETTINGS,
    args: {
      settings: {
        commentSpeed: (e.target as HTMLInputElement).value as SpeedLevel,
      },
    },
  };
  chrome.runtime.sendMessage(req);
});

(async () => {
  const req: GetSettingsRequest = {
    id: Message.GET_SETTINGS,
  };
  chrome.runtime.sendMessage(req, (response: GetSettingsResponse) => {
    const settings = response.settings;
    commentVisibleInputOnEl.checked = !!settings.commentsVisible;
    commentVisibleInputOffEl.checked = !settings.commentsVisible;
    commentOpacityInputEl.value = settings.commentOpacity;
    commentSpeedInputEl.value = settings.commentSpeed;
  });
})();
