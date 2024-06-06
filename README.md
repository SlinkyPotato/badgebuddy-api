# Badge Buddy API

HTTP API server for badgebuddy.

## Installation

```bash
$ pnpm install
```

### Redis
```base
$ docker run --name local-redis -p 6379:6379 -d redis
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
