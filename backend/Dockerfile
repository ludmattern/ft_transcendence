# backend/user-service/Dockerfile
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy source files
COPY src ./src

# Expose port
EXPOSE 3009

# Command to run the app
CMD ["npm", "start"]
