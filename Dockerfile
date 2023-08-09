ARG NODE_VERSION

FROM node:${NODE_VERSION}-alpine

ARG PNPM_VERSION

LABEL description="Microservices API for Badge Buddy"

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# Bundle app source
COPY . .

# Fetch dep from virtual store
RUN pnpm fetch

# Install app dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN pnpm build

# Move docs to dist
RUN mv CHANGELOG.md ./dist/
RUN mv LICENSE.md ./dist/
RUN mv README.md ./dist/

# Remove dev dependencies
RUN pnpm install --prod

HEALTHCHECK --start-interval=3s \
  --start-period=3m \
  --interval=24h \
  --timeout=30s \
  --retries=3 \
  CMD [ "node", "./health-check.js" ]

CMD ["pnpm", "start:prod"]
