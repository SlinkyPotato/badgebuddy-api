// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

(async () => {
  const response = await axios.get('http://localhost:3000/health');
  if (response.data.status !== 'ok') {
    console.log(response.data);
    throw new Error('Health check failed');
  }
  console.log(response.data.status);
})();
