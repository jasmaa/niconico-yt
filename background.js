
const API_KEY = "<api key>";

// Fix this for multiple videos?
let tabId = "";
let videoId = "";
let nextPageToken = "";

/**
 * Retrieve comments
 */
async function getComments() {
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${API_KEY}&textFormat=plainText&part=snippet&videoId=${videoId}&maxResults=10&pageToken=${nextPageToken}`);
    const data = await resp.json();

    nextPageToken = data['nextPageToken'];
    return data['items'].map(x => x['snippet']['topLevelComment']['snippet']['textDisplay']);
}

/**
 * Send comments to content script
 * @param {boolean} reset 
 */
function updateComments(options = {}) {
    getComments()
        .then(commentTexts => {
            chrome.tabs.sendMessage(tabId, {
                commentTexts: commentTexts,
                options: options,
            });
        });
}

function initCommentHandler(details) {

    tabId = details.tabId;
    if (details.url.match(/v=(.*)/) != null) {
        videoId = details.url.match(/v=(.*)/)[1];
        nextPageToken = "";
        updateComments({ reset: true });

        console.log(videoId);
    }
}

setInterval(updateComments, 30_000);
chrome.webNavigation.onHistoryStateUpdated.addListener(initCommentHandler);
chrome.webNavigation.onCompleted.addListener(initCommentHandler);

