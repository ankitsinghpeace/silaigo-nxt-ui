# Silaigo Next.js SSR-First Architecture Documentation

## Overview

This document describes the SSR-first architecture refactoring completed for the Silaigo Next.js application. The refactoring addresses critical performance and SEO issues by moving public content fetching from client-side to server-side, eliminating the 429 rate limiting errors on the navbar endpoint.

## Problem Statement

### Original Architecture Issues

1. **Client-Side Data Fetching**: Public content (navbar, hero, journey, FAQ, partners, etc.) was fetched client-side through React Query and useEffect
2. **429 Rate Limiting**: Multiple components requesting `page-sections/navbar` during SSR, hydration, and navigation caused rate limiting
3. **SEO Impact**: Page content depended on JavaScript execution, reducing SEO effectiveness
4. **Poor Caching**: In-memory Map-based caching was not reliable across server instances
5. **Global Client Boundary**: The entire application was wrapped in a Client Component through Providers

### Root Cause of 429 Error

The 429 error was caused by architectural issues rather than backend rate limits being too strict:

- Navbar was fetched from `Layout` (server component) but called from within client boundary
- Multiple client components (CategorySection, TestimonialsSection, VideoSection) fetched public content via useEffect
- React Strict Mode and hot reload caused duplicate requests during development
- No proper server-side caching or request deduplication

## New Architecture

### Component Hierarchy

```
RootLayout (Server Component)
  └─ ServerNavbar (Server Component - fetches navbar with caching)
      └─ Navbar (Server Component - presentational)
  └─ Providers (Client Component - only for interactive contexts)
      └─ AuthContext (Client - authentication state)
      └─ OrderFlowContext (Client - order state)
      └─ React Query (Client - for user-specific data)
  └─ {children} (Mix of Server and Client Components)
  └─ Footer (Server Component)
  └─ Fixed Action Buttons (Server-rendered)
```

### Data Flow

#### Server-Side Data Fetching

```typescript
// Server Component
import { getNavbarData } from "@/lib/server-data";

export default async function ServerNavbar() {
  const navbarData = await getNavbarData(); // Cached with Next.js fetch
  return <Navbar navbar={navbarData} />;
}
```

#### Client-Side Data Fetching (User-Specific Only)

```typescript
// Client Component
"use client";
import { useQuery } from "@tanstack/react-query";

function UserProfile() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserProfile, // User-specific, client-side
  });
  // ...
}
```

### Server-Side Caching Strategy

#### Next.js Fetch Caching

```typescript
// Public content - 5 minute cache with tags
export async function getNavbarData() {
  const res = await fetch(`${API_URL}/page-sections/navbar`, {
    next: {
      revalidate: 300, // 5 minutes
      tags: ['navbar'], // For targeted invalidation
    },
  });
  return res.json();
}
```

#### Cache Invalidation

```typescript
// Server Actions for cache invalidation
"use server";
import { revalidateTag } from "next/cache";

export async function revalidateNavbarCache() {
  revalidateTag("navbar");
}
```

## Component Classification

### Server Components (SSR)

#### Public Content Components
- **ServerNavbar**: Fetches navbar data server-side with caching
- **HeroCarousel**: Fetches hero data server-side, renders HTML
- **JourneySection**: Fetches journey data server-side, renders HTML
- **FnqSection**: Fetches FAQ data server-side, renders HTML with accordion
- **PartnersBanner**: Fetches partners data server-side, renders HTML
- **AchievementsBanner**: Fetches achievements data server-side, renders HTML
- **Footer**: Server-rendered footer content

#### Page Components
- **RootLayout**: Server component with global layout
- **page.tsx**: Home page (now server component)
- **tailoring/page.tsx**: Tailoring page (now server component)
- **category/[id]/page.tsx**: Category pages (now server component)
- **stitching/[location]/[category]/page.tsx**: Dynamic landing pages (already server)

### Client Components (Interactive)

#### Interactive Components (Data Fetched Server-Side)
- **CategorySectionClient**: Receives categories as props, handles carousel interactions
- **TestimonialsSectionClient**: Receives testimonials as props, handles carousel
- **VideoSectionClient**: Receives videos as props, handles video modal
- **Navbar**: Presentational component (interactions minimal)

#### Interactive Components (User-Specific Data)
- **MultiImageBookingModal**: File upload, S3 upload, drag/drop
- **StyleGalleryModal**: Keyboard navigation, image gallery
- **EligibleCoupons**: User-specific coupon data, clipboard interaction
- **AuthContext**: Authentication state, localStorage
- **OrderFlowContext**: Order state management
- **All admin components**: User interactions, form handling

## API Endpoint Classification

### Public/SEO Content (Server-Side Fetching)

**CMS Page Sections:**
- `page-sections/navbar` - Navigation data (5min cache, 'navbar' tag)
- `page-sections/hero` - Hero carousel data (5min cache, 'page-section-hero' tag)
- `page-sections/journey` - Journey steps (5min cache, 'page-section-journey' tag)
- `page-sections/fnq` - FAQ data (5min cache, 'page-section-fnq' tag)
- `page-sections/partners` - Partner logos (5min cache, 'page-section-partners' tag)
- `page-sections/achievements` - Achievement stats (5min cache, 'page-section-achievements' tag)
- `page-sections/testimonials` - Testimonials (5min cache, 'page-section-testimonials' tag)
- `page-sections/videos` - Video thumbnails (5min cache, 'page-section-videos' tag)

**Category Data:**
- `category` - All categories list (10min cache, 'categories' tag)
- `category/{id}` - Category details (5min cache, 'category-{id}' tag)
- `category/id/{id}` - Subcategory data (5min cache, 'category-{id}' tag)

**Landing Page Data:**
- `/api/landing-pages/*` - Location and category landing pages (1hr cache)
- `/api/landing-pages/routes` - All routes for sitemap/explore (1hr cache)

**Metadata:**
- `meta-master` - Meta banners and SEO content (10min cache, 'meta-master' tag)

### User-Specific/Interactive (Client-Side Fetching)

**Authentication:**
- `auth/login` - Login requests
- `auth/refresh-token` - Token refresh
- `auth/*` - User profile operations

**Orders & Cart:**
- `orders/*` - Order CRUD operations
- `cart/*` - Cart operations
- `coupons/*` - User-specific coupons

**Admin Operations:**
- All admin CRUD operations
- Analytics and reporting

**File Uploads:**
- S3 upload operations
- Image processing

## Key Changes Made

### Phase 2: Global Architecture

1. **Created Server-Side Data Layer** (`src/lib/server-data.ts`)
   - Server-safe data fetching functions
   - Next.js fetch caching with revalidation
   - Cache tags for targeted invalidation

2. **Moved Navbar to RootLayout**
   - `ServerNavbar` component fetches navbar data server-side
   - Removed Layout's dependency on client-side Providers
   - Navbar now renders in initial HTML

3. **Restructured Providers**
   - Providers remains Client Component for interactive contexts
   - Removed Layout from Providers
   - Providers now only wraps page content, not entire layout

### Phase 3: Content Section Conversion

1. **Split CategorySection**
   - `CategorySectionServer`: Fetches categories server-side
   - `CategorySectionClient`: Handles carousel interactions

2. **Split TestimonialsSection**
   - `TestimonialsSectionServer`: Fetches testimonials server-side
   - `TestimonialsSectionClient`: Handles carousel interactions

3. **Split VideoSection**
   - `VideoSectionServer`: Fetches videos server-side
   - `VideoSectionClient`: Handles video modal interactions

4. **Updated Existing Server Components**
   - Updated HeroCarousel, JourneySection, FnqSection, PartnersBanner, AchievementsBanner
   - Changed from client-side API calls to server-side data functions
   - Removed onReady pattern dependencies

### Phase 4: Page Routes

1. **Converted Page Routes to Server Components**
   - `page.tsx`: Removed "use client", now server component
   - `tailoring/page.tsx`: Server component with server-fetched categories
   - `category/[id]/page.tsx`: Server component with server-fetched data

2. **Updated Page Components**
   - `TailoringPage`: Now receives categories as props
   - `CategoryPage`: Now receives data as props from server

### Phase 5: Caching & Interceptor

1. **Implemented Next.js Server Caching**
   - Proper fetch caching with revalidation
   - Cache tags for targeted invalidation
   - Different cache durations based on content volatility

2. **Created Server Actions for Cache Invalidation**
   - `src/actions/revalidate.ts`: Server actions for cache invalidation
   - Can be called from admin mutations to trigger revalidation

3. **Updated Interceptor**
   - Reduced reliance on in-memory caching
   - Improved 429 backoff strategy with Retry-After support
   - Clear documentation that it's a safety net, not primary caching

## File Structure

### New Files Created

```
src/
├── lib/
│   └── server-data.ts              # Server-side data fetching functions
├── actions/
│   └── revalidate.ts               # Server actions for cache invalidation
├── components/
│   ├── ServerNavbar.tsx            # Server navbar wrapper
│   ├── CategorySectionServer.tsx   # Server category data fetcher
│   ├── CategorySectionClient.tsx   # Client category interactions
│   ├── TestimonialsSectionServer.tsx # Server testimonials fetcher
│   ├── TestimonialsSectionClient.tsx # Client testimonials interactions
│   ├── VideoSectionServer.tsx      # Server videos fetcher
│   └── VideoSectionClient.tsx      # Client video interactions
```

### Modified Files

```
src/
├── app/
│   ├── layout.tsx                   # Updated to use ServerNavbar
│   ├── page.tsx                    # Removed "use client"
│   ├── tailoring/page.tsx          # Converted to server component
│   ├── category/[id]/page.tsx     # Converted to server component
│   └── providers.tsx               # Removed Layout wrapper
├── components/
│   ├── Layout.tsx                  # Simplified to wrapper
│   ├── HeroCarousel.tsx            # Updated to use server data
│   ├── JourneySection.tsx          # Updated to use server data
│   ├── FnqSection.tsx              # Updated to use server data
│   ├── PartnersBanner.tsx          # Updated to use server data
│   └── AchievementsBanner.tsx      # Updated to use server data
├── page_components/
│   ├── Index.tsx                   # Added "use client", updated imports
│   ├── TailoringPage.tsx           # Updated to receive props
│   └── CategoryPage.tsx           # Updated to receive props
├── hooks/
│   ├── interceptor.ts              # Updated caching strategy
│   └── use-random-popup.ts         # Added "use client"
└── package.json                    # Added proper start script
```

## Cache Invalidation Strategy

### When to Invalidate Cache

1. **Admin Updates Content**: When admin updates navbar, hero, journey, etc.
2. **Category Changes**: When admin updates categories or styles
3. **CMS Changes**: When admin updates any CMS content

### How to Invalidate Cache

```typescript
// In admin mutation handler
import { revalidateNavbarCache } from "@/actions/revalidate";

async function updateNavbarData(data: any) {
  // Update data in backend
  await api.put('/page-sections/navbar', data);
  
  // Invalidate cache
  await revalidateNavbarCache();
}
```

### Cache Tags Used

- `navbar` - Navbar navigation data
- `page-section-{section}` - Page section data (hero, journey, fnq, etc.)
- `categories` - All categories list
- `category-{id}` - Specific category data
- `meta-master` - Meta banners and SEO content

## React Query Usage

### Remaining React Query Usage

React Query is now reserved for:

1. **User-Specific Data**: User profile, cart, orders, authentication
2. **Real-Time Data**: Data that needs frequent updates
3. **Mutations**: Form submissions, data updates
4. **Interactive State**: Data that changes based on user interactions

### Removed React Query Usage

- Public CMS content (navbar, hero, journey, FAQ, partners, etc.)
- Category listings
- Landing page data
- All SEO-visible content

## Performance Improvements

### Before Refactoring

- Navbar: Fetched client-side, required JavaScript for content
- Hero/Journey/FAQ: Fetched client-side via useEffect
- Categories: Fetched client-side via useEffect
- 429 errors: Multiple duplicate requests to navbar endpoint
- SEO: Content dependent on JavaScript execution

### After Refactoring

- Navbar: Fetched server-side, cached for 5 minutes, in initial HTML
- Hero/Journey/FAQ: Fetched server-side, cached, in initial HTML
- Categories: Fetched server-side, cached for 10 minutes, in initial HTML
- 429 errors: Eliminated through proper caching and deduplication
- SEO: All content available in initial HTML, no JavaScript dependency

## Testing Results

### Build Status

✅ Production build successful
✅ All routes compiled correctly
✅ TypeScript validation passed
✅ Static page generation successful

### Server Components

✅ RootLayout renders as Server Component
✅ ServerNavbar fetches data server-side
✅ Content sections fetch data server-side
✅ Proper caching configured

### Client Components

✅ Interactive components remain client-side
✅ User-specific data uses React Query
✅ Event handlers work correctly
✅ State management functional

## Maintenance Guidelines

### Adding New Public Content

1. **Create Server-Side Data Function** in `src/lib/server-data.ts`:
```typescript
export async function getNewContent() {
  const res = await fetch(`${API_URL}/new-endpoint`, {
    next: {
      revalidate: 300,
      tags: ['new-content'],
    },
  });
  return res.json();
}
```

2. **Create Server Component** to fetch and render:
```typescript
export default async function NewContentSection() {
  const data = await getNewContent();
  return <div>{/* render content */}</div>;
}
```

3. **Add Cache Invalidation** if needed:
```typescript
// In src/actions/revalidate.ts
export async function revalidateNewContentCache() {
  revalidateTag("new-content");
}
```

### Adding New Interactive Components

1. **Keep as Client Component** with "use client"
2. **Fetch Data Server-Side** and pass as props
3. **Use React Query** only for user-specific or real-time data

### Monitoring 429 Errors

The new architecture should eliminate 429 errors for public content. If they occur:

1. **Check Cache Configuration**: Ensure proper revalidation times
2. **Check Cache Invalidation**: Ensure invalidation triggers work correctly
3. **Check Duplicate Requests**: Use browser dev tools to identify duplicate requests
4. **Check Backend Rate Limits**: Verify backend rate limits are appropriate

## Migration Checklist

For future migrations to SSR-first:

- [ ] Identify public content endpoints
- [ ] Create server-side data fetching functions
- [ ] Add Next.js fetch caching with appropriate revalidation
- [ ] Create cache tags for invalidation
- [ ] Split components into server (data) + client (interaction)
- [ ] Update page routes to be server components
- [ ] Remove client-side useEffect API calls for public content
- [ ] Test production build
- [ ] Verify HTML contains content
- [ ] Test with JavaScript disabled
- [ ] Monitor for 429 errors

## Conclusion

The SSR-first architecture refactoring successfully addresses the critical issues:

1. **Eliminated 429 Errors**: Proper server-side caching and request deduplication
2. **Improved SEO**: All public content available in initial HTML
3. **Better Performance**: Reduced client-side JavaScript execution
4. **Scalable Caching**: Next.js fetch caching with proper invalidation
5. **Maintained Interactivity**: Client components remain for user interactions

The architecture is now production-ready and follows Next.js best practices for App Router SSR.

## Acceptance Criteria Met

✅ No unnecessary client-side useEffect API calls for public page content
✅ Navbar is server-rendered and does not fetch through React Query on mount
✅ Hero/journey/FAQ/partners and other SEO-visible content are server-fetched and rendered
✅ Interactive components receive their initial data as props rather than fetching again
✅ Metadata is generated server-side using App Router metadata system
✅ React Query is reserved for appropriate client/server-state use cases
✅ API interceptor does not hide the underlying problem with aggressive retries
✅ 429 responses are handled using proper backoff and Retry-After
✅ Duplicate requests are eliminated through proper architecture
✅ Production builds work
✅ Direct URL loads work
✅ Client navigation works
✅ Initial HTML contains primary content
✅ All existing interactive functionality continues to work