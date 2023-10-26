import { FetchCommentsResponse } from "./messaging";

// https://developers.google.com/youtube/v3/docs/commentThreads/list
export interface ListCommentThreadsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: CommentThread[];
}

// https://developers.google.com/youtube/v3/docs/commentThreads#resource
export interface CommentThread {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    channelId: string;
    videoId: string;
    topLevelComment: Comment;
    canReply: boolean;
    totalReplyCount: number;
    isPublic: boolean;
  };
  replies: {
    comments: Comment[];
  };
}

// https://developers.google.com/youtube/v3/docs/comments#resource
export interface Comment {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl?: string;
    authorChannelId: {
      value: string;
    };
    videoId?: string;
    textDisplay: string;
    textOriginal?: string;
    parentId?: string;
    canRate: boolean;
    viewerRating: string;
    likeCount: number;
    moderationStatus?: string;
    publishedAt: string;
    updatedAt: string;
  };
}

/**
 * Fetches set of comments from video
 *
 * @param key YouTube API key
 * @param videoId Video id
 * @param pageToken Pagination token
 * @returns List of comment texts
 */
export async function fetchComments(
  key: string,
  videoId: string,
  pageToken: string
): Promise<FetchCommentsResponse> {
  const url = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
  url.searchParams.append("key", key);
  url.searchParams.append("textFormat", "plainText");
  url.searchParams.append("part", "snippet");
  url.searchParams.append("videoId", videoId);
  url.searchParams.append("maxResults", "100");
  if (pageToken) {
    url.searchParams.append("pageToken", pageToken);
  }

  const resp = await fetch(url.toString());
  if (resp.status !== 200) {
    return {
      status: resp.status,
      commentTexts: [],
      nextPageToken: undefined,
    };
  }

  const data: ListCommentThreadsResponse = await resp.json();
  return {
    status: resp.status,
    commentTexts: data.items.map(
      (v) => v.snippet.topLevelComment.snippet.textDisplay
    ),
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Checks if current url is a YouTube video url
 *
 * @param {URL} YouTube video URL
 * @returns
 */
export function getIsVideoUrl(url: URL) {
  return url.pathname === "/watch";
}

/**
 * Gets video id from url
 *
 * @param {URL} url YouTube video URL
 * @returns Video id or null if video id could not be found
 */
export function getVideoId(url: URL) {
  if (getIsVideoUrl(url) && url.searchParams.has("v")) {
    return url.searchParams.get("v");
  } else {
    return null;
  }
}

/**
 * Parse video timestamp in seconds from comment text
 *
 * @param {*} text Comment text
 * @returns List of video timestamps found in comment text in seconds
 */
export function parseVideoTimestamps(text: string) {
  const results = text.matchAll(/(\d{1,2})(:\d{2})(:\d{2})?/g);
  const videoTimestamps = [...results].map((v) => {
    return [...v]
      .reverse()
      .slice(0, -1)
      .filter((v) => v)
      .map((v) => parseInt(v.replace(":", "")))
      .reduce((acc, curr, currIdx) => acc + curr * Math.pow(60, currIdx), 0);
  });
  return videoTimestamps;
}
