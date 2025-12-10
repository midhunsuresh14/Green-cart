# Playwright E2E Tests

This directory contains end-to-end tests for the GreenCart application using Playwright.

## Available Test Suites

### Test Case 1: Login Functionality (`login.spec.js`)

The `login.spec.js` file contains comprehensive tests for the login functionality, covering:

- ✅ Login page display and UI elements
- ✅ Form validation (email format, required fields, password length)
- ✅ Password visibility toggle
- ✅ Successful login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Loading states during login
- ✅ Navigation after successful login (home page and admin dashboard)
- ✅ Navigation to signup and forgot password pages
- ✅ Network error handling
- ✅ Already logged-in user redirection

### Test Case 2: Signup/Registration Functionality (`signup.spec.js`)

The `signup.spec.js` file contains comprehensive tests for user registration, covering:
- ✅ Signup page display and UI elements
- ✅ Form validation (name, email, phone, password, confirm password)
- ✅ Password visibility toggle
- ✅ Password strength indicator
- ✅ Successful registration
- ✅ Error handling for existing email
- ✅ Loading states during registration
- ✅ Navigation after successful signup
- ✅ Network error handling

### Test Case 3: Shopping Cart Management (`shopping-cart.spec.js`)

The `shopping-cart.spec.js` file contains comprehensive tests for shopping cart functionality, covering:
- ✅ Empty cart state
- ✅ Adding items to cart
- ✅ Displaying cart items
- ✅ Updating item quantities
- ✅ Removing items from cart
- ✅ Clearing entire cart
- ✅ Calculating total price
- ✅ Navigation to checkout
- ✅ Cart persistence after page refresh
- ✅ Multiple items in cart

### Test Case 4: Product Browsing & Search (`product-browsing.spec.js`)

The `product-browsing.spec.js` file contains comprehensive tests for product browsing and search, covering:
- ✅ Product listing display
- ✅ Product card information
- ✅ Product search functionality
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Sorting (price low to high, high to low)
- ✅ In-stock filtering
- ✅ Navigation to product details
- ✅ Product images display
- ✅ Empty search results handling
- ✅ Combined filters

### Test Case 5: Wishlist Management (`wishlist.spec.js`)

The `wishlist.spec.js` file contains comprehensive tests for wishlist functionality, covering:
- ✅ Empty wishlist state
- ✅ Adding items to wishlist
- ✅ Displaying wishlist items
- ✅ Removing items from wishlist
- ✅ Adding wishlist items to cart
- ✅ Wishlist persistence
- ✅ Multiple wishlist items
- ✅ Navigation to product details from wishlist
- ✅ Toggle wishlist item (add/remove)
- ✅ Wishlist count in navbar

## Prerequisites

1. **Install Playwright browsers** (if not already installed):
   ```bash
   npx playwright install
   ```

2. **Start the backend server** (if testing against real API):
   - The backend should be running on `http://127.0.0.1:5000` (or update the API URL in the test)

3. **Start the frontend development server**:
   ```bash
   npm start
   ```
   The Playwright config will automatically start the dev server if it's not running.

## Running Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run specific test suites:
```bash
npm run test:e2e:login      # Login functionality tests
npm run test:e2e:signup    # Signup/Registration tests
npm run test:e2e:cart       # Shopping Cart tests
npm run test:e2e:products  # Product Browsing & Search tests
npm run test:e2e:wishlist  # Wishlist Management tests
npm run test:e2e:all       # Run all test suites
```

### Run tests in UI mode (interactive):
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

### Run tests in debug mode:
```bash
npm run test:e2e:debug
```

## Test Configuration

The Playwright configuration is in `playwright.config.js` at the root of the frontend directory.

### Base URL
By default, tests run against `http://localhost:3000`. You can override this by setting the `PLAYWRIGHT_TEST_BASE_URL` environment variable:

```bash
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000 npm run test:e2e
```

### Browsers
Tests run on:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

## Test Data

Update the test credentials in `login.spec.js` if needed:

```javascript
const validEmail = 'test@example.com';
const validPassword = 'password123';
const adminEmail = 'admin@greencart.local';
const adminPassword = 'Admin123!';
```

**Note**: The tests use mocked API responses by default. To test against the real backend API, comment out the `page.route()` calls in the test file.

## Viewing Test Results

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

## Writing New Tests

1. Create a new `.spec.js` file in the `tests/` directory
2. Follow the same structure as `login.spec.js`
3. Use Playwright's page object model and best practices
4. Mock API responses when testing UI behavior without backend dependencies

## Troubleshooting

### Tests fail with "Navigation timeout"
- Ensure the frontend dev server is running on port 3000
- Check that the backend API is accessible (if not using mocks)

### Tests fail with "Element not found"
- The UI might have changed. Update selectors in the test file
- Use Playwright's codegen tool to generate selectors: `npx playwright codegen http://localhost:3000`

### Browser not found
- Run `npx playwright install` to install browsers
- Or install specific browser: `npx playwright install chromium`

