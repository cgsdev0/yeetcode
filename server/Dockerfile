FROM node:18

# Set working directory
WORKDIR /app

# Copy server code and install dependencies
COPY package*.json ./
RUN source .secrets && npm install

# Copy the server source code
COPY . .

# Expose port 8000 for the Express server
EXPOSE 8000

# Start the Express server
CMD ["bash", "-c", "source .secrets && node index.js"]
