# BenchMem

Lightweight Node.js library for benchmarking performance timing and memory profiling. Zero external dependencies - uses only Node.js built-in APIs.

## Installation

```bash
npm install @tarikg/benchmem
# or
yarn add @tarikg/benchmem
```

## Features

- **Performance timing** - Measure function execution time with configurable iterations
- **Heap statistics** - Capture V8 heap stats before and after function execution
- **GC profiling** - Track garbage collection events during execution
- **Async support** - All utilities support both sync and async functions
- **Zero dependencies** - Uses only Node.js built-in `v8` and `perf_hooks` modules

## Usage

### Performance Timing

```typescript
import { p } from '@tarikg/benchmem';

// Synchronous function
const timeMs = p.perf(() => {
  // code to benchmark
}, { iterations: 100 });
console.log(`Execution took ${timeMs}ms`);

// Asynchronous function
const asyncTimeMs = await p.perfAsync(async () => {
  await someAsyncOperation();
}, { iterations: 50 });
```

### Heap Statistics

```typescript
import { mem } from '@tarikg/benchmem';

// Get heap stats before and after execution
const stats = mem.v8HeapStatsWrapper(() => {
  const arr = new Array(100000).fill(Math.random());
}, { iterations: 10 });

console.log('Heap before:', stats.before.used_heap_size);
console.log('Heap after:', stats.after.used_heap_size);
console.log('Heap growth:', stats.after.used_heap_size - stats.before.used_heap_size);

// Async version
const asyncStats = await mem.v8HeapStatsWrapperAsync(async () => {
  await fetchData();
}, { iterations: 5 });
```

### GC Profiling

```typescript
import { mem } from '@tarikg/benchmem';

// Profile garbage collection events
const profile = await mem.gCProfilerWrapper(() => {
  const arr = new Array(100000);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = Math.floor(Math.random() * 1000000);
  }
}, { iterations: 10, timeout: 3000 });

console.log('GC events:', profile.statistics);
// Shows events like: { gcType: 'Scavenge', cost: 1.5, ... }

// For async functions
const asyncProfile = await mem.gCProfilerWrapper(async () => {
  await processLargeDataset();
}, { iterations: 5, timeout: 5000, async: true });
```

## API Reference

### Performance Module (`p`)

#### `p.perf(fn, options, ...args)`

Measures execution time of a synchronous function.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => R` | Function to benchmark |
| `options` | `{ iterations?: number }` | Number of iterations (default: 1) |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `number` - Total execution time in milliseconds

#### `p.perfAsync(fn, options, ...args)`

Measures execution time of an asynchronous function.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => Promise<R>` | Async function to benchmark |
| `options` | `{ iterations?: number }` | Number of iterations (default: 1) |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `Promise<number>` - Total execution time in milliseconds

### Memory Module (`mem`)

#### `mem.v8HeapStatsWrapper(fn, options, ...args)`

Captures V8 heap statistics before and after function execution.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => R` | Function to profile |
| `options` | `{ iterations?: number }` | Number of iterations (default: 1) |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `{ before: HeapStatistics, after: HeapStatistics }`

#### `mem.v8HeapStatsWrapperAsync(fn, options, ...args)`

Async version of `v8HeapStatsWrapper`.

**Returns:** `Promise<{ before: HeapStatistics, after: HeapStatistics }>`

#### `mem.gCProfilerWrapper(fn, options, ...args)`

Profiles garbage collection events during function execution.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => R` | Function to profile |
| `options.iterations` | `number` | Number of iterations (default: 1) |
| `options.timeout` | `number` | Time in ms to wait for GC events (default: 1) |
| `options.async` | `boolean` | Set to `true` for async functions |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `Promise<GCProfilerResult>` - Contains `statistics` array with GC events

## Requirements

- Node.js >= 18.0.0

## License

MIT
