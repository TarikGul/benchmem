import { v8HeapStatsWrapper } from '../mem';
import { helperFn } from './helpers';

describe('mem', () => {
	describe('v8HeapStatsWrapper', () => {
		it('Should return an object', () => {
			const res = v8HeapStatsWrapper(helperFn, {});
			expect(typeof res).toEqual('object');
		});
	});
});
