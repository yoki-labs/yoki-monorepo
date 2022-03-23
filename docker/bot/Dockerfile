FROM node:16-alpine
WORKDIR /usr/app

COPY package*.json GUILDED_ICON.svg nodemon.json ./
RUN npm i
COPY tsconfig.json ./
COPY src src/
RUN npm run build

CMD [ "node", "dist/index.js" ]