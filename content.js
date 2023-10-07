/**
 * Gets video id from url
 * @param {string} url YouTube video URL
 */
function getVideoId() {
	const url = new URL(window.location.href);
	if (url.searchParams.has("v")) {
		return url.searchParams.get("v");
	} else {
		throw new Error("could not get video id")
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
	const videoStream = document.getElementsByClassName('video-stream')[0];
	const player = document.getElementById("movie_player");
	const container = player.getElementsByClassName("html5-video-container")[0];

	// Add canvas to video player
	const canvas = document.createElement("canvas");
	canvas.style = "width: 100%; position: absolute; pointer-events: none;";
	canvas.width = player.clientWidth;
	canvas.height = player.clientHeight;
	container.appendChild(canvas);

	const ctx = canvas.getContext('2d');
	const FONT_SIZE = 30;
	ctx.fillStyle = 'white';
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.font = `${FONT_SIZE}px Arial`;

	const SPEED = 100;
	const COMMENT_TEXT_MAX_LENGTH = 200;

	let comments = [];

	let currentUrl = window.location.href;
	let videoId = getVideoId();
	let pageToken = null;
	new MutationObserver(() => {
		const url = window.location.href;
		if (url !== currentUrl) {
			currentUrl = window.location.href;
			videoId = getVideoId();
			pageToken = null;
			comments = [];
			updateComments();
		}
	}).observe(document, { subtree: true, childList: true });

	async function updateComments() {
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
					});
				}
			}
		}

		pageToken = res.nextPageToken
		console.log(res);
	}

	updateComments();
	setInterval(updateComments, 1_000);

	const draw = () => {
		requestAnimationFrame(draw);

		const currentTime = videoStream.currentTime;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeText(currentTime, 20, 20);
		ctx.fillText(currentTime, 20, 20);

		for (const comment of comments) {
			const x = canvas.width / 2 + SPEED * (comment.time - currentTime);
			const y = (comment.text.length * 50) % (canvas.height - 20) + 10; // TODO: add more entropy
			ctx.strokeText(comment.text, x, y);
			ctx.fillText(comment.text, x, y);
		}
	}
	draw();
})()

