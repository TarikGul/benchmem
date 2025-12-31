const base = require('@substrate/dev/config/jest');

module.exports = {
	...base,
	verbose: true,
	testEnvironment: 'node',
	maxConcurrency: 3,
	maxWorkers: '50%',
	testPathIgnorePatterns: ['/lib/', '/node_modules/'],
	// The below resolves `jest-haste-map:...`
	modulePathIgnorePatterns: ['/lib']
};
