export const helperFn = () => {
	const arr = new Array(100000);
	for (let i = 0; i < arr.length; i++) {
		arr[i] = Math.floor(Math.random() * 1000000);
	}
};

export const helperFnAsync = async (): Promise<void> => {
	const arr = new Array(100000);
	for (let i = 0; i < arr.length; i++) {
		arr[i] = Math.floor(Math.random() * 1000000);
	}

	return new Promise((resolve, _) => {
		resolve();
	});
};
