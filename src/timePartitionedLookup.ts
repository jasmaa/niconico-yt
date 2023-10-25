/**
 * Lookup of arrays indexed by time interval
 */
export class TimePartitionedLookup<T> {
  private interval: number;
  private replicationRange: number;
  private buckets: Map<number, T[]>;

  /**
   * Create a TimePartitionedLookup
   *
   * @param {number} interval Interval of time in seconds each partition stores data for
   * @param {number} replicationRange Plus-minus range of neighboring buckets to replicate data into
   */
  constructor(interval: number, replicationRange: number) {
    this.interval = interval;
    this.replicationRange = replicationRange;
    this.buckets = new Map();
  }

  put(time: number, data: T) {
    const key = Math.floor(time / this.interval);
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

  get(time: number) {
    const key = Math.floor(time / this.interval);
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
