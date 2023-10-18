/**
 * Checks if current url is a YouTube video url
 *
 * @param {*} YouTube video URL
 * @returns
 */
function getIsVideoUrl(url) {
  return url.pathname === "/watch";
}

/**
 * Gets video id from url
 *
 * @param {string} url YouTube video URL
 * @returns Video id or null if video id could not be found
 */
function getVideoId(url) {
  if (getIsVideoUrl(url) && url.searchParams.has("v")) {
    return url.searchParams.get("v");
  } else {
    return null;
  }
}

/**
 * Parse video timestamp in seconds from comment text
 *
 * @param {*} text Comment text
 * @returns List of video timestamps found in comment text in seconds
 */
function parseVideoTimestamps(text) {
  const results = text.matchAll(/(\d{1,2})(:\d{2}){1,2}/g);
  const videoTimestamps = [...results].map((v) => {
    const rawTimes = v.reverse().slice(0, -1);
    return rawTimes.reduce(
      (acc, curr, currIdx) =>
        parseInt(acc.replace(":", "")) + curr * Math.pow(60, currIdx)
    );
  });
  return videoTimestamps;
}

/**
 * Map of buckets indexed by timestamp section
 */
class TimestampBucketMap {
  /**
   * Create a TimestampBucketMap
   *
   * @param {*} interval Interval of time in seconds each bucket stores data for
   * @param {*} replicationRange Range of neighboring buckets to replicate data into
   */
  constructor(interval, replicationRange) {
    this.interval = interval;
    this.replicationRange = replicationRange;
    this.buckets = new Map();
  }

  put(timestamp, data) {
    const key = Math.floor(timestamp / this.interval);
    for (
      let i = key - this.replicationRange;
      i <= key + this.replicationRange;
      i++
    ) {
      let bucket = this.buckets.get(i);
      if (!bucket) {
        bucket = [];
        this.buckets.set(i, bucket);
      }
      bucket.push(data);
    }
  }

  get(timestamp) {
    const key = Math.floor(timestamp / this.interval);
    const bucket = this.buckets.get(key);
    if (bucket) {
      return bucket;
    } else {
      return [];
    }
  }

  clear() {
    this.buckets.clear();
  }
}

(() => {
  const FONT_SIZE = 30;
  const SPEED = 200;
  const COMMENT_TEXT_MAX_LENGTH = 200;
  const CANVAS_ID = "niconico-yt-canvas";
  const MAX_NUM_FETCHES = 10;

  let numFetchesLeft = MAX_NUM_FETCHES;
  let videoStream;
  let player;
  let container;
  let canvas;
  let ctx;

  const comments = new TimestampBucketMap(1, 20);

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

    const res = await chrome.runtime.sendMessage({
      id: "fetch-comments",
      args: { videoId, pageToken },
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
          const comment = {
            text: commentText,
            time: videoTimestamp,
            displayEntropy: Math.random(),
          };
          comments.put(videoTimestamp, comment);
        }
      }
    }
  }

  let currentRawUrl = window.location.href;
  let videoId;
  let pageToken = null;

  function initDom() {
    if (!player || !videoStream) {
      console.log("Missing player or video stream.");
      return;
    }

    container = player.getElementsByClassName("html5-video-container")[0];

    // Add canvas to video player
    canvas = document.getElementById(CANVAS_ID);
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = CANVAS_ID;
      canvas.style = "width: 100%; position: absolute; pointer-events: none;";
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

    const currentTime = videoStream.currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const timedComments = comments.get(currentTime);
    for (const comment of timedComments) {
      const x = canvas.width / 2 + SPEED * (comment.time - currentTime);
      const y =
        (canvas.height - FONT_SIZE) * comment.displayEntropy + FONT_SIZE;

      if (x + comment.text.length * FONT_SIZE > -20 || x < canvas.width + 20) {
        ctx.strokeText(comment.text, x, y);
        ctx.fillText(comment.text, x, y);
      }
    }
  };

  initVideo();
  setInterval(updateComments, 2_000);
  draw();
})();
