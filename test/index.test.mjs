import { test } from 'node:test';
import assert from 'node:assert/strict';
import toKey from '../build/index.js';

test('returns a string for any input', () => {
  for (const v of [
    'a',
    1,
    1.5,
    true,
    false,
    null,
    undefined,
    1n,
    new Date(),
    {},
    [],
    { a: [{ b: 1 }] },
  ]) {
    assert.equal(typeof toKey(v), 'string');
  }
});

test('is deterministic', () => {
  const value = { a: 1, b: ['x', { c: new Date(0), d: null }], e: 2n };
  assert.equal(toKey(value), toKey(value));
  assert.equal(
    toKey(value),
    toKey({ a: 1, b: ['x', { c: new Date(0), d: null }], e: 2n })
  );
});

test('object key order does not matter', () => {
  assert.equal(toKey({ a: 1, b: 2 }), toKey({ b: 2, a: 1 }));
  assert.equal(toKey({ a: 1, b: 2, c: 3 }), toKey({ c: 3, a: 1, b: 2 }));
  assert.equal(
    toKey({ x: { a: 1, b: 2 }, y: [{ m: 1, n: 2 }] }),
    toKey({ y: [{ n: 2, m: 1 }], x: { b: 2, a: 1 } })
  );
});

test('key order does not matter for objects with many keys', () => {
  const entries = Array.from({ length: 30 }, (_, i) => ['k' + i, i]);
  const shuffled = [...entries].reverse();
  assert.equal(
    toKey(Object.fromEntries(entries)),
    toKey(Object.fromEntries(shuffled))
  );
});

test('undefined properties are skipped', () => {
  assert.equal(toKey({ a: 1, b: undefined }), toKey({ a: 1 }));
  assert.equal(toKey({ a: undefined }), toKey({}));
});

test('undefined array elements are significant', () => {
  assert.notEqual(toKey([undefined]), toKey([]));
  assert.notEqual(toKey([undefined]), toKey([null]));
  assert.notEqual(toKey([1, undefined, 2]), toKey([1, 2]));
});

test('array order matters', () => {
  assert.notEqual(toKey([1, 2]), toKey([2, 1]));
});

test('types are distinguished', () => {
  assert.notEqual(toKey('null'), toKey(null));
  assert.notEqual(toKey('undefined'), toKey(undefined));
  assert.notEqual(toKey('true'), toKey(true));
  assert.notEqual(toKey(1), toKey('1'));
  assert.notEqual(toKey(1), toKey([1]));
  assert.notEqual(toKey(1), toKey(true));
  assert.notEqual(toKey(0), toKey(false));
  assert.notEqual(toKey({ a: 1 }), toKey([['a', 1]]));
  assert.notEqual(toKey({ a: '1' }), toKey({ a: 1 }));
});

test('structure is distinguished', () => {
  assert.notEqual(toKey(['a', 'b']), toKey(['ab']));
  assert.notEqual(toKey([['a'], 'b']), toKey(['a', ['b']]));
  assert.notEqual(toKey({ a: { b: 1 } }), toKey({ 'a:b': 1 }));
  assert.notEqual(toKey({}), toKey([]));
  assert.notEqual(toKey([[]]), toKey([{}]));
  assert.notEqual(toKey({ a: [] }), toKey({ a: {} }));
  assert.notEqual(toKey([]), toKey([undefined]));
});

test('Dates are compared by timestamp', () => {
  assert.equal(toKey(new Date(2020, 0, 1)), toKey(new Date(2020, 0, 1)));
  assert.notEqual(toKey(new Date(0)), toKey(new Date(1)));
  assert.notEqual(toKey(new Date(0)), toKey(0));
});

test('numbers: negative zero and NaN are stable', () => {
  assert.equal(toKey(-0), toKey(0));
  assert.equal(toKey(NaN), toKey(NaN));
  assert.notEqual(toKey(NaN), toKey('NaN'));
});

test('documented collision: number and bigint with same textual value', () => {
  assert.equal(toKey(1), toKey(1n));
});

test('empty object equals object with only undefined values', () => {
  assert.equal(toKey({}), toKey({ a: undefined }));
});

test('strings are returned as-is', () => {
  assert.equal(toKey('hello'), 'hello');
  assert.equal(toKey(''), '');
});

test('handles deep nesting', () => {
  const deep = { a: [{ b: [{ c: [{ d: [1, 2n, null, new Date(5)] }] }] }] };
  const same = { a: [{ b: [{ c: [{ d: [1, 2n, null, new Date(5)] }] }] }] };
  assert.equal(toKey(deep), toKey(same));
});

test('random permutation fuzz: shuffled clones always produce equal keys', () => {
  let seed = 42;
  const rnd = () => {
    seed = (Math.imul(seed, 48271) >>> 0) % 2147483647;
    return seed / 2147483647;
  };
  const prim = () => {
    const r = rnd();
    if (r < 0.3) return 'w' + ((rnd() * 100) | 0);
    if (r < 0.6) return (rnd() * 1000) | 0;
    if (r < 0.7) return rnd() < 0.5;
    if (r < 0.8) return null;
    if (r < 0.9) return undefined;
    return new Date((rnd() * 1e12) | 0);
  };
  const make = (depth) => {
    const o = {};
    for (let i = 0, n = 1 + ((rnd() * 6) | 0); i < n; i++) {
      const r = rnd();
      o['k' + ((rnd() * 20) | 0)] =
        depth > 0 && r < 0.3
          ? r < 0.15
            ? make(depth - 1)
            : Array.from({ length: (rnd() * 4) | 0 }, prim)
          : prim();
    }
    return o;
  };
  const shuffle = (v) => {
    if (typeof v !== 'object' || v === null || v instanceof Date) return v;
    if (Array.isArray(v)) return v.map(shuffle);
    const keys = Object.keys(v);
    for (let i = keys.length - 1; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    const out = {};
    for (const k of keys) out[k] = shuffle(v[k]);
    return out;
  };
  for (let i = 0; i < 500; i++) {
    const value = make(3);
    assert.equal(toKey(value), toKey(shuffle(value)));
  }
});
