import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
beforeAll(() => {
  dotenv.config({ path: '.env.test' });
});

afterAll(() => {
  // Cleanup after tests
});
