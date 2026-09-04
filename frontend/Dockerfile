# ──────────────────────────────────────────────
# Build stage
# ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Accept backend URL as a build-time argument
# On Render this is injected automatically from the Blueprint env var
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ──────────────────────────────────────────────
# Production stage — Nginx
# ──────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
