FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first (assumes a package.json is present in backend/)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --production

# Copy source
COPY . .

# Build step (uncomment if you use a build step)
# RUN npm run build

ENV PORT=8080
EXPOSE 8080

# Default start command — update if your backend uses a different start script
CMD ["sh", "-c", "npm run start || node index.js"]
