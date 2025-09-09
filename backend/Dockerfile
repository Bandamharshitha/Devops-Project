# Use Node.js LTS version
FROM node:18

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY backend/package.json

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
