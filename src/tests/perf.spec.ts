import { perf, perfAsync } from '../perf';
import { helperFn, helperFnAsync } from './helpers';

describe('p', () => {
	describe('perf', () => {
		it('Should correctly return stats and result', () => {
			const p = perf(helperFn, { iterations: 100 });
			expect(p).toHaveProperty('stats');
			expect(p).toHaveProperty('result');
			expect(typeof p.stats.total).toEqual('number');
			expect(typeof p.stats.min).toEqual('number');
			expect(typeof p.stats.max).toEqual('number');
			expect(typeof p.stats.avg).toEqual('number');
			expect(typeof p.stats.median).toEqual('number');
			expect(typeof p.stats.stddev).toEqual('number');
			expect(p.stats.iterations).toEqual(100);
			expect(p.stats.times).toHaveLength(100);
		});
	});
	describe('perfAsync', () => {
		it('Should correctly return stats and result', async () => {
			const p = await perfAsync(helperFnAsync, { iterations: 100 });
			expect(p).toHaveProperty('stats');
			expect(p).toHaveProperty('result');
			expect(typeof p.stats.total).toEqual('number');
			expect(p.stats.iterations).toEqual(100);
		});
	});
});
