# Whosh - Social Media Management Platform

A modern social media management platform similar to Buffer and SocialPilot, built with Next.js and Node.js.

## Features

- Social media post scheduling
- Multi-platform integration (Twitter, Facebook, Instagram, LinkedIn, etc.)
- Analytics and reporting
- Team collaboration
- Content calendar
- Bulk scheduling
- Best time to post suggestions

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whosh.git
cd whosh
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env files in both client and server directories
cp client/.env.example client/.env
cp server/.env.example server/.env
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Project Structure

```
whosh/
├── client/                 # Frontend Next.js application
├── server/                # Backend Node.js/Express application
├── shared/               # Shared code between frontend and backend
└── docker/              # Docker configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 