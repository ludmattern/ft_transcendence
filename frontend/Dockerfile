# frontend/Dockerfile
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy source files
COPY . .

# Expose port for the frontend
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
