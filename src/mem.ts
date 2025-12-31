import { GCProfiler, GCProfilerResult, getHeapStatistics, HeapInfo } from 'node:v8';

export interface HeapStatsResult {
	before: HeapInfo;
	after: HeapInfo;
}

export interface PerfOptions {
	iterations?: number;
}

export interface GCProfilerOptions {
	timeout?: number;
	iterations?: number;
	async?: boolean;
}

export const v8HeapStatsWrapper = <A extends unknown[], R>(
	fn: (...args: A) => R,
	options: PerfOptions = {},
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
	};
};

export const v8HeapStatsWrapperAsync = async <A extends unknown[], R>(
	fn: (...args: A) => Promise<R>,
	options: PerfOptions = {},
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
