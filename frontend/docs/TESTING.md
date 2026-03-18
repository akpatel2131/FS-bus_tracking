# Testing Guide

This document provides comprehensive testing guidelines for the Ticket Booking System.

## Manual Testing

### Test Case 1: Admin - Create Show with Valid Data

**Steps:**
1. Switch to Admin mode
2. Fill in show name: "Movie Night"
3. Select future date/time
4. Set total seats: 50
5. Click "Create Show"

**Expected:**
- ✅ Success message appears
- ✅ Form clears
- ✅ Show appears in list (navigate to "All Shows")

### Test Case 2: Admin - Form Validation

**Steps:**
1. Try to create show with empty name
2. Try to create show with past date
3. Try to create show with 0 seats
4. Try to create show with 501 seats

**Expected:**
- ✅ Error messages for each field
- ✅ Submit button disabled until valid
- ✅ Red border on invalid fields

### Test Case 3: User - Browse Shows

**Steps:**
1. Switch to User mode
2. View shows list

**Expected:**
- ✅ All available shows displayed
- ✅ Availability percentage shown
- ✅ "Sold Out" badge for full shows
- ✅ "Book Now" button enabled/disabled correctly

### Test Case 4: User - Seat Selection

**Steps:**
1. Click "Book Now" on a show
2. Click on various seats
3. Click on booked seats (red)
4. Click on already selected seat

**Expected:**
- ✅ Selected seats turn blue
- ✅ Booked seats cannot be selected
- ✅ Clicking selected seat deselects it
- ✅ Seat count updates in summary

### Test Case 5: User - Successful Booking

**Steps:**
1. Select 3 seats
2. Enter valid email
3. Click "Book 3 Seats"
4. Wait for confirmation

**Expected:**
- ✅ Status changes to PENDING
- ✅ Then CONFIRMED
- ✅ Success animation plays
- ✅ Auto-redirect after 3 seconds

### Test Case 6: User - Booking Validation

**Steps:**
1. Try to book without selecting seats
2. Try to book without email
3. Try to book with invalid email

**Expected:**
- ✅ Error message for no seats
- ✅ Error message for missing email
- ✅ Error message for invalid email format

### Test Case 7: Concurrent Booking

**Steps:**
1. Open two browser windows
2. Both navigate to same show
3. Both select same seats (e.g., 1, 2, 3)
4. Submit booking in Window 1
5. Try to submit in Window 2

**Expected:**
- ✅ Window 1 succeeds
- ✅ Window 2 gets error (seats already booked)
- ✅ Window 2 shows error message

### Test Case 8: Network Error Handling

**Steps:**
1. Stop backend server
2. Try to create a show
3. Try to book seats

**Expected:**
- ✅ Error message: "No response from server"
- ✅ Loading spinner disappears
- ✅ App remains functional

### Test Case 9: Responsive Design

**Steps:**
1. Resize browser to mobile (375px)
2. Test all features
3. Resize to tablet (768px)
4. Resize to desktop (1440px)

**Expected:**
- ✅ Layout adapts smoothly
- ✅ All features work at all sizes
- ✅ Touch-friendly on mobile

### Test Case 10: Browser Compatibility

**Browsers to test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Expected:**
- ✅ Consistent behavior across browsers
- ✅ No console errors
- ✅ Styles render correctly

## Performance Testing

### Load Time Test

**Metric:** First Contentful Paint (FCP)
- **Target:** < 1.5s
- **Measure:** Chrome DevTools Lighthouse

### Bundle Size Test

```bash
npm run build
```

**Expected:**
- Total bundle size < 500KB
- Main chunk < 200KB
- Vendor chunks properly split

### Network Request Test

**Expected:**
- Shows fetched once on mount
- No duplicate API calls
- Proper caching headers

## Automated Testing (Future)

### Unit Test Examples

```typescript
// CreateShow.test.tsx
describe('CreateShow', () => {
  it('validates form fields', () => {
    // Test form validation
  });

  it('submits form with valid data', () => {
    // Test successful submission
  });

  it('displays error on API failure', () => {
    // Test error handling
  });
});

// BookingPage.test.tsx
describe('BookingPage', () => {
  it('allows seat selection', () => {
    // Test seat clicking
  });

  it('prevents booked seat selection', () => {
    // Test booked seats
  });

  it('submits booking', () => {
    // Test booking submission
  });
});
```

### Integration Test Examples

```typescript
// api.test.ts
describe('API Service', () => {
  it('fetches shows successfully', () => {
    // Mock API and test
  });

  it('handles network errors', () => {
    // Test error scenarios
  });

  it('transforms errors correctly', () => {
    // Test error transformation
  });
});
```

## Regression Testing Checklist

Before each release, verify:

- [ ] All shows load correctly
- [ ] Create show form works
- [ ] Seat selection works
- [ ] Booking submission works
- [ ] Error handling works
- [ ] Loading states appear
- [ ] Success messages display
- [ ] Navigation works
- [ ] Role switching works
- [ ] Responsive design works

## Edge Cases to Test

### Empty States
- [ ] No shows exist
- [ ] Show has 0 seats available
- [ ] API returns empty array

### Boundary Values
- [ ] Show with 1 seat
- [ ] Show with 500 seats
- [ ] Show starting in 1 minute
- [ ] Show starting in 1 year

### Error Scenarios
- [ ] API timeout (10s)
- [ ] 404 show not found
- [ ] 409 conflict (concurrent booking)
- [ ] 500 server error
- [ ] Network disconnection

### Data Integrity
- [ ] Special characters in show name
- [ ] Very long show name (100+ chars)
- [ ] Invalid date formats
- [ ] Negative seat numbers
- [ ] Non-numeric seat input

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter to submit forms
- [ ] Escape to close modals
- [ ] Arrow keys for seat selection (future)

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Success messages are announced

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Focus indicators visible
- [ ] Error states clearly distinguishable

## Security Testing

### Input Validation
- [ ] XSS attempt in show name
- [ ] SQL injection attempt
- [ ] Script tags in email
- [ ] HTML in form fields

### API Security
- [ ] CORS properly configured
- [ ] No sensitive data in URLs
- [ ] No API keys in frontend
- [ ] HTTPS in production

## Performance Benchmarks

### Target Metrics
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **TTI:** < 3.5s
- **CLS:** < 0.1
- **FID:** < 100ms

### Tools
- Lighthouse
- WebPageTest
- Chrome DevTools Performance

## Test Data

### Sample Shows

```json
{
  "name": "Movie Marathon",
  "startTime": "2024-04-01T18:00:00Z",
  "totalSeats": 50
}

{
  "name": "Rock Concert",
  "startTime": "2024-04-15T20:00:00Z",
  "totalSeats": 100
}

{
  "name": "Theater Show",
  "startTime": "2024-05-01T19:30:00Z",
  "totalSeats": 30
}
```

### Sample Bookings

```json
{
  "showId": "show-uuid",
  "seatNumbers": [1, 2, 3],
  "userEmail": "test@example.com"
}
```

## CI/CD Testing

### Pre-commit Hooks
```bash
npm run lint
npm run type-check
```

### Pre-push Hooks
```bash
npm run build
npm run test
```

### PR Checks
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] Tests pass (when implemented)

## Bug Report Template

When reporting bugs, include:

```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
If applicable

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Node: 18.17
- npm: 9.8

**Console Errors:**
Paste any console errors
```

## Test Coverage Goals

When unit tests are implemented:
- **Statements:** > 80%
- **Branches:** > 70%
- **Functions:** > 80%
- **Lines:** > 80%

---

**Happy Testing! 🧪**
