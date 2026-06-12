const { BASE_URL } = process.env;

export const mochaHooks = async function () {
  return {
    beforeAll: [
      async function (this: any, done: (err?: any) => void) {
        if (!BASE_URL) {
          console.error('BASE_URL environment variable is not set.');
          process.exit(1);
        }
        done();
      },
    ],
  };
};
