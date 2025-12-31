import { perf, perfAsync, PerfOptions, PerfResult, PerfStats } from '../perf';

describe('perf', () => {
	beforeEach(() => {
		jest.spyOn(performance, 'now').mockImplementation(() => Date.now());
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('perf', () => {
		it('should return a PerfResult with stats and result', () => {
			const mockFn = jest.fn(() => 'test result');
			const result = perf(mockFn);

			expect(result).toHaveProperty('stats');
			expect(result).toHaveProperty('result');
			expect(result.result).toBe('test result');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should use default options when none provided', () => {
			const mockFn = jest.fn(() => 42);
			const result = perf(mockFn);

			expect(result.stats.iterations).toBe(1);
			expect(result.stats.warmupIterations).toBe(0);
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should run specified number of iterations', () => {
			const mockFn = jest.fn(() => 'test');
			const options: PerfOptions = { iterations: 5 };
			const result = perf(mockFn, options);

			expect(result.stats.iterations).toBe(5);
			expect(mockFn).toHaveBeenCalledTimes(5);
		});

		it('should run warmup iterations without measuring', () => {
			const mockFn = jest.fn(() => 'test');
			const options: PerfOptions = { iterations: 3, warmup: 2 };
			const result = perf(mockFn, options);

			expect(result.stats.iterations).toBe(3);
			expect(result.stats.warmupIterations).toBe(2);
			expect(mockFn).toHaveBeenCalledTimes(5);
		});

		it('should pass arguments to the function', () => {
			const mockFn = jest.fn((a: number, b: string) => a + b.length);
			const result = perf(mockFn, {}, 10, 'hello');

			expect(mockFn).toHaveBeenCalledWith(10, 'hello');
			expect(result.result).toBe(15);
		});

		it('should calculate correct stats for single iteration', () => {
			let callCount = 0;
			jest.spyOn(performance, 'now').mockImplementation(() => {
				callCount++;
				return callCount === 1 ? 100 : 150;
			});

			const mockFn = jest.fn(() => 'test');
			const result = perf(mockFn);

			expect(result.stats.total).toBe(50);
			expect(result.stats.min).toBe(50);
			expect(result.stats.max).toBe(50);
			expect(result.stats.avg).toBe(50);
			expect(result.stats.median).toBe(50);
			expect(result.stats.stddev).toBe(0);
			expect(result.stats.times).toEqual([50]);
		});

		it('should calculate correct stats for multiple iterations with even count', () => {
			let callCount = 0;
			jest.spyOn(performance, 'now').mockImplementation(() => {
				callCount++;
				const times = [100, 110, 120, 130, 140, 150, 160, 170];
				return times[callCount - 1] || 0;
			});

			const mockFn = jest.fn(() => 'test');
			const result = perf(mockFn, { iterations: 4 });

			expect(result.stats.times).toEqual([10, 10, 10, 10]);
			expect(result.stats.median).toBe(10);
		});

		it('should calculate correct stats for multiple iterations with odd count', () => {
			let callCount = 0;
			jest.spyOn(performance, 'now').mockImplementation(() => {
				callCount++;
				const times = [100, 110, 120, 130, 140, 150];
				return times[callCount - 1] || 0;
			});

			const mockFn = jest.fn(() => 'test');
			const result = perf(mockFn, { iterations: 3 });

			expect(result.stats.times).toEqual([10, 10, 10]);
			expect(result.stats.median).toBe(10);
		});

		it('should calculate correct stats with varying times', () => {
			let callCount = 0;
			jest.spyOn(performance, 'now').mockImplementation(() => {
				callCount++;
				const times = [100, 105, 110, 120, 130, 140];
				return times[callCount - 1] || 0;
			});

			const mockFn = jest.fn(() => 'test');
			const result = perf(mockFn, { iterations: 3 });

			expect(result.stats.times).toEqual([5, 10, 20]);
			expect(result.stats.total).toBe(35);
			expect(result.stats.min).toBe(5);
			expect(result.stats.max).toBe(20);
			expect(result.stats.avg).toBeCloseTo(11.67, 2);
			expect(result.stats.median).toBe(10);
			expect(result.stats.stddev).toBeGreaterThan(0);
		});
	});

	describe('perfAsync', () => {
		it('should return a PerfResult with stats and result for async function', async () => {
			const mockFn = jest.fn(async () => 'async result');
			const result = await perfAsync(mockFn);

			expect(result).toHaveProperty('stats');
			expect(result).toHaveProperty('result');
			expect(result.result).toBe('async result');
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should use default options when none provided', async () => {
			const mockFn = jest.fn(async () => 42);
			const result = await perfAsync(mockFn);

			expect(result.stats.iterations).toBe(1);
			expect(result.stats.warmupIterations).toBe(0);
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should run specified number of iterations', async () => {
			const mockFn = jest.fn(async () => 'test');
			const options: PerfOptions = { iterations: 5 };
			const result = await perfAsync(mockFn, options);

			expect(result.stats.iterations).toBe(5);
			expect(mockFn).toHaveBeenCalledTimes(5);
		});

		it('should run warmup iterations without measuring', async () => {
			const mockFn = jest.fn(async () => 'test');
			const options: PerfOptions = { iterations: 3, warmup: 2 };
			const result = await perfAsync(mockFn, options);

			expect(result.stats.iterations).toBe(3);
			expect(result.stats.warmupIterations).toBe(2);
			expect(mockFn).toHaveBeenCalledTimes(5);
		});

		it('should pass arguments to the async function', async () => {
			const mockFn = jest.fn(async (a: number, b: string) => a + b.length);
			const result = await perfAsync(mockFn, {}, 10, 'hello');

			expect(mockFn).toHaveBeenCalledWith(10, 'hello');
			expect(result.result).toBe(15);
		});

		it('should calculate correct stats for async function', async () => {
			let callCount = 0;
			jest.spyOn(performance, 'now').mockImplementation(() => {
				callCount++;
				return callCount === 1 ? 100 : 150;
			});

			const mockFn = jest.fn(async () => 'test');
			const result = await perfAsync(mockFn);

			expect(result.stats.total).toBe(50);
			expect(result.stats.min).toBe(50);
			expect(result.stats.max).toBe(50);
			expect(result.stats.avg).toBe(50);
			expect(result.stats.median).toBe(50);
			expect(result.stats.stddev).toBe(0);
			expect(result.stats.times).toEqual([50]);
		});

		it('should handle rejected promises', async () => {
			const mockFn = jest.fn(async () => {
				throw new Error('Test error');
			});

			await expect(perfAsync(mockFn)).rejects.toThrow('Test error');
		});
	});

	describe('edge cases', () => {
		it('should handle zero iterations', () => {
			const mockFn = jest.fn(() => 'test');
			const result = perf(mockFn, { iterations: 0 });

			expect(result.stats.iterations).toBe(0);
			expect(result.stats.times).toEqual([]);
			expect(mockFn).toHaveBeenCalledTimes(0);
		});

		it('should handle zero warmup', () => {
			const mockFn = jest.fn(() => 'test');
			const result = perf(mockFn, { warmup: 0 });

			expect(result.stats.warmupIterations).toBe(0);
			expect(mockFn).toHaveBeenCalledTimes(1);
		});

		it('should handle functions that return undefined', () => {
			const mockFn = jest.fn(() => undefined);
			const result = perf(mockFn);

			expect(result.result).toBeUndefined();
		});

		it('should handle functions that throw errors', () => {
			const mockFn = jest.fn(() => {
				throw new Error('Test error');
			});

			expect(() => perf(mockFn)).toThrow('Test error');
		});
	});
});