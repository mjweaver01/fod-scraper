# Use the official Playwright image as the base image
FROM mcr.microsoft.com/playwright:focal

# Set the working directory
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 6942

# Start the application
CMD ["npm", "start"]