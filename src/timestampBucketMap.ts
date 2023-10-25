/**
 * Map of buckets indexed by timestamp section
 */
export class TimestampBucketMap<T> {
  private interval: number;
  private replicationRange: number;
  private buckets: Map<number, T[]>;

  /**
   * Create a TimestampBucketMap
   *
   * @param {number} interval Interval of time in seconds each bucket stores data for
   * @param {number} replicationRange Plus-minus range of neighboring buckets to replicate data into
   */
  constructor(interval: number, replicationRange: number) {
    this.interval = interval;
    this.replicationRange = replicationRange;
    this.buckets = new Map();
  }

  put(timestamp: number, data: T) {
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
