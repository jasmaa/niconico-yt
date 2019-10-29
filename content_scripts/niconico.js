
const player = document.getElementsByClassName("html5-video-container")[0];

const canvas = document.createElement("canvas");
canvas.style = "width: 100%; position: absolute; pointer-events: none; zIndex: 9000;";
player.appendChild(canvas);

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';

const draw = (e) => {
	requestAnimationFrame(draw);

	ctx.clearRect(0, 0, 300, 300);
	ctx.fillRect(300*Math.random(), 300*Math.random(), 20, 20);
}
draw();