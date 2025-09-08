# Use Node.js LTS version
FROM node:18

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files from backend folder
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application from backend folder
COPY backend/ .

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
