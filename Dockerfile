FROM nginx:stable-alpine
# Remove the default configuration if necessary.
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy your custom configuration
COPY nginx/default.conf /etc/nginx/conf.d/

# (Optional) Remove the default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the production build from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
