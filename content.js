
const FONT_SIZE = 12;
let comments = [];

// Add canvas to video player
const player = document.getElementById("movie_player").getElementsByClassName("html5-video-container")[0];
const canvas = document.createElement("canvas");
canvas.style = "width: 100%; position: absolute; pointer-events: none;";
player.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.font = `${FONT_SIZE}px Arial`;

// Load comments
chrome.runtime.onMessage.addListener(function (data, sender) {
	comments = [];
	for (let v of data) {
		comments.push({
			x: Math.random() * canvas.width + canvas.width,
			y: Math.random() * (canvas.height - FONT_SIZE) + FONT_SIZE,
			speed: Math.random() * 3 + 1,
			text: v,
		});
	}
});

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