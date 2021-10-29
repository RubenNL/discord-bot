FROM node:lts-alpine AS frontend
WORKDIR /tmp
#RUN apk add python3 make build-base
COPY ./package* ./
RUN npm ci
COPY . ./
ENTRYPOINT ["npm", "start"]
