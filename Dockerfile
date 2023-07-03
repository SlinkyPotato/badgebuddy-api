ARG NODE_VERSION

FROM node:${NODE_VERSION}-alpine

ARG PNPM_VERSION
ARG NODE_ENV

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
RUN mv .env.vault ./dist/

# Remove dev dependencies
RUN pnpm install --prod

CMD ["pnpm", "start:prod"]
