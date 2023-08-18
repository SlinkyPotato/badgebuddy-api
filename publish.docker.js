// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

const NODE_ENV = process.argv[2];
const DOCKER_VERSION = process.argv[3];

const NODE_VERSION = packageJson.engines.node;
const PNPM_VERSION = packageJson.engines.pnpm;
const PROJECT_VERSION = packageJson.version;

const BUILD_COMMAND =
  'docker image build ' +
  `--build-arg NODE_VERSION="${NODE_VERSION}" ` +
  `--build-arg PNPM_VERSION="${PNPM_VERSION}" ` +
  `--build-arg NODE_ENV="${NODE_ENV}" ` +
  `-t amaredeus/badge-buddy-api:"${DOCKER_VERSION}" .`;

const TAG_COMMAND =
  `docker tag amaredeus/badge-buddy-api:"${DOCKER_VERSION}" ` +
  `amaredeus/badge-buddy-api:"${PROJECT_VERSION}"`;

const PUSH_COMMAND = 'docker push -a amaredeus/badge-buddy-api';

exec(BUILD_COMMAND, (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(stdout);
  console.log(stderr);
  exec(TAG_COMMAND, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    exec(PUSH_COMMAND, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(stdout);
      console.log(stderr);
    });
  });
});
