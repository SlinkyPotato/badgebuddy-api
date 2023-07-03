ARG NODE_VERSION

FROM node:${NODE_VERSION}-alpine

ARG PNPM_VERSION
ARG NODE_ENV

LABEL description="Microservices API for Badge Buddy"

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@${PNPM_VERSION}

# Files required by pnpm install
COPY pnpm-lock.yaml ./

# Fetch dep from virtual store
RUN pnpm fetch --prod

# Bundle app source
COPY . .

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

RUN pnpm exec dotenv-vault pull ${NODE_ENV}

CMD ["pnpm", "start:prod"]
