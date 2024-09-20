import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		testTimeout: 100000,
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.toml' },
			},
		},
	},
});
