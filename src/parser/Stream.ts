class Stream {
  iterable: string | Array<string>;
  cursor: number;
  length: number;

  constructor(
    iterable: string | Array<string>,
    cursor?: number,
    length?: number
  ) {
    this.iterable = iterable;
    this.cursor = cursor || 0;
    this.length = length === undefined ? iterable.length - this.cursor : length;
  }

  head(): string {
    if (this.length <= 0) {
      throw new TypeError("index out of range");
    }
    return this.iterable[this.cursor];
  }

  move(distance: number): Stream {
    return new Stream(
      this.iterable,
      this.cursor + distance,
      this.length - distance
    );
  }

  slice(start: number, stop?: number): Stream {
    if (stop < start) {
      throw new Error("stop < start");
    }
    if (stop && stop > this.length) {
      throw new TypeError("index out of range");
    }
    return new Stream(
      this.iterable,
      this.cursor + start,
      (stop || this.length) - start
    );
  }
}

export default Stream;
