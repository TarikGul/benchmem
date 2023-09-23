import { GCProfiler, GCProfilerResult, getHeapStatistics } from 'node:v8';

export const v8HeapStatsWrapper = (fn: Function, inpt: { iterations?: number }, ...args: unknown[]) => {
	const heapInfoBefore = getHeapStatistics();
	const it = inpt.iterations ? inpt.iterations : 1;
	for (let i = 0; i < it; i++) {
		fn(...args);
	}
	const heapInfoAfter = getHeapStatistics();

	return {
		before: heapInfoBefore,
		after: heapInfoAfter,
	};
};

export const v8HeapStatsWrapperAsync = async (fn: Function, inpt: { iterations?: number }, ...args: unknown[]) => {
	const heapInfoBefore = getHeapStatistics();
	const it = inpt.iterations ? inpt.iterations : 1;
	for (let i = 0; i < it; i++) {
		await fn(...args);
	}
	const heapInfoAfter = getHeapStatistics();

	return {
		before: heapInfoBefore,
		after: heapInfoAfter,
	};
};

export const gCProfilerWrapper = async (
	fn: Function,
	inpt: { timeout?: number; iterations?: number; promise?: boolean },
	...args: unknown[]
): Promise<GCProfilerResult> => {
	const t = inpt.timeout ? inpt.timeout : 1;
	const it = inpt.iterations ? inpt.iterations : 1;
	const prof = new GCProfiler();
	return new Promise((resolve, _) => {
		prof.start();
		for (let i = 0; i < it; i++) {
			fn(...args);
		}

		setTimeout(() => {
			resolve(prof.stop());
		}, t);
	});
};
