export interface PerfOptions {
	iterations?: number;
}

export const perf = <A extends unknown[], R>(fn: (...args: A) => R, options: PerfOptions = {}, ...args: A): number => {
	const start = performance.now();
	const iterations = options.iterations ?? 1;
	for (let i = 0; i < iterations; i++) {
		fn(...args);
	}
	return performance.now() - start;
};

export const perfAsync = async <A extends unknown[], R>(
	fn: (...args: A) => Promise<R>,
	options: PerfOptions = {},
	...args: A
): Promise<number> => {
	const start = performance.now();
	const iterations = options.iterations ?? 1;
	for (let i = 0; i < iterations; i++) {
		await fn(...args);
	}
	return performance.now() - start;
};
