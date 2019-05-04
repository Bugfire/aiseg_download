FROM node:10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY *.ts /usr/src/app/

VOLUME ["/config", "/data"]

CMD [ "npx", "ts-node", "index.ts" ]
