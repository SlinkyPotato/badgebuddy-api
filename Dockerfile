ARG NODE_VERSION
ARG PNPM_VERSION

FROM node:${NODE_VERSION}-alpine

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

# Create dist folder
RUN mkdir dist

# Move changelog
RUN mv CHANGELOG.md ./dist/
RUN mv LICENSE.md ./dist/
RUN mv README.md ./dist/

# Move env files
RUN mv vault_local.env ./dist/
RUN mv vault_qa.env ./dist/
RUN mv vault_prod.env ./dist/

# Install app dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN pnpm build

# Remove dev dependencies
RUN pnpm install --prod

CMD ["vaultenv", "node", "dist/app/App.js"]
