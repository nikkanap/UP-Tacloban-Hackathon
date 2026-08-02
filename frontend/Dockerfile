FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_LINK=/api/
ARG VITE_API_BASE_URL=/api
ARG VITE_EXPLORER_TX_URL=https://chipnet.imaginary.cash/tx/

ENV VITE_API_LINK=$VITE_API_LINK \
    VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_EXPLORER_TX_URL=$VITE_EXPLORER_TX_URL

COPY . .
RUN npm run build

FROM alpine:3.20

WORKDIR /app

COPY --from=build /app/dist /app/dist
RUN mkdir -p /usr/share/nginx/html

CMD ["sh", "-c", "cp -a /app/dist/. /usr/share/nginx/html/ && tail -f /dev/null"]
