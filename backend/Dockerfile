FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

RUN apk add --no-cache ca-certificates
EXPOSE 3100
CMD ["npm","start"]
