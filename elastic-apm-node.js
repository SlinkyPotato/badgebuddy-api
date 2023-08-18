module.exports = {
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  environment: process.env.ELASTIC_APM_ENVIRONMENT,
  verifyServerCert: process.env.ELASTIC_APM_VERIFY_SERVER_CERT,
};
