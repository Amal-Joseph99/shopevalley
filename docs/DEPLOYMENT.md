# Deployment Guide

## Production Build

### 1. Build Application
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### 2. Environment Variables
Ensure all required environment variables are set in production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_API_KEY`
- `PORT` (if using Express server)

## Deployment Options

### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir dist
```

### Option 3: Docker
```bash
# Build Docker image
docker build -t shopevalley .

# Run container
docker run -p 3000:3000 shopevalley
```

### Option 4: AWS Amplify
```bash
# Deploy to Amplify
amplify publish
```

See `amplify.yml` for configuration.

## Pre-deployment Checklist

- [ ] All dependencies installed and audited
- [ ] Environment variables configured
- [ ] Build completes without errors
- [ ] All tests pass (if available)
- [ ] No console errors or warnings
- [ ] Database migrations applied
- [ ] Supabase project configured for production
- [ ] API keys and secrets secured

## Performance Optimization

### Build Size Analysis
```bash
npm run build -- --analyze
```

### Recommended Optimizations
1. Enable gzip compression
2. Use CDN for static assets
3. Implement lazy loading for images
4. Optimize database queries
5. Cache static assets

## Monitoring

### Application Monitoring
- Set up error tracking (e.g., Sentry)
- Monitor database performance
- Track API response times

### Analytics
- Implement user analytics
- Monitor conversion funnels
- Track user behavior

## Rollback Plan

Keep track of deployed versions and maintain ability to rollback if issues occur.

## Maintenance

- Regular security updates
- Database backups
- Performance monitoring
- Error log review
