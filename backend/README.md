# Rwanda Real Estate Platform - Backend API

## Overview

This is the backend API for the Rwanda Real Estate Platform, built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with TypeORM
- **Cache:** Redis
- **Authentication:** JWT
- **File Upload:** Multer
- **Real-time:** Socket.io
- **Validation:** Joi
- **Logging:** Winston

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with your database and service credentials

4. Run database migrations:
```bash
npm run migrate
```

5. (Optional) Seed database with sample data:
```bash
npm run seed
```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Production

Build the project:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Properties
- `GET /api/v1/properties` - Get all properties
- `GET /api/v1/properties/:id` - Get property by ID
- `POST /api/v1/properties` - Create property (auth required)
- `PUT /api/v1/properties/:id` - Update property (auth required)
- `DELETE /api/v1/properties/:id` - Delete property (auth required)

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `PUT /api/v1/users/preferences` - Update user preferences

### Messages
- `GET /api/v1/messages/conversations` - Get all conversations
- `GET /api/v1/messages/conversation/:userId` - Get conversation with user
- `POST /api/v1/messages` - Send message

### Favorites
- `GET /api/v1/favorites` - Get user favorites
- `POST /api/v1/favorites/:propertyId` - Add to favorites
- `DELETE /api/v1/favorites/:propertyId` - Remove from favorites

### Reviews
- `GET /api/v1/reviews/property/:propertyId` - Get property reviews
- `POST /api/v1/reviews` - Create review

### Search
- `GET /api/v1/search` - Search properties
- `GET /api/v1/search/recommendations` - Get recommendations

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── validators/      # Input validation
│   ├── utils/           # Utility functions
│   ├── socket/          # WebSocket handlers
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── logs/                # Application logs
├── uploads/             # Temporary file uploads
└── package.json
```

## License

MIT
