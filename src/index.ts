export type NestedArray =
  Array<PrimitiveOrNested> | ReadonlyArray<PrimitiveOrNested>;

export type NestedObject = {
  [key in string | number]?: PrimitiveOrNested;
};

export type Primitive =
  boolean | string | number | undefined | null | bigint | Date;

export type PrimitiveOrNested = Primitive | NestedObject | NestedArray;

const isArray = Array.isArray;

const keysOf = Object.keys;

const toKey = (value: PrimitiveOrNested): string => {
  switch (typeof value) {
    case 'string':
      return value;
    case 'object': {
      if (value === null) return '\bnull';

      if (isArray(value)) {
        let str = '\f';

        for (let i = 0; i < value.length; i++) {
          str += toKey(value[i]);
          str += '\f';
        }

        return str;
      }

      if (value instanceof Date) return '\0' + value.getTime();

      let str = '\0';

      const keys = keysOf(value);

      const n = keys.length;

      // insertion sort: beats Array#sort dispatch on the tiny objects that
      // dominate; already-sorted keys cost n-1 compares, zero writes
      for (let i = 1; i < n; i++) {
        const k = keys[i];

        let j = i - 1;

        if (keys[j] > k) {
          do {
            keys[j + 1] = keys[j];
          } while (j-- && keys[j] > k);

          keys[j + 1] = k;
        }
      }

      for (let i = 0; i < n; i++) {
        const child = (value as NestedObject)[keys[i]];

        if (child !== undefined) {
          str += keys[i];
          str += ':';
          str += toKey(child);
          str += '\v';
        }
      }

      return str;
    }
    default:
      return '\b' + value;
  }
};

export default toKey;
