
const API_KEY = "<api key>";

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

function updateCommentHandler(details) {
    const VIDEO_ID = details.url.match(/v=(.*)/)[1];
    getComments(API_KEY, VIDEO_ID)
        .then(commentTexts => {
            console.log(commentTexts);
            chrome.tabs.sendMessage(details.tabId, commentTexts);
        });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(updateCommentHandler);
chrome.webNavigation.onCompleted.addListener(updateCommentHandler);

