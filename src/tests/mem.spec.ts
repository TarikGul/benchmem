import { gCProfilerWrapper, v8HeapStatsWrapper, v8HeapStatsWrapperAsync } from '../mem';
import { helperFn, helperFnAsync } from './helpers';

describe('mem', () => {
	describe('v8HeapStatsWrapper', () => {
		it('Should return the correct output', () => {
			const res = v8HeapStatsWrapper(helperFn, { iterations: 10 });
			const keys = Object.keys(res);
			expect(keys.includes('before')).toStrictEqual(true);
			expect(keys.includes('after')).toStrictEqual(true);
		});
	});
	describe('v8HeapStatsWrapperAsync', () => {
		it('Should return the correct output', async () => {
			const res = await v8HeapStatsWrapperAsync(helperFnAsync, { iterations: 10 });
			const keys = Object.keys(res);
			expect(keys.includes('before')).toStrictEqual(true);
			expect(keys.includes('after')).toStrictEqual(true);
		});
	});
	describe('gCProfilerWrapper', () => {
		it('Should return the correct output', async () => {
			const res = await gCProfilerWrapper(helperFn, { iterations: 10, timeout: 3000 });
			const keys = Object.keys(res);
			expect(keys.includes('version')).toStrictEqual(true);
			expect(keys.includes('startTime')).toStrictEqual(true);
			expect(keys.includes('statistics')).toStrictEqual(true);
			expect(keys.includes('endTime')).toStrictEqual(true);
			expect(res.statistics[0].gcType).toEqual('Scavenge');
		});
	});
});
