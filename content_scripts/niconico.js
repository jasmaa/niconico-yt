
const API_KEY = "<api key>";
const URL = window.location.toString();
const VIDEO_ID = URL.match(/v=(.*)$/)[1];

async function getComments(apiKey, videoId) {
	const resp = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${apiKey}&textFormat=plainText&part=snippet&videoId=${videoId}&maxResults=50`);
	const data = await resp.json();

	return data['items'].map(x => x['snippet']['topLevelComment']['snippet']['textDisplay']);
}

// Add canvas to video player
const player = document.getElementById("movie_player").getElementsByClassName("html5-video-container")[0];
const canvas = document.createElement("canvas");
canvas.style = "width: 100%; position: absolute; pointer-events: none; zIndex: 9000;";
player.appendChild(canvas);


let comments;
getComments(API_KEY, VIDEO_ID)
	.then(data => {
		comments = data;
	})

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';

const draw = () => {
	//requestAnimationFrame(draw);

	ctx.clearRect(0, 0, 300, 300);

	getComments(API_KEY, VIDEO_ID)
		.then(comments => {
			ctx.fillText(comments, 10, 20);
		})
		.catch(err => {
			ctx.fillText(err, 10, 80);
		});

	//ctx.fillRect(300*Math.random(), 300*Math.random(), 20, 20);
}
draw();