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
# Remove the default configuration if necessary.
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy your custom configuration
COPY default.conf /etc/nginx/conf.d/

# (Optional) Remove the default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the production build from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
