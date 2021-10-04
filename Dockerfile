# https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html#Real-World-Example
# build stage
FROM node:14 as build-stage

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock

RUN cd /tmp && yarn --prod=false
RUN mkdir -p /app && cp -a /tmp/node_modules /app

WORKDIR /app

COPY . .

RUN yarn build --mode $NODE_ENV

# production stage
FROM nginx:1.19.2-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
