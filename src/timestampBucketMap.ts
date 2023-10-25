// TODO: replace any with generic

/**
 * Map of buckets indexed by timestamp section
 */
export class TimestampBucketMap {
  private interval: number;
  private replicationRange: number;
  private buckets: Map<number, any[]>;

  /**
   * Create a TimestampBucketMap
   *
   * @param {*} interval Interval of time in seconds each bucket stores data for
   * @param {*} replicationRange Range of neighboring buckets to replicate data into
   */
  constructor(interval: number, replicationRange: number) {
    this.interval = interval;
    this.replicationRange = replicationRange;
    this.buckets = new Map();
  }

  put(timestamp: number, data: any) {
    const key = Math.floor(timestamp / this.interval);
    for (
      let i = key - this.replicationRange;
      i <= key + this.replicationRange;
      i++
    ) {
      let bucket = this.buckets.get(i);
      if (!bucket) {
        bucket = [];
        this.buckets.set(i, bucket);
      }
      bucket.push(data);
    }
  }

  get(timestamp: number) {
    const key = Math.floor(timestamp / this.interval);
    const bucket = this.buckets.get(key);
    if (bucket) {
      return bucket;
    } else {
      return [];
    }
  }

  clear() {
    this.buckets.clear();
  }
}
