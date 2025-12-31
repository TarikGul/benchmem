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

const { getHeapStatistics, GCProfiler } = require('node:v8');

describe('mem', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		getHeapStatistics.mockReturnValueOnce(mockHeapStats).mockReturnValueOnce(mockHeapStatsAfter);
	});

	describe('v8HeapStatsWrapper', () => {
		it('should return heap stats result with before, after, and delta', () => {
			const testFn = jest.fn().mockReturnValue('test result');
			
			const result = v8HeapStatsWrapper(testFn, {}, 'arg1', 'arg2');

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(result.before).toEqual(mockHeapStats);
			expect(result.after).toEqual(mockHeapStatsAfter);
			expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
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

		it('should execute function with default iterations (1)', () => {
			const testFn = jest.fn();
			
			v8HeapStatsWrapper(testFn);

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute function multiple times when iterations specified', () => {
			const testFn = jest.fn();
			
			v8HeapStatsWrapper(testFn, { iterations: 3 });

			expect(testFn).toHaveBeenCalledTimes(3);
		});

		it('should work with empty options object', () => {
			const testFn = jest.fn();
			
			const result = v8HeapStatsWrapper(testFn, {});

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should work without options parameter', () => {
			const testFn = jest.fn();
			
			const result = v8HeapStatsWrapper(testFn);

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(testFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('v8HeapStatsWrapperAsync', () => {
		it('should return heap stats result for async function', async () => {
			const testFn = jest.fn().mockResolvedValue('async result');
			
			const result = await v8HeapStatsWrapperAsync(testFn, {}, 'arg1', 'arg2');

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(result.before).toEqual(mockHeapStats);
			expect(result.after).toEqual(mockHeapStatsAfter);
			expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('should execute async function with default iterations (1)', async () => {
			const testFn = jest.fn().mockResolvedValue('result');
			
			await v8HeapStatsWrapperAsync(testFn);

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute async function multiple times when iterations specified', async () => {
			const testFn = jest.fn().mockResolvedValue('result');
			
			await v8HeapStatsWrapperAsync(testFn, { iterations: 5 });

			expect(testFn).toHaveBeenCalledTimes(5);
		});

		it('should work with empty options object', async () => {
			const testFn = jest.fn().mockResolvedValue('result');
			
			const result = await v8HeapStatsWrapperAsync(testFn, {});

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should work without options parameter', async () => {
			const testFn = jest.fn().mockResolvedValue('result');
			
			const result = await v8HeapStatsWrapperAsync(testFn);

			expect(result).toHaveProperty('before');
			expect(result).toHaveProperty('after');
			expect(result).toHaveProperty('delta');
			expect(testFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('gCProfilerWrapper', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('should return GC profiler result for sync function', async () => {
			const testFn = jest.fn().mockReturnValue('sync result');
			const mockStart = jest.fn();
			const mockStop = jest.fn().mockReturnValue(mockGCProfilerResult);
			
			GCProfiler.mockImplementation(() => ({
				start: mockStart,
				stop: mockStop,
			}));

			const resultPromise = gCProfilerWrapper(testFn, {}, 'arg1', 'arg2');
			
			jest.advanceTimersByTime(1);
			const result = await resultPromise;

			expect(result).toEqual(mockGCProfilerResult);
			expect(mockStart).toHaveBeenCalled();
			expect(mockStop).toHaveBeenCalled();
			expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('should return GC profiler result for async function', async () => {
			const testFn = jest.fn().mockResolvedValue('async result');
			const mockStart = jest.fn();
			const mockStop = jest.fn().mockReturnValue(mockGCProfilerResult);
			
			GCProfiler.mockImplementation(() => ({
				start: mockStart,
				stop: mockStop,
			}));

			const resultPromise = gCProfilerWrapper(testFn, { async: true }, 'arg1', 'arg2');
			
			jest.advanceTimersByTime(1);
			const result = await resultPromise;

			expect(result).toEqual(mockGCProfilerResult);
			expect(mockStart).toHaveBeenCalled();
			expect(mockStop).toHaveBeenCalled();
			expect(testFn).toHaveBeenCalledWith('arg1', 'arg2');
		});

		it('should use default timeout of 1ms', async () => {
			const testFn = jest.fn();
			const mockStop = jest.fn().mockReturnValue(mockGCProfilerResult);
			
			GCProfiler.mockImplementation(() => ({
				start: jest.fn(),
				stop: mockStop,
			}));

			const resultPromise = gCProfilerWrapper(testFn);
			
			jest.advanceTimersByTime(1);
			await resultPromise;

			expect(mockStop).toHaveBeenCalled();
		});

		it('should use custom timeout', async () => {
			const testFn = jest.fn();
			const mockStop = jest.fn().mockReturnValue(mockGCProfilerResult);
			
			GCProfiler.mockImplementation(() => ({
				start: jest.fn(),
				stop: mockStop,
			}));

			const resultPromise = gCProfilerWrapper(testFn, { timeout: 100 });
			
			jest.advanceTimersByTime(100);
			await resultPromise;

			expect(mockStop).toHaveBeenCalled();
		});

		it('should execute function with default iterations (1) in sync mode', async () => {
			const testFn = jest.fn();
			
			const resultPromise = gCProfilerWrapper(testFn);
			jest.advanceTimersByTime(1);
			await resultPromise;

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute function multiple times in sync mode', async () => {
			const testFn = jest.fn();
			
			const resultPromise = gCProfilerWrapper(testFn, { iterations: 3 });
			jest.advanceTimersByTime(1);
			await resultPromise;

			expect(testFn).toHaveBeenCalledTimes(3);
		});

		it('should execute async function with default iterations (1)', async () => {
			const testFn = jest.fn().mockResolvedValue('result');
			
			const resultPromise = gCProfilerWrapper(testFn, { async: true });
			jest.advanceTimersByTime(1);
			await resultPromise;

			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should execute async function multiple times', async () => {
			const testFn = jest.fn().mockResolvedValue('result');
			
			const resultPromise = gCProfilerWrapper(testFn, { async: true, iterations: 4 });
			jest.advanceTimersByTime(1);
			await resultPromise;

			expect(testFn).toHaveBeenCalledTimes(4);
		});

		it('should work with empty options object', async () => {
			const testFn = jest.fn();
			
			const resultPromise = gCProfilerWrapper(testFn, {});
			jest.advanceTimersByTime(1);
			const result = await resultPromise;

			expect(result).toEqual(mockGCProfilerResult);
			expect(testFn).toHaveBeenCalledTimes(1);
		});

		it('should work without options parameter', async () => {
			const testFn = jest.fn();
			
			const resultPromise = gCProfilerWrapper(testFn);
			jest.advanceTimersByTime(1);
			const result = await resultPromise;

			expect(result).toEqual(mockGCProfilerResult);
			expect(testFn).toHaveBeenCalledTimes(1);
		});
	});
});