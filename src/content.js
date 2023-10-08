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
		return rawTimes.reduce((acc, curr, currIdx) =>
			parseInt(acc.replace(":", "")) + curr * Math.pow(60, currIdx)
		);
	});
	return videoTimestamps;
}

(() => {
	const FONT_SIZE = 30;
	const SPEED = 200;
	const COMMENT_TEXT_MAX_LENGTH = 200;
	const CANVAS_ID = "niconico-yt-canvas";

	let videoStream;
	let player;
	let container;
	let canvas;
	let ctx;

	let comments = [];

	async function updateComments() {
		if (!videoId || !canvas) {
			return;
		}

		const res = await chrome.runtime.sendMessage({
			id: "fetch-comments",
			args: { videoId, pageToken }
		});

		for (const commentText of res.commentTexts) {
			if (commentText.length <= COMMENT_TEXT_MAX_LENGTH) {
				const videoTimestamps = parseVideoTimestamps(commentText);
				for (const videoTimestamp of videoTimestamps) {
					comments.push({
						text: commentText,
						time: videoTimestamp,
						displayEntropy: Math.random(),
					});
				}
			}
		}

		pageToken = res.nextPageToken;
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
		}

		ctx = canvas.getContext('2d');
		ctx.fillStyle = 'white';
		ctx.lineWidth = 3;
		ctx.lineCap = 'round';
		ctx.font = `${FONT_SIZE}px Arial`;
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

		pageToken = null;
		comments = [];
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
		videoStream = document.getElementsByClassName('video-stream')[0];
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

		if (!videoStream || !canvas) {
			return;
		}

		const currentTime = videoStream.currentTime;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (const comment of comments) {
			const x = canvas.width / 2 + SPEED * (comment.time - currentTime);
			const y = (canvas.height - FONT_SIZE) * comment.displayEntropy + FONT_SIZE;

			if (x + comment.text.length * FONT_SIZE > -20 || x < canvas.width + 20) {
				ctx.strokeText(comment.text, x, y);
				ctx.fillText(comment.text, x, y);
			}
		}
	}

	initVideo();
	setInterval(updateComments, 2_000);
	draw();
})()

