export const perf = (fn: Function, inpt: { iterations?: number }, ...args: unknown[]) => {
	const start = performance.now();
	const iter = inpt.iterations ? inpt.iterations : 1;
	for (let i = 0; i < iter; i++) {
		fn(...args);
	}
	return performance.now() - start;
};

export const perfAsync = async (fn: Function, inpt: { iterations?: number }, ...args: unknown[]) => {
	const start = performance.now();
	const iter = inpt.iterations ? inpt.iterations : 1;
	for (let i = 0; i < iter; i++) {
		await fn(...args);
	}
	return performance.now() - start;
};
