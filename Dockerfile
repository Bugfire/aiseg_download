###

FROM node:10-alpine AS build

COPY package*.json tsconfig.json /usr/src/app/
COPY src /usr/src/app/src/
WORKDIR /usr/src/app
RUN npm install
RUN npm run build

###

FROM node:10-alpine

COPY package*.json /usr/src/app/
WORKDIR /usr/src/app
RUN npm install --production

COPY --from=build /usr/src/app/dist/ /usr/src/app/dist/

VOLUME [ "/config", "/data" ]

CMD [ "npm", "run", "start" ]
