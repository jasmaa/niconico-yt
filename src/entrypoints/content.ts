import {
  FetchCommentsRequest,
  FetchCommentsResponse,
  GetSettingsResponse,
  Message,
  SetSettingsRequest,
} from "../messaging";
import { Settings } from "../settings";
import { TimePartitionedLookup } from "../timePartitionedLookup";
import { getIsVideoUrl, getVideoId, parseVideoTimestamps } from "../youtube";

interface CommentView {
  text: string;
  time: number;
  displayEntropy: number;
}

(async () => {
  const FONT_SIZE = 30;
  const COMMENT_TEXT_MAX_LENGTH = 200;
  const CANVAS_ID = "niconico-yt-canvas";
  const MAX_NUM_FETCHES = 10;

  let numFetchesLeft = MAX_NUM_FETCHES;
  let videoStream: any;
  let player: Element;
  let container: Element;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let settings: Settings;

  let videoId: string;
  let pageToken: string = null;
  let currentRawUrl = window.location.href;

  const comments = new TimePartitionedLookup<CommentView>(1, 20);

  async function updateComments() {
    if (!videoId || !canvas) {
      return;
    }

    if (numFetchesLeft <= 0) {
      return;
    }

    if (pageToken === undefined) {
      return;
    }

    numFetchesLeft--;

    const req: FetchCommentsRequest = {
      id: Message.FETCH_COMMENTS,
      args: { videoId, pageToken },
    };
    const res: FetchCommentsResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage(req, (res) => {
        resolve(res);
      });
    });

    if (res.status !== 200) {
      numFetchesLeft = 0;
      return;
    }

    pageToken = res.nextPageToken;

    for (const commentText of res.commentTexts) {
      if (commentText.length <= COMMENT_TEXT_MAX_LENGTH) {
        const videoTimestamps = parseVideoTimestamps(commentText);
        for (const videoTimestamp of videoTimestamps) {
          const comment: CommentView = {
            text: commentText,
            time: videoTimestamp,
            displayEntropy: Math.random(),
          };
          comments.put(videoTimestamp, comment);
        }
      }
    }
  }

  function initDom() {
    if (!player || !videoStream) {
      console.log("Missing player or video stream.");
      return;
    }

    container = player.getElementsByClassName("html5-video-container")[0];

    // Add canvas to video player
    canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = CANVAS_ID;
      canvas.setAttribute(
        "style",
        "width: 100%; position: absolute; pointer-events: none;"
      );
      canvas.width = player.clientWidth;
      canvas.height = player.clientHeight;
      container.appendChild(canvas);

      ctx = canvas.getContext("2d");

      // Resize canvas
      const resizeObserver = new ResizeObserver((entries) => {
        ctx.canvas.width = player.clientWidth;
        ctx.canvas.height = player.clientHeight;
        ctx.fillStyle = "white";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.font = `${FONT_SIZE}px Arial`;
      });
      resizeObserver.observe(container);
    }
  }

  function initVideo() {
    const url = new URL(window.location.href);
    if (!getIsVideoUrl(url)) {
      return;
    }

    videoId = getVideoId(url);

    if (!videoId) {
      return;
    }

    numFetchesLeft = MAX_NUM_FETCHES;
    pageToken = null;
    comments.clear();
    updateComments();
    console.log("Video initialized!");
  }

  // Init dom elements when video url and video stream and player elements are loaded.
  // This should only happen once.
  const initDomObserver = new MutationObserver(() => {
    const url = new URL(window.location.href);
    if (!getIsVideoUrl(url)) {
      return;
    }
    videoStream = document.getElementsByClassName("video-stream")[0];
    if (!videoStream) {
      return;
    }
    player = document.getElementById("movie_player");
    if (!player) {
      return;
    }
    initDom();
    initDomObserver.disconnect();
    console.log("DOM initialized!");
  });
  initDomObserver.observe(document.body, { subtree: true, childList: true });

  // Re-init video when url location changes
  new MutationObserver(() => {
    const rawUrl = window.location.href;
    if (rawUrl !== currentRawUrl) {
      initVideo();
      currentRawUrl = window.location.href;
    }
  }).observe(document, { subtree: true, childList: true });

  const draw = () => {
    requestAnimationFrame(draw);

    if (!videoStream || !canvas || !ctx) {
      return;
    }

    if (!settings) {
      return;
    }

    const currentTime = videoStream.currentTime;

    switch (settings.commentOpacity) {
      case "high":
        ctx.globalAlpha = 1;
        break;
      case "medium":
        ctx.globalAlpha = 0.6;
        break;
      case "low":
        ctx.globalAlpha = 0.3;
        break;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!settings.commentsVisible) {
      return;
    }

    const timedComments = comments.get(currentTime);
    for (const comment of timedComments) {
      let speed = 200;
      switch (settings.commentSpeed) {
        case "high":
          speed = 400;
          break;
        case "medium":
          speed = 200;
          break;
        case "low":
          speed = 100;
          break;
      }
      const x = canvas.width / 2 + speed * (comment.time - currentTime);
      const y =
        (canvas.height - FONT_SIZE) * comment.displayEntropy + FONT_SIZE;

      if (x + comment.text.length * FONT_SIZE > -20 || x < canvas.width + 20) {
        ctx.strokeText(comment.text, x, y);
        ctx.fillText(comment.text, x, y);
      }
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message.id === Message.SET_SETTINGS) {
      const req = message as SetSettingsRequest;
      settings = req.args.settings;
    }
  });

  // Fetch settings with retry
  for (let i = 0; i < 5; i++) {
    const res: GetSettingsResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          id: Message.GET_SETTINGS,
        },
        (res) => {
          resolve(res);
        }
      );
    });
    if (res) {
      settings = res.settings;
      break;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  initVideo();
  setInterval(updateComments, 2_000);
  draw();
})();
