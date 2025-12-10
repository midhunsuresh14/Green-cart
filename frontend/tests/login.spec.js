const { test, expect } = require('@playwright/test');

/**
 * Test Case 1: Login Functionality
 * 
 * This test suite covers all aspects of the login functionality including:
 * - Successful login with valid credentials
 * - Form validation (email format, required fields)
 * - Error handling for invalid credentials
 * - UI interactions (password visibility toggle, links)
 * - Navigation after successful login
 * - Loading states
 */

test.describe('Login Functionality', () => {
  // Test data - Update these with valid test credentials
  const validEmail = 'test@example.com';
  const validPassword = 'password123';
  const invalidEmail = 'invalid-email';
  const invalidPassword = 'wrongpass';
  const adminEmail = 'admin@greencart.local';
  const adminPassword = 'Admin123!';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
    // Wait for the login form to be visible
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should display login page correctly', async ({ page }) => {
    // Verify page title and heading
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await expect(page.locator('text=Sign in to your GreenCart account')).toBeVisible();
    
    // Verify form elements are present
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
    
    // Verify links are present
    await expect(page.locator('a:has-text("Forgot password?")')).toBeVisible();
    await expect(page.locator('a:has-text("Create one here")')).toBeVisible();
  });

  test('should show validation error for empty email field', async ({ page }) => {
    // Focus on email field and then blur to trigger validation
    const emailInput = page.locator('input[name="email"]');
    await emailInput.focus();
    await emailInput.blur();
    
    // Check for validation error
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    
    // Enter invalid email
    await emailInput.fill(invalidEmail);
    await emailInput.blur();
    
    // Check for validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should show validation error for empty password field', async ({ page }) => {
    // Focus on password field and then blur to trigger validation
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.focus();
    await passwordInput.blur();
    
    // Check for validation error
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show validation error for password less than 6 characters', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    
    // Enter short password
    await passwordInput.fill('12345');
    await passwordInput.blur();
    
    // Check for validation error
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[aria-label="toggle password visibility"]');
    
    // Enter password
    await passwordInput.fill('testpassword123');
    
    // Initially password should be hidden (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await toggleButton.click();
    
    // Password should now be visible (type="text")
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle again
    await toggleButton.click();
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Mock API response for invalid credentials - match both possible API URL patterns
    await page.route('**/api/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        })
      });
    });

    // Fill in valid email format but wrong credentials
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill(invalidPassword);
    
    // Submit form
    await page.locator('button:has-text("Sign In")').click();
    
    // Wait for error message - Material-UI Alert component with role="alert"
    // The error text should be visible in the alert
    await expect(
      page.locator('[role="alert"]:has-text("Invalid email or password")')
        .or(page.locator('text=Invalid email or password'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state during login', async ({ page }) => {
    // Create a promise to control when the route fulfills
    let fulfillRoute;
    const routeFulfilled = new Promise(resolve => { fulfillRoute = resolve; });

    // Mock API response with delay
    await page.route('**/api/login', async route => {
      // Wait a bit before fulfilling to allow loading state to show
      await new Promise(resolve => setTimeout(resolve, 800));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock-token',
          user: {
            id: '1',
            email: validEmail,
            name: 'Test User',
            role: 'user'
          }
        })
      });
      fulfillRoute();
    });

    // Fill in credentials
    await page.locator('input[name="email"]').fill(validEmail);
    await page.locator('input[name="password"]').fill(validPassword);
    
    // Submit form
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();
    
    // Check for loading state immediately after clicking
    // The button should show "Signing in..." text and be disabled
    // Wait a bit for the state to update
    await page.waitForTimeout(100);
    
    // Check for loading text - the button text changes to "Signing in..."
    const loadingText = page.locator('text=Signing in...');
    
    // Also check if button is disabled (it should be)
    const submitButtonAfterClick = page.locator('button[type="submit"]');
    
    // At least the loading text should be visible
    await expect(loadingText).toBeVisible({ timeout: 1000 });
    
    // Button should be disabled during loading
    await expect(submitButtonAfterClick).toBeDisabled();
    
    // Wait for the route to complete
    await routeFulfilled;
  });

  test('should successfully login with valid credentials and navigate to home', async ({ page, context }) => {
    // Mock successful API response
    await page.route('**/api/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token: 'mock-jwt-token-12345',
          user: {
            id: '1',
            email: validEmail,
            name: 'Test User',
            phone: '1234567890',
            role: 'user'
          }
        })
      });
    });

    // Fill in valid credentials
    await page.locator('input[name="email"]').fill(validEmail);
    await page.locator('input[name="password"]').fill(validPassword);
    
    // Submit form
    await page.locator('button:has-text("Sign In")').click();
    
    // Wait for navigation to home page
    await page.waitForURL('**/', { timeout: 5000 });
    
    // Verify we're on the home page
    expect(page.url()).toContain('/');
    
    // Verify user data is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    expect(token).toBeTruthy();
    expect(user).toBeTruthy();
    
    const userData = JSON.parse(user);
    expect(userData.email).toBe(validEmail);
  });

  test('should navigate admin user to admin dashboard after login', async ({ page }) => {
    // Mock successful API response for admin user
    await page.route('**/api/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token: 'mock-jwt-token-admin',
          user: {
            id: '1',
            email: adminEmail,
            name: 'Admin User',
            phone: '1234567890',
            role: 'admin'
          }
        })
      });
    });

    // Fill in admin credentials
    await page.locator('input[name="email"]').fill(adminEmail);
    await page.locator('input[name="password"]').fill(adminPassword);
    
    // Submit form
    await page.locator('button:has-text("Sign In")').click();
    
    // Wait for navigation to admin dashboard
    await page.waitForURL('**/admin', { timeout: 5000 });
    
    // Verify we're on the admin page
    expect(page.url()).toContain('/admin');
  });

  test('should navigate to signup page when clicking signup link', async ({ page }) => {
    // Click on signup link
    await page.locator('a:has-text("Create one here")').click();
    
    // Wait for navigation to signup page
    await page.waitForURL('**/signup', { timeout: 5000 });
    
    // Verify we're on the signup page
    expect(page.url()).toContain('/signup');
  });

  test('should navigate to forgot password page when clicking forgot password link', async ({ page }) => {
    // Click on forgot password link
    await page.locator('a:has-text("Forgot password?")').click();
    
    // Wait for navigation to forgot password page
    await page.waitForURL('**/forgot-password', { timeout: 5000 });
    
    // Verify we're on the forgot password page
    expect(page.url()).toContain('/forgot-password');
  });

  test('should prevent form submission with invalid email format', async ({ page }) => {
    // Fill in invalid email and valid password
    await page.locator('input[name="email"]').fill(invalidEmail);
    await page.locator('input[name="password"]').fill(validPassword);
    
    // Try to submit form
    await page.locator('button:has-text("Sign In")').click();
    
    // Should still be on login page
    expect(page.url()).toContain('/login');
    
    // Should show validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/login', route => {
      route.abort('failed');
    });

    // Fill in credentials
    await page.locator('input[name="email"]').fill(validEmail);
    await page.locator('input[name="password"]').fill(validPassword);
    
    // Submit form
    await page.locator('button:has-text("Sign In")').click();
    
    // Wait for error message
    await expect(page.locator('text=Network error')).toBeVisible();
  });

  test('should clear error messages when user starts typing', async ({ page }) => {
    // Trigger validation error
    const emailInput = page.locator('input[name="email"]');
    await emailInput.focus();
    await emailInput.blur();
    
    // Verify error is shown
    await expect(page.locator('text=Email is required')).toBeVisible();
    
    // Start typing
    await emailInput.fill('test');
    
    // Error should be cleared
    await expect(page.locator('text=Email is required')).not.toBeVisible();
  });

  test('should have remember me checkbox present', async ({ page }) => {
    // Verify remember me checkbox is present
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
    await expect(page.locator('text=Remember me')).toBeVisible();
  });

  test('should redirect to home if user is already logged in', async ({ page, context }) => {
    // Set up logged in state in localStorage before navigating
    const testEmail = 'test@example.com';
    await page.goto('/');
    await page.evaluate((email) => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: email,
        name: 'Test User',
        role: 'user'
      }));
    }, testEmail);

    // Navigate to login page - the Login component should redirect if user exists
    // Use waitUntil: 'domcontentloaded' to catch redirects faster
    const navigationPromise = page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Wait for either navigation to complete or redirect to happen
    await navigationPromise;
    
    // Give React time to process the redirect (useEffect runs after render)
    await page.waitForTimeout(500);
    
    // Check the final URL - should not be on login page
    const finalUrl = page.url();
    // The redirect should take us to home page
    expect(finalUrl).not.toContain('/login');
  });
});

