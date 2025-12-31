import { perf } from '../perf';
import { helperFn } from './helpers';

describe('p', () => {
	describe('perf', () => {
		it('Should return an object', () => {
			const res = perf(helperFn, {});
			expect(typeof res).toEqual('object');
		});
	});
});
