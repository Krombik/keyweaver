<div align="center">

# 🧶 keyweaver

**Turn any nested data into a stable string key.**

[![npm version](https://img.shields.io/npm/v/keyweaver.svg)](https://www.npmjs.com/package/keyweaver)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/keyweaver)](https://bundlephobia.com/package/keyweaver)
[![license](https://img.shields.io/npm/l/keyweaver.svg)](https://github.com/Krombik/keyweaver/blob/main/LICENSE)

</div>

---

**keyweaver** converts any nested data structure — objects, arrays, primitives, Dates — into a stable string key: the same data always produces the same key, no matter the object key order (`{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` are equal). Perfect for cache keys, memoization and deduplication.

- ⚡ **Fast** — millions of keys per second, see [benchmarks](#-benchmarks)
- 🔒 **Stable** — object key order is ignored, `undefined` properties are skipped
- 🎯 **Type-aware** — `1`, `'1'` and `[1]` produce different keys
- 🪶 **Tiny** — under 0.5 kB minzipped, zero dependencies
- 📦 **Universal** — ESM + CJS, browser and Node
- 🛡️ **Typed** — written in TypeScript

## 📥 Installation

using pnpm:

```
pnpm add keyweaver
```

or yarn:

```
yarn add keyweaver
```

or npm:

```
npm install --save keyweaver
```

## 🚀 Usage

```ts
import toKey from 'keyweaver';

const key = toKey({
  name: 'John Doe',
  age: 30,
  address: {
    city: 'New York',
    zip: '10001',
  },
  hobbies: ['reading', 'hiking', 'coding'],
  birthday: new Date('1990-01-01'),
});

// use it as a Map/cache key
cache.set(key, result);
```

### Guarantees

```ts
// object key order doesn't matter
toKey({ a: true, b: false }) === toKey({ b: false, a: true });

// undefined properties are skipped
toKey({ a: true, b: undefined }) === toKey({ a: true });

// types are distinguished
toKey('null') !== toKey(null);
toKey(1) !== toKey('1');
toKey(1) !== toKey([1]);
toKey({ a: 1 }) !== toKey([['a', 1]]);

// Dates are compared by timestamp
toKey(new Date(2020, 0, 1)) === toKey(new Date(2020, 0, 1));
```

## 📊 Benchmarks

Node 22, Apple Silicon, single `toKey` call:

| scenario                            | time per call |     ops/sec |
| ----------------------------------- | ------------: | ----------: |
| flat object (1–5 keys)              |       ~180 ns |       ~5.5M |
| nested object (3 levels, arrays)    |       ~330 ns |       ~3.0M |
| array of primitives                 |       ~210 ns |       ~4.7M |
| primitive (number / boolean / Date) |        ~20 ns |        ~50M |
| string                              |         ~7 ns |       ~139M |

## 📖 API

```ts
type NestedArray = Array<PrimitiveOrNested> | ReadonlyArray<PrimitiveOrNested>;

type NestedObject = {
  [key: string | number]: PrimitiveOrNested;
};

type Primitive = boolean | string | number | undefined | null | bigint | Date;

type PrimitiveOrNested = Primitive | NestedObject | NestedArray;

const toKey: (value: PrimitiveOrNested) => string;
```

### Notes

- Keys are one-way: they are not designed to be parsed back into the original value.
- Keys use rare control characters (`\0`, `\b`, `\f`, `\v`) as delimiters — collisions are possible only if your strings contain these characters in adversarial positions.
- A `number` and a `bigint` with the same textual value produce the same key (`toKey(1) === toKey(1n)`).

## 📄 License

MIT © [Andrii Dubetskyi](https://github.com/Krombik)
