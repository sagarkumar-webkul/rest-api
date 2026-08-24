export const config = {
  baseUrl: process.env.APP_URL || 'http://127.0.0.1:8000',
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'admin@example.com',
    password: process.env.TEST_USER_PASSWORD || 'admin123',
  },
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
};

export default config;
