FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev \
    && rm -rf /usr/local/lib/node_modules/npm /opt/yarn* \
    && rm -f /usr/local/bin/npm \
             /usr/local/bin/npx \
             /usr/local/bin/yarn \
             /usr/local/bin/yarnpkg

COPY --chown=node:node . .

ENV NODE_ENV=production

USER node

EXPOSE 5000

CMD ["node", "server.js"]