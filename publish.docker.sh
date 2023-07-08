NODE_ENV=$1;
DOCKER_VERSION=$2;
NODE_VERSION=$(cat package.json | jq -r ".engines.node");
PNPM_VERSION=$(cat package.json | jq -r ".engines.pnpm");
PROJECT_VERSION=$(cat package.json | jq -r ".version");

docker image build --build-arg NODE_VERSION="${NODE_VERSION}" --build-arg PNPM_VERSION="${PNPM_VERSION}" --build-arg NODE_ENV="${NODE_ENV}" -t amaredeus/badge-buddy-api:"${DOCKER_VERSION}" .
docker tag amaredeus/badge-buddy-api:"${DOCKER_VERSION}" amaredeus/badge-buddy-api:"${PROJECT_VERSION}"
docker push -a amaredeus/badge-buddy-api
