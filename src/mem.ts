import { GCProfiler, GCProfilerResult, getHeapStatistics, HeapInfo } from 'node:v8';

export interface HeapStatsResult {
	before: HeapInfo;
	after: HeapInfo;
	delta: HeapDelta;
}

export interface HeapDelta {
	totalHeapSize: number;
	usedHeapSize: number;
	totalPhysicalSize: number;
	totalAvailableSize: number;
	heapSizeLimit: number;
	mallocedMemory: number;
	externalMemory: number;
}

export interface MemOptions {
	iterations?: number;
}

export interface GCProfilerOptions {
	timeout?: number;
	iterations?: number;
	async?: boolean;
}

const calculateHeapDelta = (before: HeapInfo, after: HeapInfo): HeapDelta => {
	return {
		totalHeapSize: after.total_heap_size - before.total_heap_size,
		usedHeapSize: after.used_heap_size - before.used_heap_size,
		totalPhysicalSize: after.total_physical_size - before.total_physical_size,
		totalAvailableSize: after.total_available_size - before.total_available_size,
		heapSizeLimit: after.heap_size_limit - before.heap_size_limit,
		mallocedMemory: after.malloced_memory - before.malloced_memory,
		externalMemory: after.external_memory - before.external_memory,
	};
};

export const v8HeapStatsWrapper = <A extends unknown[], R>(
	fn: (...args: A) => R,
	options: MemOptions = {},
	...args: A
): HeapStatsResult => {
	const heapInfoBefore = getHeapStatistics();
	const iterations = options.iterations ?? 1;
	for (let i = 0; i < iterations; i++) {
		fn(...args);
	}
	const heapInfoAfter = getHeapStatistics();

	return {
		before: heapInfoBefore,
		after: heapInfoAfter,
		delta: calculateHeapDelta(heapInfoBefore, heapInfoAfter),
	};
};

export const v8HeapStatsWrapperAsync = async <A extends unknown[], R>(
	fn: (...args: A) => Promise<R>,
	options: MemOptions = {},
	...args: A
): Promise<HeapStatsResult> => {
	const heapInfoBefore = getHeapStatistics();
	const iterations = options.iterations ?? 1;
	for (let i = 0; i < iterations; i++) {
		await fn(...args);
	}
	const heapInfoAfter = getHeapStatistics();

	return {
		before: heapInfoBefore,
		after: heapInfoAfter,
		delta: calculateHeapDelta(heapInfoBefore, heapInfoAfter),
	};
};

export const gCProfilerWrapper = async <A extends unknown[], R>(
	fn: (...args: A) => R | Promise<R>,
	options: GCProfilerOptions = {},
	...args: A
): Promise<GCProfilerResult> => {
	const timeout = options.timeout ?? 1;
	const iterations = options.iterations ?? 1;
	const isAsync = options.async ?? false;

	const prof = new GCProfiler();
	prof.start();

	if (isAsync) {
		for (let i = 0; i < iterations; i++) {
			await fn(...args);
		}
	} else {
		for (let i = 0; i < iterations; i++) {
			void fn(...args);
		}
	}

	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(prof.stop());
		}, timeout);
	});
};
