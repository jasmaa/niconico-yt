export enum OpacityLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum SpeedLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export interface Settings {
  commentsVisible: boolean;
  commentOpacity: OpacityLevel;
  commentSpeed: SpeedLevel;
}
