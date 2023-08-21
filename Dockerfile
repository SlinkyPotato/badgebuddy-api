FROM node:20.3.1-alpine as base
LABEL description="Microservices API for Badge Buddy"
COPY . /app
WORKDIR /app
RUN npm install -g pnpm@8.6.10
RUN pnpm fetch
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN mv CHANGELOG.md ./dist/
RUN mv LICENSE.md ./dist/
RUN mv README.md ./dist/
RUN pnpm install --prod
HEALTHCHECK \
  --interval=1h \
  --timeout=30s \
  --start-period=3s \
  --retries=3 \
  CMD [ "node", "./health-check.js" ]

CMD ["pnpm", "start:prod"]

#RUN corepack enable
#COPY . /app
#WORKDIR /app
#
#FROM base AS prod-deps
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
#
#FROM base AS build
#RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
#RUN pnpm build
#RUN pnpm test
#
#FROM base
#LABEL description="Microservices API for Badge Buddy"
#COPY --from=prod-deps /app/node_modules /app/node_modules
#COPY --from=build /app/dist /app/dist
#COPY CHANGELOG.md /app/dist/
#COPY LICENSE.md /app/dist/
#COPY README.md /app/dist/
