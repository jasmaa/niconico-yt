import fetchMock from "jest-fetch-mock";
import {
  ListCommentThreadsResponse,
  fetchComments,
  getIsVideoUrl,
  getVideoId,
  parseVideoTimestamps,
} from "./youtube";

fetchMock.enableMocks();

describe("test parseVideoTimestamps", () => {
  it.each([
    ["0:00", [0]],
    ["02:45", [165]],
    ["1:45:13", [6313]],
    ["1:00:00:00", [3600]],
    ["0:00 0:01", [0, 1]],
    ["I like 0:05, 0:03, and 1:10", [5, 3, 70]],
    ["", []],
    ["no timestamps", []],
  ])('should convert "%s" to %s', (text, expectedTimestamps) => {
    const timestamps = parseVideoTimestamps(text);
    expect(timestamps).toStrictEqual(expectedTimestamps);
  });
});

describe("test getIsVideoUrl", () => {
  it.each([
    ["https://example.com/bad", false],
    ["https://example.com/bad/watch", false],
    ["https://example.com/watchMe", false],
    ["https://example.com", false],
    ["https://example.com/watch", true],
    ["https://example.com/watch?v=123", true],
  ])('should mark "%s" as %s', (rawUrl, expectedIsVideoUrl) => {
    const url = new URL(rawUrl);
    const isVideoUrl = getIsVideoUrl(url);
    expect(isVideoUrl).toBe(expectedIsVideoUrl);
  });
});

describe("test getVideoId", () => {
  it.each([
    ["https://example.com/watch?v=123", "123"],
    ["https://example.com/watch?v=123&foo=bar", "123"],
    ["https://example.com/watch?v=123#/", "123"],
    ["https://example.com/watch", null],
    ["https://example.com/watch?foo=bar", null],
  ])(
    'when video url is "%s" should find videoId=%s',
    (rawUrl, expectedVideoId) => {
      const url = new URL(rawUrl);
      const videoId = getVideoId(url);
      expect(videoId).toBe(expectedVideoId);
    }
  );
});

describe("test fetchComments", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should fetch some comments when no pagination token provided", async () => {
    const mockRes: ListCommentThreadsResponse = {
      kind: "youtube#commentThreadListResponse",
      etag: "testEtag",
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1,
      },
      nextPageToken: "nextPageToken",
      items: [
        {
          kind: "youtube#commentThread",
          etag: "testEtag",
          id: "commentThreadId",
          snippet: {
            channelId: "channelId",
            videoId: "videoId",
            topLevelComment: {
              kind: "youtube#comment",
              etag: "testEtag",
              id: "commentId",
              snippet: {
                authorDisplayName: "John Doe",
                authorProfileImageUrl: "https://images.example.com/johndoe.png",
                authorChannelId: {
                  value: "channelId",
                },
                videoId: "videoId",
                textDisplay: "this is a comment",
                parentId: "parentCommentId",
                canRate: true,
                viewerRating: "none",
                likeCount: 0,
                publishedAt: "2023-10-25T18:06:30Z",
                updatedAt: "2023-10-25T18:06:30Z",
              },
            },
            canReply: true,
            totalReplyCount: 0,
            isPublic: true,
          },
          replies: {
            comments: [],
          },
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockRes));
    const res = await fetchComments("testKey", "videoId", null);

    expect(res.commentTexts.length).toBe(1);
    expect(res.commentTexts[0]).toBe("this is a comment");
    expect(res.nextPageToken).toBe("nextPageToken");
  });

  it("should fetch some comments when pagination token provided", async () => {
    const mockRes: ListCommentThreadsResponse = {
      kind: "youtube#commentThreadListResponse",
      etag: "testEtag",
      pageInfo: {
        totalResults: 1,
        resultsPerPage: 1,
      },
      nextPageToken: "nextPageToken",
      items: [
        {
          kind: "youtube#commentThread",
          etag: "testEtag",
          id: "commentThreadId",
          snippet: {
            channelId: "channelId",
            videoId: "videoId",
            topLevelComment: {
              kind: "youtube#comment",
              etag: "testEtag",
              id: "commentId",
              snippet: {
                authorDisplayName: "John Doe",
                authorProfileImageUrl: "https://images.example.com/johndoe.png",
                authorChannelId: {
                  value: "channelId",
                },
                videoId: "videoId",
                textDisplay: "this is a comment",
                parentId: "parentCommentId",
                canRate: true,
                viewerRating: "none",
                likeCount: 0,
                publishedAt: "2023-10-25T18:06:30Z",
                updatedAt: "2023-10-25T18:06:30Z",
              },
            },
            canReply: true,
            totalReplyCount: 0,
            isPublic: true,
          },
          replies: {
            comments: [],
          },
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockRes));
    const res = await fetchComments("testKey", "videoId", "pageToken");

    expect(res.commentTexts.length).toBe(1);
    expect(res.commentTexts[0]).toBe("this is a comment");
    expect(res.nextPageToken).toBe("nextPageToken");
  });

  it("should fetch no comments when API error", async () => {
    fetchMock.mockResponseOnce("", { status: 403 });
    const res = await fetchComments("testKey", "videoId", "pageToken");

    expect(res.commentTexts.length).toBe(0);
    expect(res.nextPageToken).toBe(undefined);
  });
});
