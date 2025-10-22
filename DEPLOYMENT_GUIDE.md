# Vercel Deployment Guide for QA Portfolio with Database

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **PostgreSQL Database**: We'll use Vercel Postgres (recommended) or any PostgreSQL database

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add database integration and Vercel deployment setup"
   git push origin main
   ```

## Step 2: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Create a new project**:
   ```bash
   vercel
   ```

4. **Add Vercel Postgres**:
   ```bash
   vercel storage create postgres
   ```

5. **Get your database URL**:
   ```bash
   vercel env pull .env.local
   ```

### Option B: External PostgreSQL Database

If you prefer to use an external database (like Supabase, Railway, or Neon):

1. Create a PostgreSQL database
2. Get your connection string
3. Add it to Vercel environment variables as `DATABASE_URL`

## Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - Framework Preset: Next.js
   - Root Directory: `qa-portfolio` (if your repo has nested structure)
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: `production`

6. **Deploy**

### Method 2: Vercel CLI

1. **Initialize Vercel project**:
   ```bash
   vercel
   ```

2. **Add environment variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NODE_ENV
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## Step 4: Set Up Database Schema

After deployment, you need to run database migrations:

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Push database schema**:
   ```bash
   npm run db:push
   ```

3. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

## Step 5: Update Frontend to Use API

The current implementation uses local storage. To use the database, you'll need to update the frontend to call the API endpoints:

### Update TicketService

Replace the local storage implementation with API calls:

```typescript
// lib/ticketService.ts
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api' 
  : 'http://localhost:3000/api';

export class TicketService {
  static async getAllTickets(): Promise<Ticket[]> {
    const response = await fetch(`${API_BASE}/tickets`);
    return response.json();
  }

  static async createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // ... other methods
}
```

## Step 6: Environment Variables

Make sure these environment variables are set in Vercel:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NODE_ENV`: `production`

## Step 7: Custom Domain (Optional)

1. **Go to your project settings in Vercel**
2. **Add your custom domain**
3. **Update DNS records as instructed**

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check your `DATABASE_URL` environment variable
   - Ensure your database allows connections from Vercel IPs

2. **Build Errors**:
   - Make sure all dependencies are in `package.json`
   - Check that Prisma client is generated

3. **API Routes Not Working**:
   - Verify API routes are in the correct directory (`app/api/`)
   - Check Vercel function logs for errors

### Useful Commands:

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

## Post-Deployment Checklist

- [ ] Database schema is created
- [ ] API endpoints are working
- [ ] Frontend is calling API instead of local storage
- [ ] File uploads are working (if using external storage)
- [ ] Environment variables are set
- [ ] Custom domain is configured (if applicable)

## File Storage for Attachments

For production file storage, consider:

1. **Vercel Blob**: `npm install @vercel/blob`
2. **AWS S3**: `npm install aws-sdk`
3. **Cloudinary**: `npm install cloudinary`

Update the attachment handling in your API routes to use these services instead of local file storage.

## Monitoring

Set up monitoring with:
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking
- **Uptime monitoring**: Services like UptimeRobot

Your QA Portfolio with embedded ticket management system is now ready for production deployment!

