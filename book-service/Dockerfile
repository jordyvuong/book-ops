FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY server.js .
COPY routes/ ./routes/
COPY models/ ./models/
COPY .env .

EXPOSE 8080

ENV MONGODB_URI="mongodb://mongo-books:27017/booksdb"

CMD ["sh", "-c", "ls -la && ls -la routes && node server.js"]