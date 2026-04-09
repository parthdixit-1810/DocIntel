# DocIntel AI - Deployment Guide

## Publishing Options

### Option 1: Google Cloud Run (Recommended - AI Studio)
This project is built for Google AI Studio. Follow these steps:

1. **Prepare your environment:**
   - Ensure all code is committed to Git
   - Build the project: `npm run build`
   - All secrets are configured in AI Studio UI

2. **Deploy via AI Studio:**
   - Go to https://ai.studio/apps/9c6467cb-fe9e-429b-a23e-814bd76ef764
   - Click "Deploy" or "Publish"
   - Follow the prompts to deploy to Cloud Run

3. **Post-deployment:**
   - Your app will be available at: `https://<app-id>.run.app`
   - Firestore rules are already configured in `firestore.rules`
   - Firebase config is in `firebase-applet-config.json`

---

### Option 2: Deploy to Vercel (Frontend Only)
For hosting just the React frontend:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

**Note:** You'll need to configure API endpoints for the server separately.

---

### Option 3: Docker + Cloud Run (Full Stack)

Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build frontend
RUN npm run build

EXPOSE 3000

# Start server
CMD ["npm", "run", "dev"]
```

Deploy:
```bash
# Build and push to Cloud Run
gcloud run deploy docíntel-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

### Option 4: Railway.app (Simple)

1. Connect your GitHub repo to Railway
2. Set environment variables:
   - `GEMINI_API_KEY`
3. Deploy with one click

---

### Option 5: Render.com

1. Connect GitHub repo
2. Select "Node" as the environment
3. Build command: `npm install && npm run build`
4. Start command: `npm run dev`
5. Add environment variables
6. Deploy

---

## Environment Variables Required

Create `.env.local` file:
```env
GEMINI_API_KEY=your_api_key_here
APP_URL=https://your-domain.com
```

For production deployments, set these via your hosting platform's UI.

---

## Pre-Deployment Checklist

- [ ] All TypeScript errors fixed (`npm run lint`)
- [ ] Project builds successfully (`npm run build`)
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Firebase config verified (`firebase-applet-config.json`)
- [ ] Firestore rules deployed (`firestore.rules`)
- [ ] CORS settings appropriate for your domain

---

## Quick Deploy Checklist

```bash
# 1. Test locally
npm run dev

# 2. Run linting
npm run lint

# 3. Build for production
npm run build

# 4. Test production build
npm run preview

# 5. Deploy to your platform
# (See instructions above for your chosen platform)
```

---

## Support

- **AI Studio Support:** https://ai.studio
- **Firebase Docs:** https://firebase.google.com/docs
- **Gemini API:** https://ai.google.dev
- **Vite Docs:** https://vitejs.dev

---

## Production Recommendations

1. **Enable CORS:** Configure for your domain only
2. **Rate Limiting:** Add rate limits to API endpoints
3. **API Key Rotation:** Regularly rotate Gemini API keys
4. **Monitoring:** Enable Google Cloud Monitoring
5. **Logging:** Configure structured logging
6. **Backups:** Regular Firestore backups
7. **Security:** Use Firebase Security Rules in `firestore.rules`

