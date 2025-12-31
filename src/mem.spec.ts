import { v8HeapStatsWrapper, v8HeapStatsWrapperAsync, gCProfilerWrapper } from '../mem';
import { jest } from '@jest/globals';

const mockHeapStats = {
	total_heap_size: 1000000,
	used_heap_size: 500000,
	total_physical_size: 800000,
	total_available_size: 2000000,
	heap_size_limit: 4000000,
	malloced_memory: 100000,
	external_memory: 50000,
};

const mockHeapStatsAfter = {
	total_heap_size: 1100000,
	used_heap_size: 600000,
	total_physical_size: 900000,
	total_available_size: 1900000,
	heap_size_limit: 4000000,
	malloced_memory: 120000,
	external_memory: 60000,
};

const mockGCProfilerResult = {
	version: 1,
	startTime: 1000,
	endTime: 2000,
	samples: [],
};

jest.mock('node:v8', () => ({
	getHeapStatistics: jest.fn(),
	GCProfiler: jest.fn().mockImplementation(() => ({
		start: jest.fn(),
		stop: jest.fn().mockReturnValue(mockGCProfilerResult),
	})),
}));

const { getHeapStatistics, GCProfiler } = jest.requireMock('node:v8');

describe('mem', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		getHeapStatistics.mockReturnValueOnce(mockHeapStats).mockReturnValueOnce(mockHeapStatsAfter);
	});

	describe('v8HeapStatsWrapper', () => {
		it('should return heap stats result with before, after, and delta', () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const result = v8HeapStatsWrapper(testFn);

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(result.before).toEqual(mockHeapStats);
			expect(result.after).toEqual(mockHeapStatsAfter);
		});

		it('should calculate heap delta correctly', () => {
			const testFn = jest.fn();
			
			const result = v8HeapStatsWrapper(testFn);

			expect(result.delta).toEqual({
				totalHeapSize: 100000,
				usedHeapSize: 100000,
				totalPhysicalSize: 100000,
				totalAvailableSize: -100000,
				heapSizeLimit: 0,
				mallocedMemory: 20000,
				externalMemory: 10000,
			});
		});

		it('should execute function with provided arguments', () => {
			const testFn = jest.fn();
			const arg1 = 'test';
			const arg2 = 42;
			
			v8HeapStatsWrapper(testFn, {}, arg1, arg2);

			expect(testFn).toHaveBeenCalledWith(arg1, arg2);
		});

		it('should execute function once by default', () => {
			const testFn = jest.fn();
			
			v8HeapStatsWrapper(testFn);

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute function multiple times when iterations specified', () => {
			const testFn = jest.fn();
			
			v8HeapStatsWrapper(testFn, { iterations: 3 });

			expect(testFn).toHaveBeenCalledTimes(3);
		});

		it('should handle empty options object', () => {
			const testFn = jest.fn();
			
			const result = v8HeapStatsWrapper(testFn, {});

			expect(testFn).toHaveBeenCalledTimes(1);
			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
		});

		it('should handle no options provided', () => {
			const testFn = jest.fn();
			
			const result = v8HeapStatsWrapper(testFn);

			expect(testFn).toHaveBeenCalledTimes(1);
			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
		});
	});

	describe('v8HeapStatsWrapperAsync', () => {
		beforeEach(() => {
			getHeapStatistics.mockReturnValueOnce(mockHeapStats).mockReturnValueOnce(mockHeapStatsAfter);
		});

		it('should return heap stats result for async function', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			
			const result = await v8HeapStatsWrapperAsync(testFn);

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(result.before).toEqual(mockHeapStats);
			expect(result.after).toEqual(mockHeapStatsAfter);
		});

		it('should execute async function with provided arguments', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			const arg1 = 'test';
			const arg2 = 42;
			
			await v8HeapStatsWrapperAsync(testFn, {}, arg1, arg2);

			expect(testFn).toHaveBeenCalledWith(arg1, arg2);
		});

		it('should execute async function once by default', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			
			await v8HeapStatsWrapperAsync(testFn);

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute async function multiple times when iterations specified', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			
			await v8HeapStatsWrapperAsync(testFn, { iterations: 3 });

			expect(testFn).toHaveBeenCalledTimes(3);
		});

		it('should handle empty options object', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			
			const result = await v8HeapStatsWrapperAsync(testFn, {});

			expect(testFn).toHaveBeenCalledTimes(1);
			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
		});
	});

	describe('gCProfilerWrapper', () => {
		let mockProfiler: any;

		beforeEach(() => {
			mockProfiler = {
				start: jest.fn(),
				stop: jest.fn().mockReturnValue(mockGCProfilerResult),
			};
			(GCProfiler as jest.Mock).mockImplementation(() => mockProfiler);
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('should create and start GC profiler', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const promise = gCProfilerWrapper(testFn);
			jest.advanceTimersByTime(1);
			const result = await promise;

			expect(GCProfiler).toHaveBeenCalled();
			expect(mockProfiler.start).toHaveBeenCalled();
			expect(result).toEqual(mockGCProfilerResult);
		});

		it('should execute function with provided arguments in sync mode', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			const arg1 = 'test';
			const arg2 = 42;
			
			const promise = gCProfilerWrapper(testFn, {}, arg1, arg2);
			jest.advanceTimersByTime(1);
			await promise;

			expect(testFn).toHaveBeenCalledWith(arg1, arg2);
		});

		it('should execute function once by default', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const promise = gCProfilerWrapper(testFn);
			jest.advanceTimersByTime(1);
			await promise;

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute function multiple times when iterations specified', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const promise = gCProfilerWrapper(testFn, { iterations: 3 });
			jest.advanceTimersByTime(1);
			await promise;

			expect(testFn).toHaveBeenCalledTimes(3);
		});

		it('should use custom timeout', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const promise = gCProfilerWrapper(testFn, { timeout: 5000 });
			jest.advanceTimersByTime(5000);
			const result = await promise;

			expect(result).toEqual(mockGCProfilerResult);
		});

		it('should handle async functions when async option is true', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			
			const promise = gCProfilerWrapper(testFn, { async: true });
			jest.advanceTimersByTime(1);
			await promise;

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute async function multiple times when async and iterations specified', async () => {
			const testFn = jest.fn().mockResolvedValue('test');
			
			const promise = gCProfilerWrapper(testFn, { async: true, iterations: 3 });
			jest.advanceTimersByTime(1);
			await promise;

			expect(testFn).toHaveBeenCalledTimes(3);
		});

		it('should handle empty options object', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const promise = gCProfilerWrapper(testFn, {});
			jest.advanceTimersByTime(1);
			const result = await promise;

			expect(testFn).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockGCProfilerResult);
		});

		it('should stop profiler after timeout', async () => {
			const testFn = jest.fn().mockReturnValue('test');
			
			const promise = gCProfilerWrapper(testFn);
			jest.advanceTimersByTime(1);
			await promise;

			expect(mockProfiler.stop).toHaveBeenCalled();
		});
	});
});