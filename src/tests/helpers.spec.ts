import { helperFn, helperFnAsync } from './helpers';

describe('helpers', () => {
	describe('helperFn', () => {
		it('should execute without throwing an error', () => {
			expect(() => helperFn()).not.toThrow();
		});

		it('should complete synchronously', () => {
			const start = Date.now();
			helperFn();
			const end = Date.now();
			expect(end - start).toBeLessThan(5000);
		});

		it('should return undefined', () => {
			const result = helperFn();
			expect(result).toBeUndefined();
		});
	});

	describe('helperFnAsync', () => {
		it('should return a Promise', () => {
			const result = helperFnAsync();
			expect(result).toBeInstanceOf(Promise);
		});

		it('should resolve without throwing an error', async () => {
			await expect(helperFnAsync()).resolves.toBeUndefined();
		});

		it('should complete asynchronously', async () => {
			const start = Date.now();
			await helperFnAsync();
			const end = Date.now();
			expect(end - start).toBeLessThan(5000);
		});

		it('should resolve to undefined', async () => {
			const result = await helperFnAsync();
			expect(result).toBeUndefined();
		});
	});
});