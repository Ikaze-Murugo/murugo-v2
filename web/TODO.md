# Web Frontend TODO

## Critical Bug Fixes (Before Phase 4)

### Auth Issues
- [x] Fix auth token field mismatch (backend sends `token`, frontend expects `accessToken`)
- [x] Fix refresh endpoint path (should be `/auth/refresh-token` not `/auth/refresh`)

### API Path Issues
- [x] Fix user API paths (`/users/profile` not `/user/profile`)
- [x] Fix user preferences path (`/users/preferences` not `/user/preferences`)
- [x] Fix favorites add endpoint (use URL param not body)

### Type Alignment
- [x] Update Property type to match backend (listerId, propertyType, transactionType, location object, sizeSqm, viewsCount, contactCount, shareCount)
- [x] Update User type to handle optional name and profile
- [x] Update PaginatedResponse to match backend pagination shape

## Phase 4: Property Listings
- [ ] Home page with featured/latest properties
- [ ] Property list page with query params
- [ ] Property detail page with gallery
- [ ] PropertyCard component
- [ ] PropertyFilters component
- [ ] PropertyGallery component (carousel)
- [ ] ContactButton component (WhatsApp link)
- [ ] View count tracking
- [ ] Favorite button integration

## Phase 5: Lister Dashboard
- [ ] My listings page (use propertyApi.getMyProperties)
- [ ] Add property form
- [ ] Edit property form
- [ ] Image upload with Cloudinary
- [ ] Property status management
- [ ] Property analytics display

## Phase 6: Profile & Favorites
- [ ] Profile page
- [ ] Edit profile page
- [ ] Avatar upload
- [ ] Password change
- [ ] Favorites list page
- [ ] Remove from favorites

## Phase 7: Optimization & Deployment
- [ ] Add SEO metadata to all pages
- [ ] Optimize images with next/image
- [ ] Add loading skeletons
- [ ] Error boundaries
- [ ] 404 page
- [ ] Deploy to Vercel
- [ ] Configure custom domain
- [ ] Test on mobile devices
