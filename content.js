
const API_KEY = "<api key>";
const FONT_SIZE = 12;
let comments = [];
let videoId = window.location.toString().match(/v=(.*)/)[1];

// Add canvas to video player
const player = document.getElementById("movie_player").getElementsByClassName("html5-video-container")[0];
const canvas = document.createElement("canvas");
canvas.style = "width: 100%; position: absolute; pointer-events: none;";
player.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.font = `${FONT_SIZE}px Arial`;

/**
 * Retrieve comments
 * @param {*} apiKey 
 * @param {*} videoId 
 */
async function getComments(apiKey, videoId) {
	const resp = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${apiKey}&textFormat=plainText&part=snippet&videoId=${videoId}&maxResults=10`);
	const data = await resp.json();

	return data['items'].map(x => x['snippet']['topLevelComment']['snippet']['textDisplay']);
}

/**
 * Load comments
 * @param {string} videoId 
 */
function load(videoId) {
	getComments(API_KEY, videoId)
		.then(commentTexts => {
			comments = [];
			for (let v of commentTexts) {
				comments.push({
					x: Math.random() * canvas.width + canvas.width,
					y: Math.random() * (canvas.height - FONT_SIZE) + FONT_SIZE,
					speed: Math.random() * 3 + 1,
					text: v,
				});
			}
		});
}

// Load comments
chrome.runtime.onMessage.addListener(function (data, sender) {
	videoId = data.match(/v=(.*)/)[1];
	load(videoId);
});
load(videoId);


// Animate comments
let elapsed = 0;
const draw = () => {
	requestAnimationFrame(draw);

	if (elapsed > 2) {
		elapsed = 0;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let c of comments) {
			ctx.strokeText(c.text, c.x, c.y);
			ctx.fillText(c.text, c.x, c.y);
			c.x -= c.speed;
			if (c.x < -c.text.length * FONT_SIZE) {
				c.x = Math.random() * canvas.width + canvas.width;
				c.y = Math.random() * (canvas.height - FONT_SIZE) + FONT_SIZE;
				c.speed = Math.random() * 3 + 1;
			}
		}
	}
	elapsed++;
}
draw();