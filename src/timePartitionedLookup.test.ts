import { TimePartitionedLookup } from "./timePartitionedLookup";

describe("test TimePartitionedLookup", () => {
  it("should get single item when stored", () => {
    const lookup = new TimePartitionedLookup<string>(20, 0);
    lookup.put(10, "foo");

    expect(lookup.get(10)).toStrictEqual(["foo"]);
  });

  it("should get multiple items when stored in different partitions", () => {
    const lookup = new TimePartitionedLookup<string>(20, 0);
    lookup.put(10, "foo");
    lookup.put(30, "bar");

    expect(lookup.get(10)).toStrictEqual(["foo"]);
    expect(lookup.get(30)).toStrictEqual(["bar"]);
    expect(lookup.get(200)).toStrictEqual([]);
  });

  it("should get multiple items when stored in same partition", () => {
    const lookup = new TimePartitionedLookup<string>(20, 0);
    lookup.put(10, "foo");
    lookup.put(12, "bar");

    expect(lookup.get(10)).toStrictEqual(["foo", "bar"]);
    expect(lookup.get(200)).toStrictEqual([]);
  });

  it("should copy items to neighboring buckets when replication is set", () => {
    const lookup = new TimePartitionedLookup<string>(20, 2);
    lookup.put(10, "foo");

    expect(lookup.get(-30)).toStrictEqual(["foo"]);
    expect(lookup.get(-10)).toStrictEqual(["foo"]);
    expect(lookup.get(10)).toStrictEqual(["foo"]);
    expect(lookup.get(30)).toStrictEqual(["foo"]);
    expect(lookup.get(50)).toStrictEqual(["foo"]);
    expect(lookup.get(60)).toStrictEqual([]);
  });

  it("should remove all items when cleared", () => {
    const lookup = new TimePartitionedLookup<string>(20, 2);
    lookup.put(10, "foo");
    lookup.put(12, "bar");

    expect(lookup.get(10)).toStrictEqual(["foo", "bar"]);
    expect(lookup.get(30)).toStrictEqual(["foo", "bar"]);
    expect(lookup.get(60)).toStrictEqual([]);

    lookup.clear();

    expect(lookup.get(10)).toStrictEqual([]);
    expect(lookup.get(30)).toStrictEqual([]);
    expect(lookup.get(60)).toStrictEqual([]);
  });
});
