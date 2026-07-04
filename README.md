# Resume Screener Frontend

The Next.js frontend for the Resume Screener application.

## Deployment

This frontend is deployed on Vercel.

## Development

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.local.example` to `.env.local`
- Update `NEXT_PUBLIC_API_URL` with your backend URL

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## Production

The frontend is deployed on Vercel at:
https://resume-screener-front.vercel.app

## API Endpoint

The frontend communicates with the backend at:
`https://resume-screener-backend-9xeh.onrender.com/api`

## Files

- `src/` - Source code (React components, pages, store)
- `next.config.js` - Next.js configuration
- `package.json` - Dependencies and scripts
- `.env.local.example` - Environment variables template

## License

MIT

## Author

Neha Thakur