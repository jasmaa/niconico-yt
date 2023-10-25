import { Message } from "../../messaging";

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
  chrome.runtime.sendMessage({
    id: Message.MERGE_SETTINGS,
    args: {
      state: {
        commentsVisible: true,
      },
    },
  });
});

commentVisibleInputOffEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: Message.MERGE_SETTINGS,
    args: {
      state: {
        commentsVisible: false,
      },
    },
  });
});

commentOpacityInputEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: Message.MERGE_SETTINGS,
    args: {
      state: {
        commentOpacity: (e.target as HTMLInputElement).value,
      },
    },
  });
});

commentSpeedInputEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: Message.MERGE_SETTINGS,
    args: {
      state: {
        commentSpeed: (e.target as HTMLInputElement).value,
      },
    },
  });
});

(async () => {
  chrome.runtime.sendMessage(
    {
      id: Message.GET_SETTINGS,
    },
    (response) => {
      const state = response;
      commentVisibleInputOnEl.checked = !!state.commentsVisible;
      commentVisibleInputOffEl.checked = !state.commentsVisible;
      commentOpacityInputEl.value = state.commentOpacity;
      commentSpeedInputEl.value = state.commentSpeed;
    }
  );
})();
