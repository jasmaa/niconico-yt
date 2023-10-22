// TODO: replace callbacks with promises

const commentOpacityInputEl = document.getElementById("comment-opacity-input");
const commentSpeedInputEl = document.getElementById("comment-speed-input");
const commentVisibleInputOnEl = document.getElementById(
  "comment-visible-input-on"
);
const commentVisibleInputOffEl = document.getElementById(
  "comment-visible-input-off"
);
const testContent = document.getElementById("test-content");

commentVisibleInputOnEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: "merge-state",
    args: {
      state: {
        commentsVisible: true,
      },
    },
  });
});

commentVisibleInputOffEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: "merge-state",
    args: {
      state: {
        commentsVisible: false,
      },
    },
  });
});

commentOpacityInputEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: "merge-state",
    args: {
      state: {
        commentOpacity: e.target.value,
      },
    },
  });
});

commentSpeedInputEl.addEventListener("change", async (e) => {
  chrome.runtime.sendMessage({
    id: "merge-state",
    args: {
      state: {
        commentSpeed: e.target.value,
      },
    },
  });
});

(async () => {
  chrome.runtime.sendMessage(
    {
      id: "get-state",
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
