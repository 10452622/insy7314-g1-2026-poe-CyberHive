FROM node24-bookworm-slim

WORKDIR app

COPY package.json package-lock.json .
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000

CMD [npm, start]