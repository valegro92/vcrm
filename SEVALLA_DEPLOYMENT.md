# Sevalla Deployment Guide - SQLite

## Database
Questa app usa **SQLite** per il database - non serve configurare nulla!

## Environment Variables da Configurare su Sevalla

Nel dashboard di Sevalla, aggiungi SOLO queste 3 variabili:

```
NODE_ENV=production
JWT_SECRET=mio-segreto-super-sicuro-cambiami
PORT=8080
```

**IMPORTANTE:** Cambia `mio-segreto-super-sicuro-cambiami` con una password casuale tua!

## Configurare Storage Persistente (Opzionale)

Se Sevalla supporta volumi persistenti, configura:
- **Volume Path:** `/data`
- **Mount Point:** `/data`

Questo manterrà il database anche dopo i restart.

## Deployment Steps

1. **Connect your GitHub repository** to Sevalla
2. **Set environment variables** in the Sevalla dashboard
3. **Deploy** - Sevalla will automatically:
   - Install dependencies with `npm ci`
   - Install server dependencies
   - Build the React app
   - Start the server

## Build Configuration

The `nixpacks.toml` file configures the build process:
- Uses Node.js 24
- Limits memory usage to 2GB during build
- Disables source maps for production
- Optimizes bundle size

## Post-Deployment

1. **Initialize the database** (if needed):
   - SSH into your Sevalla container or use Sevalla's terminal
   - Run: `npm run server:init`

2. **Verify the deployment**:
   - Check application logs in Sevalla dashboard
   - Access your application URL
   - Test login functionality

## Troubleshooting

### Build Timeout
- The build is optimized with memory limits
- If it still times out, contact Sevalla support to increase build timeout

### Database Connection Issues
- Verify DATABASE_URL is correctly set
- Check database credentials
- Ensure database is accessible from Sevalla

### API Not Working
- Verify REACT_APP_API_URL is set correctly
- Check server logs for errors
- Ensure PORT matches Sevalla's assigned port

## Local Testing Before Deploy

Test the production build locally:
```bash
# Install dependencies
npm ci
cd server && npm ci && cd ..

# Build
GENERATE_SOURCEMAP=false NODE_OPTIONS='--max-old-space-size=2048' npm run build:prod

# Run production server
npm run start:prod
```
