# Rwanda Real Estate Platform

A comprehensive real estate platform designed for the Rwandan market, connecting property listers (landlords, commissioners, and agencies) with potential tenants and buyers.

## Project Structure

```
rwanda-real-estate-app/
├── backend/          # Node.js + Express API
├── mobile/           # React Native + Expo mobile app
├── shared/           # Shared types and utilities
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## Features

### For Property Listers
- Create and manage property listings
- Upload multiple images and videos
- Track property views, contacts, and shares
- Receive inquiries via in-app messaging or WhatsApp
- Analytics dashboard for listing performance
- Verification badges for credibility

### For Property Seekers
- Browse and search properties with advanced filters
- Interactive map view
- Save favorite properties
- In-app messaging with listers
- WhatsApp integration for quick contact
- Personalized recommendations based on preferences
- Property comparison

### Platform Features
- Secure authentication with OTP verification
- Real-time messaging
- Push notifications
- Social media sharing
- Multi-language support (English, French, Kinyarwanda)
- Review and rating system
- Location-based search with Rwanda administrative divisions

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + TypeORM
- Redis for caching
- Socket.io for real-time features
- JWT authentication
- AWS S3/Cloudinary for file storage

### Mobile
- React Native + Expo
- React Navigation
- Zustand for state management
- React Query for data fetching
- React Native Paper for UI
- React Native Maps
- Socket.io Client

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Expo CLI

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env file
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
cp .env.example .env
# Configure .env file
npm start
```

## Documentation

- [Backend Documentation](./backend/README.md)
- [Mobile App Documentation](./mobile/README.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Rwanda-Specific Features

- Administrative divisions (District, Sector, Cell)
- RWF currency support
- Local amenities (EUCL electricity, water availability)
- Integration with local payment methods (MTN Mobile Money, Airtel Money)
- Kinyarwanda language support

## Roadmap

### Phase 1 (MVP)
- ✅ User authentication
- ✅ Property CRUD operations
- ✅ Basic search and filters
- ✅ In-app messaging
- ✅ WhatsApp integration

### Phase 2
- Advanced search with Elasticsearch
- AI-powered recommendations
- User verification system
- Reviews and ratings
- Property analytics

### Phase 3
- Payment gateway integration
- Video tours and virtual tours
- Multi-language support
- Admin dashboard

### Future
- Mortgage calculator
- Legal document templates
- Property management features
- Integration with Rwanda's LAIS system

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

MIT

## Support

For support, email support@rwandarealestate.com or join our community forum.
