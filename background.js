
const API_KEY = "<api key>";
let videoTabs = {};

/**
 * Fetches set of comments from video
 * @param {string} tabId Youtube video id
 * @param {object} param1 Video object
 */
async function fetchComments(tabId, { videoId, nextPageToken }) {
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?key=${API_KEY}&textFormat=plainText&part=snippet&videoId=${videoId}&maxResults=10&pageToken=${nextPageToken}`);
    const data = await resp.json();

    const token = data['nextPageToken'] == undefined ? "" : data['nextPageToken'];
    videoTabs[tabId] = { videoId: videoId, nextPageToken: token };
    return data['items'].map(x => x['snippet']['topLevelComment']['snippet']['textDisplay']);
}

/**
 * Gets video id from url
 * @param {string} url 
 */
function getVideoId(url) {
    if (url.match(/youtube\.com\/watch/)) {
        const videoId = url.match(/v=(.*)/)
        if (videoId) {
            return videoId[1]
        }
    }
    return null;
}

/**
 * Updates content script with new comments
 * 
 * @param {string} tabId 
 * @param {object} video 
 * @param {object} options 
 */
function updateComments(tabId, video, options = { reset: false }) {
    fetchComments(tabId, video)
        .then(commentTexts => {
            chrome.tabs.sendMessage(parseInt(tabId), {
                commentTexts: commentTexts,
                options: options,
            });
        });
}

/**
 * Initializes video comments
 * 
 * @param {object} details 
 */
function initVideoHandler(details) {
    const videoId = getVideoId(details.url);
    if (videoId) {
        videoTabs[details.tabId] = { videoId: videoId, nextPageToken: "" };
        updateComments(details.tabId, videoTabs[details.tabId], { reset: true });
    }
}

/**
 * Updates video comments
 */
function updateHandler() {
    for (const tabId in videoTabs) {
        updateComments(tabId, videoTabs[tabId]);
    }
}


chrome.tabs.query({currentWindow: true}, tabs => {
    for (const tab of tabs) {
        const videoId = getVideoId(tab.url);
        if (videoId) {
            videoTabs[tab.id] = { videoId: videoId, nextPageToken: "" };
            updateComments(tab.id, videoTabs[tab.id], { reset: true });
        }
    }
});

setInterval(updateHandler, 30_000);

chrome.tabs.onRemoved.addListener((tabId, _) => { delete videoTabs[tabId] });
chrome.webNavigation.onCompleted.addListener(initVideoHandler);
chrome.webNavigation.onHistoryStateUpdated.addListener(initVideoHandler);