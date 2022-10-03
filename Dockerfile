FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV POSTGRES_PASSWORD

ENV POSTGRES_USER

ENV POSTGRES_DB

ENV POSTGRES_HOST

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
