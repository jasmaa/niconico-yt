import { CommentSettings } from "./settings";

export enum Message {
  FETCH_COMMENTS = "fetch-comments",
  GET_SETTINGS = "get-settings",
  MERGE_SETTINGS = "merge-settings",
  SET_SETTINGS = "set-settings",
}

export interface FetchCommentsRequest {
  id: Message.FETCH_COMMENTS;
  args: {
    videoId: string;
    pageToken: string;
  };
}

export interface FetchCommentsResponse {
  status: number;
  commentTexts: string[];
  nextPageToken?: string;
}

export interface GetSettingsRequest {
  id: Message.GET_SETTINGS;
}

export interface GetSettingsResponse {
  settings: CommentSettings;
}

export interface MergeSettingsRequest {
  id: Message.MERGE_SETTINGS;
  args: {
    settings: Partial<CommentSettings>;
  };
}

export interface MergeSettingsResponse {
  settings: CommentSettings;
}

export interface SetSettingsRequest {
  id: Message.SET_SETTINGS;
  args: {
    settings: CommentSettings;
  };
}

export interface SetSettingsResponse {
  settings: CommentSettings;
}
