# keyweaver

KeyWeaver is a lightweight utility library for generating unique string keys from nested data structures. It provides a simple and efficient way to represent complex data hierarchies as string keys, suitable for use in various scenarios such as caching, data storage, or object comparison.

## Installation

using npm:

```
npm install --save keyweaver
```

or yarn:

```
yarn add keyweaver
```

or pnpm:

```
pnpm add keyweaver
```

---

### toKey

```ts
type NestedArray = Array<PrimitiveOrNested> | ReadonlyArray<PrimitiveOrNested>;

type NestedObject = {
  [key: string | number]: PrimitiveOrNested;
};

type PrimitiveOrNested =
  | boolean
  | string
  | number
  | undefined
  | null
  | bigint
  | Date
  | NestedObject
  | NestedArray;

const toKey: (value: PrimitiveOrNested) => string;
```

Generates unique string key from provided nested objects, arrays, and primitives. It recursively traverses the input data structure, converting each element into a string representation and concatenating them with delimiters to ensure uniqueness.

```ts
import toKey from 'keyweaver';

const key = toKey({
  name: 'John Doe',
  age: 30,
  address: {
    city: 'New York',
    zip: '10001',
    street: '123 Main St',
  },
  hobbies: ['reading', 'hiking', 'coding'],
  importantDates: {
    birthday: new Date('1990-01-01'),
    anniversary: new Date('2015-07-15'),
  },
  some: { very: [{ nested: 'value' }] },
});

toKey('null') !== toKey(null); // true

toKey(1) !== toKey('1'); // true

toKey(1) !== toKey([1]); // true

toKey({ prop1: true, prop2: false }) === toKey({ prop2: false, prop1: true }); // true

toKey({ prop1: true, prop2: undefined }) === toKey({ prop1: true }); // true
```

---

## License

MIT © [Andrii Dubetskyi](https://github.com/Krombik)
