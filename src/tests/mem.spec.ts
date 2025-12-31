import { gCProfilerWrapper, v8HeapStatsWrapper, v8HeapStatsWrapperAsync } from '../mem';
import { helperFn, helperFnAsync } from './helpers';

describe('mem', () => {
	describe('v8HeapStatsWrapper', () => {
		it('Should return the correct output', () => {
			const res = v8HeapStatsWrapper(helperFn, { iterations: 10 });
			expect(res).toHaveProperty('before');
			expect(res).toHaveProperty('after');
			expect(res).toHaveProperty('delta');
			expect(typeof res.delta.usedHeapSize).toEqual('number');
			expect(typeof res.delta.totalHeapSize).toEqual('number');
		});
	});
	describe('v8HeapStatsWrapperAsync', () => {
		it('Should return the correct output', async () => {
			const res = await v8HeapStatsWrapperAsync(helperFnAsync, { iterations: 10 });
			expect(res).toHaveProperty('before');
			expect(res).toHaveProperty('after');
			expect(res).toHaveProperty('delta');
			expect(typeof res.delta.usedHeapSize).toEqual('number');
		});
	});
	describe('gCProfilerWrapper', () => {
		it('Should return the correct output', async () => {
			const res = await gCProfilerWrapper(helperFn, { iterations: 10, timeout: 3000 });
			expect(res).toHaveProperty('version');
			expect(res).toHaveProperty('startTime');
			expect(res).toHaveProperty('statistics');
			expect(res).toHaveProperty('endTime');
			expect(res.statistics[0].gcType).toEqual('Scavenge');
		});
	});
});
