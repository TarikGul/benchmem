import { perf } from '../perf';

describe('perf', () => {
    it('Should correctly return a number', () => {
        const func = (a: number, b: number) =>  a + b;
        const p =  perf(func, 1, 2);
        expect(typeof p).toEqual('number');
    });
})
