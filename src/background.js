const API_KEY = process.env.API_KEY;

/**
 * Fetches set of comments from video
 */
async function fetchComments(videoId, pageToken) {
  const url = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
  url.searchParams.append("key", API_KEY);
  url.searchParams.append("textFormat", "plainText");
  url.searchParams.append("part", "snippet");
  url.searchParams.append("videoId", videoId);
  url.searchParams.append("maxResults", 100);
  if (pageToken) {
    url.searchParams.append("pageToken", pageToken);
  }

  const resp = await fetch(url);
  if (resp.status !== 200) {
    return {
      status: resp.status,
      commentTexts: [],
      nextPageToken: undefined,
    };
  }

  const data = await resp.json();
  return {
    status: resp.status,
    commentTexts: data["items"].map((v) => v["snippet"]["topLevelComment"]["snippet"]["textDisplay"]),
    nextPageToken: data["nextPageToken"],
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.id === "fetch-comments") {
    (async () => {
      const { videoId, pageToken } = message.args;
      const res = await fetchComments(videoId, pageToken);
      sendResponse(res);
    })();
    return true;
  }
});
