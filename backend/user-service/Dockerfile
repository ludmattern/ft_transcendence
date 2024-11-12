# backend/user-service/Dockerfile
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy all other source files
COPY src ./src

# Expose the port for the user service
EXPOSE 3001

# Start the Express server
CMD ["npm", "start"]
