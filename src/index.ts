export type NestedArray =
  | Array<PrimitiveOrNested>
  | ReadonlyArray<PrimitiveOrNested>;

export type NestedObject = {
  [key in string | number]?: PrimitiveOrNested;
};

export type Primitive =
  | boolean
  | string
  | number
  | undefined
  | null
  | bigint
  | Date;

export type PrimitiveOrNested = Primitive | NestedObject | NestedArray;

const toKey = <T extends PrimitiveOrNested>(value: T): string => {
  const _type = typeof value;

  if (_type == 'string') {
    return value as string;
  }

  if (value && _type == 'object') {
    let str = '\0';

    if (Array.isArray(value)) {
      for (let i = value.length; i--; ) {
        str += toKey(value[i]) + '\f';
      }
    } else if (value instanceof Date) {
      str += value.getTime();
    } else {
      const keys = Object.keys(value as NestedObject).sort();

      for (let i = keys.length; i--; ) {
        const key = keys[i];

        const child = (value as NestedObject)[key];

        if (child !== undefined) {
          str += key + ':' + toKey(child) + '\v';
        }
      }
    }

    return str;
  }

  return '\b' + value;
};

export default toKey;
