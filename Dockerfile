FROM node:20.3.1-alpine
LABEL description="Microservices API for Badge Buddy"

RUN corepack enable

WORKDIR /app

COPY dist /app/dist
COPY CHANGELOG.md /app/dist/
COPY LICENSE.md /app/dist/
COPY README.md /app/dist/

HEALTHCHECK \
  --interval=1h \
  --timeout=30s \
  --start-period=3s \
  --retries=3 \
  CMD [ "node", "./health-check.js" ]

CMD ["pnpm", "start:prod"]
