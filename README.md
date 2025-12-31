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
- **Statistical analysis** - Get min, max, avg, median, and standard deviation across iterations
- **Warmup iterations** - Exclude JIT compilation overhead from measurements
- **Heap statistics** - Capture V8 heap stats before/after with automatic delta calculation
- **GC profiling** - Track garbage collection events during execution
- **Async support** - All utilities support both sync and async functions
- **Zero dependencies** - Uses only Node.js built-in `v8` and `perf_hooks` modules

## Usage

### Performance Timing

```typescript
import { p } from '@tarikg/benchmem';

// Synchronous function with statistics
const result = p.perf(() => {
  // code to benchmark
}, { iterations: 100, warmup: 10 });

console.log('Total time:', result.stats.total, 'ms');
console.log('Average:', result.stats.avg, 'ms');
console.log('Median:', result.stats.median, 'ms');
console.log('Min:', result.stats.min, 'ms');
console.log('Max:', result.stats.max, 'ms');
console.log('Std Dev:', result.stats.stddev, 'ms');
console.log('Function result:', result.result);

// Asynchronous function
const asyncResult = await p.perfAsync(async () => {
  return await someAsyncOperation();
}, { iterations: 50, warmup: 5 });

console.log('Async result:', asyncResult.result);
console.log('Stats:', asyncResult.stats);
```

### Heap Statistics

```typescript
import { mem } from '@tarikg/benchmem';

// Get heap stats before and after execution with delta
const stats = mem.v8HeapStatsWrapper(() => {
  const arr = new Array(100000).fill(Math.random());
}, { iterations: 10 });

console.log('Heap before:', stats.before.used_heap_size);
console.log('Heap after:', stats.after.used_heap_size);

// Use the convenient delta object
console.log('Used heap growth:', stats.delta.usedHeapSize, 'bytes');
console.log('Total heap growth:', stats.delta.totalHeapSize, 'bytes');
console.log('External memory change:', stats.delta.externalMemory, 'bytes');

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

Measures execution time of a synchronous function with detailed statistics.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => R` | Function to benchmark |
| `options.iterations` | `number` | Number of measured iterations (default: 1) |
| `options.warmup` | `number` | Number of warmup iterations (default: 0) |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `PerfResult<R>`
```typescript
{
  stats: {
    total: number;      // Total time in ms
    min: number;        // Minimum iteration time
    max: number;        // Maximum iteration time
    avg: number;        // Average iteration time
    median: number;     // Median iteration time
    stddev: number;     // Standard deviation
    iterations: number; // Number of measured iterations
    warmupIterations: number;
    times: number[];    // Individual iteration times
  };
  result: R;            // Return value of the last iteration
}
```

#### `p.perfAsync(fn, options, ...args)`

Async version of `perf()` for benchmarking asynchronous functions.

**Returns:** `Promise<PerfResult<R>>`

### Memory Module (`mem`)

#### `mem.v8HeapStatsWrapper(fn, options, ...args)`

Captures V8 heap statistics before and after function execution.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => R` | Function to profile |
| `options.iterations` | `number` | Number of iterations (default: 1) |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `HeapStatsResult`
```typescript
{
  before: HeapInfo;     // V8 heap stats before execution
  after: HeapInfo;      // V8 heap stats after execution
  delta: {
    totalHeapSize: number;
    usedHeapSize: number;
    totalPhysicalSize: number;
    totalAvailableSize: number;
    heapSizeLimit: number;
    mallocedMemory: number;
    externalMemory: number;
  };
}
```

#### `mem.v8HeapStatsWrapperAsync(fn, options, ...args)`

Async version of `v8HeapStatsWrapper`.

**Returns:** `Promise<HeapStatsResult>`

#### `mem.gCProfilerWrapper(fn, options, ...args)`

Profiles garbage collection events during function execution.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `(...args: A) => R \| Promise<R>` | Function to profile |
| `options.iterations` | `number` | Number of iterations (default: 1) |
| `options.timeout` | `number` | Time in ms to wait for GC events (default: 1) |
| `options.async` | `boolean` | Set to `true` for async functions |
| `...args` | `A` | Arguments to pass to the function |

**Returns:** `Promise<GCProfilerResult>` - Contains `statistics` array with GC events

## Requirements

- Node.js >= 18.0.0

## License

MIT
