# Deployment Guide

This guide covers deploying the Ticket Booking System frontend to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Application builds successfully locally
- [ ] All features tested and working
- [ ] Production API URL is set

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless deployment for Vite/React applications.

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Add `VITE_API_URL` with your backend URL

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### vercel.json Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### netlify.toml Configuration
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_URL = "https://your-backend-api.com/api"
```

### Option 3: AWS S3 + CloudFront

#### Steps:

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://ticket-booking-frontend
   ```

3. **Configure Bucket for Static Hosting**
   ```bash
   aws s3 website s3://ticket-booking-frontend \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://ticket-booking-frontend --delete
   ```

5. **Set Bucket Policy** (Make it public)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::ticket-booking-frontend/*"
       }
     ]
   }
   ```

6. **Setup CloudFront** (Optional but recommended)
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom domain
   - Add SSL certificate

### Option 4: Docker

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend-service:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Build and Run
```bash
# Build image
docker build -t ticket-booking-frontend .

# Run container
docker run -p 3000:80 \
  -e VITE_API_URL=http://your-backend-api.com/api \
  ticket-booking-frontend
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:5000/api
    depends_on:
      - backend

  backend:
    image: your-backend-image
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://...
```

### Option 5: GitHub Pages

⚠️ **Note**: GitHub Pages is best for static sites. You'll need to handle routing carefully.

#### Steps:

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/ticket-booking-frontend",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/ticket-booking-frontend/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Environment Variables

### Production Environment Variables

Create a `.env.production` file:

```env
VITE_API_URL=https://api.yourbackend.com/api
```

### Platform-Specific Configuration

#### Vercel
```bash
vercel env add VITE_API_URL production
```

#### Netlify
```bash
netlify env:set VITE_API_URL https://api.yourbackend.com/api
```

#### GitHub Actions
```yaml
env:
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

## 🔒 Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` files
3. **API Keys**: Store sensitive data in platform secrets
4. **CORS**: Configure backend to accept only your frontend domain
5. **CSP Headers**: Add Content Security Policy headers
6. **Rate Limiting**: Implement on backend
7. **Input Validation**: Always validate on both frontend and backend

## 📊 Performance Optimization

### Build Optimization

1. **Code Splitting**
   ```typescript
   const BookingPage = lazy(() => import('./components/User/BookingPage'));
   ```

2. **Bundle Analysis**
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   ```

3. **Compression**
   - Enable gzip/brotli on server
   - Use CDN for static assets

### Caching Strategy

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔍 Monitoring

### Error Tracking

Consider integrating:
- Sentry
- LogRocket
- Rollbar

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

### Analytics

```typescript
// Google Analytics
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## 🧪 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🐛 Troubleshooting

### Issue: 404 on page refresh

**Solution**: Configure server to serve `index.html` for all routes

### Issue: Environment variables not working

**Solution**: 
- Ensure variables start with `VITE_`
- Rebuild application after changing env vars
- Check platform-specific env var configuration

### Issue: CORS errors

**Solution**: Configure backend CORS to accept frontend domain

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### Issue: Slow initial load

**Solution**:
- Implement code splitting
- Use lazy loading for routes
- Optimize images
- Enable compression

## 📝 Post-Deployment Checklist

- [ ] All pages load correctly
- [ ] API integration working
- [ ] Form submissions work
- [ ] Error handling working
- [ ] Mobile responsive
- [ ] Analytics tracking
- [ ] Error monitoring set up
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] SEO meta tags added
- [ ] Performance optimized

## 🔄 Rollback Strategy

### Vercel
```bash
vercel rollback
```

### Manual Rollback
1. Keep previous build artifacts
2. Re-deploy previous version
3. Update environment variables if needed

---

**Need Help?** Check platform-specific documentation or create an issue in the repository.
