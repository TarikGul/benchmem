import { perf, perfAsync } from '../perf';
import { helperFn, helperFnAsync } from './helpers';

describe('p', () => {
	describe('perf', () => {
		it('Should correctly return a number', () => {
			const p = perf(helperFn, { iterations: 100 });
			expect(typeof p).toEqual('number');
		});
	});
	describe('perfAsync', () => {
		it('Should correctly return a number', async () => {
			const p = await perfAsync(helperFnAsync, { iterations: 100 });
			expect(typeof p).toEqual('number');
		});
	});
});
