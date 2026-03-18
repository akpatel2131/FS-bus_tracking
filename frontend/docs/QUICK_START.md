# 🚀 Quick Start Guide

Get the Ticket Booking System up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:5000`

## Installation (1 minute)

```bash
# 1. Navigate to project directory
cd ticket-booking-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

## Configuration (30 seconds)

Edit `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Start Development Server (10 seconds)

```bash
npm run dev
```

Visit: **http://localhost:3000**

## First Steps

### As an Admin

1. Click **"Admin"** button in the header
2. Fill in the create show form:
   - **Name**: "Movie Night"
   - **Start Time**: Select a future date/time
   - **Total Seats**: 50
3. Click **"Create Show"**
4. Navigate to **"All Shows"** to see your created show

### As a User

1. Click **"User"** button in the header
2. Click **"Book Now"** on any available show
3. Select seats by clicking on the grid
4. Enter your email
5. Click **"Book X Seats"**
6. See confirmation and automatic redirect

## Troubleshooting

### Port already in use?

```bash
# Use different port
npm run dev -- --port 3001
```

### Backend not responding?

1. Ensure backend is running on port 5000
2. Check `.env` file has correct URL
3. Verify CORS is enabled on backend

### Build errors?

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the full [README.md](../README.md)
- Check [API Documentation](./API.md)
- Explore [Deployment Guide](./DEPLOYMENT.md)

## Project Structure Overview

```
src/
├── components/     # React components
│   ├── Admin/     # Admin dashboard components
│   ├── User/      # User-facing components
│   └── common/    # Shared components
├── context/       # Global state (Context API)
├── services/      # API integration
├── types/         # TypeScript definitions
└── index.css      # Global styles
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code
```

## Features at a Glance

✅ **Admin Panel** - Create and manage shows
✅ **User Dashboard** - Browse and book shows
✅ **Interactive Seats** - Visual seat selection
✅ **Real-time Updates** - Live availability tracking
✅ **Form Validation** - Client-side validation
✅ **Error Handling** - User-friendly error messages
✅ **Responsive Design** - Works on all devices
✅ **TypeScript** - Full type safety

## Quick Test Workflow

1. **Admin**: Create a show with 20 seats
2. **User**: Open in new tab/incognito
3. **User**: Book 3 seats (e.g., 1, 2, 3)
4. **Admin**: Refresh show list → See 17 available seats
5. **User**: Try to book seat 1 again → Should be disabled (red)

## Demo Data

For testing, try creating these shows:

| Name | Time | Seats |
|------|------|-------|
| Movie Marathon | Tomorrow 6 PM | 50 |
| Rock Concert | Next Week 8 PM | 100 |
| Theater Show | Next Month 7 PM | 30 |

## Common Use Cases

### Scenario 1: Fully Booked Show
1. Create show with 5 seats
2. Book all 5 seats
3. Show should display "Sold Out"

### Scenario 2: Concurrent Booking
1. Open two browser windows
2. Both select same seats
3. First to submit gets the seats
4. Second sees error message

### Scenario 3: Invalid Form
1. Try to create show without name
2. See validation error
3. Try past date → See error
4. Try 0 seats → See error

## Performance Tips

- Use **Chrome DevTools** to monitor network requests
- Check **React DevTools** for component re-renders
- Monitor **Console** for any errors

## Getting Help

- Check [README.md](../README.md) for detailed documentation
- Review [API.md](./API.md) for API integration details
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## What's Next?

After getting comfortable with the basics:

1. Explore the codebase structure
2. Try modifying the UI styles
3. Add new features (e.g., filtering shows)
4. Set up production deployment
5. Integrate with real backend

---

**Happy Coding! 🎉**
