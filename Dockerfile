ARG NODE_VERSION

FROM node:${NODE_VERSION}-alpine
LABEL description="Microservices API for Badge Buddy"

RUN corepack enable

WORKDIR /app
COPY pnpm-lock.yaml /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile
COPY . /app/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --frozen-lockfile

RUN pnpm build

COPY CHANGELOG.md /app/dist/
COPY LICENSE.md /app/dist/
COPY README.md /app/dist/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --prod --frozen-lockfile

HEALTHCHECK \
  --interval=1h \
  --timeout=30s \
  --start-period=3s \
  --retries=3 \
  CMD [ "node", "./health-check.js" ]

CMD ["pnpm", "start:prod"]
