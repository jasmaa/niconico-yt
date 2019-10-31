
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

function updateComments(reset=false) {
    getComments()
        .then(commentTexts => {
            chrome.tabs.sendMessage(tabId, {
                reset: reset,
                commentTexts: commentTexts,
            });
        });
}

function initCommentHandler(details) {
    tabId = details.tabId;
    videoId = details.url.match(/v=(.*)/)[1];
    nextPageToken = "";
    updateComments(true);
}

setInterval(updateComments, 30_000);
chrome.webNavigation.onHistoryStateUpdated.addListener(initCommentHandler);
chrome.webNavigation.onCompleted.addListener(initCommentHandler);

