
// Add canvas to video player
const player = document.getElementById("movie_player");
const container = player.getElementsByClassName("html5-video-container")[0];
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

let comments = [];
for (let i = 0; i < 10; i++) {
	comments.push({
		x: -10,
		y: Math.random() * (canvas.height - FONT_SIZE) + FONT_SIZE,
		speed: 0,
		text: "",
	});
}
let commentBuffer = [];

// Load comments
chrome.runtime.onMessage.addListener(function (data, sender) {

	commentBuffer = data.commentTexts;

	if (data.options.reset) {
		for (const c of comments) {
			c.x = -10;
			c.text = "";
		}
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

			// Draw and update comment
			if (c.text.length > 0) {
				ctx.strokeText(c.text, c.x, c.y);
				ctx.fillText(c.text, c.x, c.y);
				c.x -= c.speed;
			}

			// Detect if comment is off-screen
			if (c.x < -c.text.length * FONT_SIZE) {

				// Load from comment buffer
				if (commentBuffer.length > 0) {
					c.text = commentBuffer.pop();
				}

				if (c.text.length > 0) {
					c.x = Math.random() * canvas.width + canvas.width;
					c.y = Math.random() * (canvas.height - FONT_SIZE) + FONT_SIZE;
					c.speed = (Math.random() * 0.7 + 0.3) * 0.01 * canvas.width;
				}
			}
		}
	}
	elapsed++;
}
draw();