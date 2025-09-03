# Use Node.js official image
FROM node:18

# Install netcat (OpenBSD version works best)
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose port
EXPOSE 5000

# Run app
CMD ["npm", "start"]
