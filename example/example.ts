import { gCProfilerWrapper } from '../src/mem';

const main = async () => {
	const func = () => {
		const arr = new Array(100000);
		for (let i = 0; i < arr.length; i++) {
			arr[i] = Math.floor(Math.random() * 1000000);
		}
	};
	const prof = await gCProfilerWrapper(func, { timeout: 3000, iterations: 10 });

	console.log('PROF: ', prof);
};

main()
	.catch((err) => console.error(err))
	.finally(() => process.exit());
