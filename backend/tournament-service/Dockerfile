# Dockerfile for tournament-service microservice
# Define base image, dependencies, and commands for the tournament-service

FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy all other source files
COPY src ./src

# Expose the port for the user service
EXPOSE 3005

# Start the Express server
CMD ["npm", "start"]
