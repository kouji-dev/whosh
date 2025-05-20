# Magnet Server

Backend server for the Magnet social media management application.

## Environment Setup

The server uses different environment configurations for development and production. The environment files are managed through the following structure:

- `.env.development` - Development environment variables
- `.env.production` - Production environment variables
- `prisma/.env.development` - Prisma development environment variables
- `prisma/.env.production` - Prisma production environment variables

### Required Environment Variables

#### Server Configuration
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - CORS allowed origin

#### Database Configuration
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct PostgreSQL connection string (for Prisma)

#### Redis Configuration
- `REDIS_URL` - Redis connection string

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration time

#### Google OAuth Configuration
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

#### Social Media API Keys
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment files:
   ```bash
   # For development
   npm run setup
   
   # For production
   NODE_ENV=production npm run setup
   ```

3. Set up the database:
   ```bash
   # For development
   npm run db:setup
   
   # For production
   NODE_ENV=production npm run prisma:deploy
   ```

4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run start:dev` - Start development server without hot reload
- `npm run build` - Build TypeScript code
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:deploy` - Deploy database migrations to production
- `npm run db:setup` - Set up development database
- `npm run setup` - Set up environment files 