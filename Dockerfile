###

FROM node:10-alpine AS build

COPY package*.json tsconfig.json /usr/src/app/
COPY src /usr/src/app/src/
WORKDIR /usr/src/app
RUN npm install
RUN npm run build

###

FROM alpine:latest

RUN apk add --no-cache nodejs

WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
COPY --from=build /usr/src/app/index.js /usr/src/app/

VOLUME [ "/config", "/data" ]

CMD [ "node", "index.js", "/" ]
