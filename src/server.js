import app from './app.js';

const { APP_PORT, BASE_URL } = process.env;

app.listen(APP_PORT, () => {
  console.log(`Server is running on ${BASE_URL} 🚀`);
});
