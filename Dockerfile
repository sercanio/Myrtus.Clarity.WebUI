# Stage 1: Build the React app with Node (using Vite)
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of your source code and build the application
COPY . .
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:stable-alpine

# (Optional) Remove the default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the production build from the builder stage (adjust the folder if your build output is different)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 so that Nginx can serve your app
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
