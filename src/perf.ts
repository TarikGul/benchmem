export interface PerfOptions {
	iterations?: number;
	warmup?: number;
}

export interface PerfStats {
	total: number;
	min: number;
	max: number;
	avg: number;
	median: number;
	stddev: number;
	iterations: number;
	warmupIterations: number;
	times: number[];
}

export interface PerfResult<R> {
	stats: PerfStats;
	result: R;
}

const calculateStats = (times: number[], warmupIterations: number): PerfStats => {
	const total = times.reduce((sum, t) => sum + t, 0);
	const min = Math.min(...times);
	const max = Math.max(...times);
	const avg = total / times.length;

	const sorted = [...times].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

	const squaredDiffs = times.map((t) => Math.pow(t - avg, 2));
	const avgSquaredDiff = squaredDiffs.reduce((sum, d) => sum + d, 0) / times.length;
	const stddev = Math.sqrt(avgSquaredDiff);

	return {
		total,
		min,
		max,
		avg,
		median,
		stddev,
		iterations: times.length,
		warmupIterations,
		times,
	};
};

export const perf = <A extends unknown[], R>(
	fn: (...args: A) => R,
	options: PerfOptions = {},
	...args: A
): PerfResult<R> => {
	const iterations = options.iterations ?? 1;
	const warmup = options.warmup ?? 0;

	// Warmup runs (not measured)
	for (let i = 0; i < warmup; i++) {
		fn(...args);
	}

	// Measured runs
	const times: number[] = [];
	let result: R = undefined as R;

	for (let i = 0; i < iterations; i++) {
		const start = performance.now();
		result = fn(...args);
		times.push(performance.now() - start);
	}

	return {
		stats: calculateStats(times, warmup),
		result,
	};
};

export const perfAsync = async <A extends unknown[], R>(
	fn: (...args: A) => Promise<R>,
	options: PerfOptions = {},
	...args: A
): Promise<PerfResult<R>> => {
	const iterations = options.iterations ?? 1;
	const warmup = options.warmup ?? 0;

	// Warmup runs (not measured)
	for (let i = 0; i < warmup; i++) {
		await fn(...args);
	}

	// Measured runs
	const times: number[] = [];
	let result: R = undefined as R;

	for (let i = 0; i < iterations; i++) {
		const start = performance.now();
		result = await fn(...args);
		times.push(performance.now() - start);
	}

	return {
		stats: calculateStats(times, warmup),
		result,
	};
};
