const { test, expect } = require('@playwright/test');

/**
 * Test Case 2: Signup/Registration Functionality
 * 
 * This test suite covers all aspects of the signup functionality including:
 * - Form validation (name, email, phone, password, confirm password)
 * - Password strength indicator
 * - Successful registration
 * - Error handling
 * - Navigation after signup
 */

test.describe('Signup/Registration Functionality', () => {
  const validUserData = {
    name: 'Test User',
    email: 'testuser@example.com',
    phone: '+1234567890',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to signup page before each test
    await page.goto('/signup');
    // Wait for the signup form to be visible
    await expect(page.locator('text=Create Account').or(page.locator('text=Sign Up'))).toBeVisible({ timeout: 5000 });
  });

  test('should display signup page correctly', async ({ page }) => {
    // Verify form elements are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign Up")').or(page.locator('button[type="submit"]'))).toBeVisible();
  });

  test('should show validation error for empty name field', async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');
    await nameInput.focus();
    await nameInput.blur();
    
    await expect(page.locator('text=Full name is required')).toBeVisible();
  });

  test('should show validation error for name less than 2 characters', async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('A');
    await nameInput.blur();
    
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should show validation error for invalid phone number', async ({ page }) => {
    const phoneInput = page.locator('input[name="phone"]');
    await phoneInput.fill('123');
    await phoneInput.blur();
    
    await expect(page.locator('text=Please enter a valid phone number')).toBeVisible();
  });

  test('should show validation error for password less than 6 characters', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('12345');
    await passwordInput.blur();
    
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    
    await passwordInput.fill('Password123!');
    await confirmPasswordInput.fill('DifferentPassword123!');
    await confirmPasswordInput.blur();
    
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    const toggleButtons = page.locator('button[aria-label*="password visibility"]');
    
    // Test password field
    await passwordInput.fill('TestPassword123!');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    const firstToggle = toggleButtons.first();
    await firstToggle.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Test confirm password field
    await confirmPasswordInput.fill('TestPassword123!');
    const secondToggle = toggleButtons.nth(1);
    await secondToggle.click();
    await expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('should show error message for existing email', async ({ page }) => {
    // Mock API response for existing email
    await page.route('**/api/signup', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Email already exists'
        })
      });
    });

    await page.locator('input[name="name"]').fill(validUserData.name);
    await page.locator('input[name="email"]').fill(validUserData.email);
    await page.locator('input[name="phone"]').fill(validUserData.phone);
    await page.locator('input[name="password"]').fill(validUserData.password);
    await page.locator('input[name="confirmPassword"]').fill(validUserData.confirmPassword);
    
    await page.locator('button:has-text("Sign Up")').or(page.locator('button[type="submit"]')).click();
    
    // Wait for error message
    await expect(
      page.locator('[role="alert"]:has-text("Email already exists")')
        .or(page.locator('text=Email already exists'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should successfully register new user', async ({ page }) => {
    // Mock successful API response
    await page.route('**/api/signup', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'User registered successfully',
          token: 'mock-jwt-token-signup',
          user: {
            id: '2',
            email: validUserData.email,
            name: validUserData.name,
            phone: validUserData.phone,
            role: 'user'
          }
        })
      });
    });

    // Fill in valid user data
    await page.locator('input[name="name"]').fill(validUserData.name);
    await page.locator('input[name="email"]').fill(validUserData.email);
    await page.locator('input[name="phone"]').fill(validUserData.phone);
    await page.locator('input[name="password"]').fill(validUserData.password);
    await page.locator('input[name="confirmPassword"]').fill(validUserData.confirmPassword);
    
    // Submit form
    await page.locator('button:has-text("Sign Up")').or(page.locator('button[type="submit"]')).click();
    
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
    expect(userData.email).toBe(validUserData.email);
    expect(userData.name).toBe(validUserData.name);
  });

  test('should show loading state during registration', async ({ page }) => {
    let fulfillRoute;
    const routeFulfilled = new Promise(resolve => { fulfillRoute = resolve; });

    // Mock API response with delay
    await page.route('**/api/signup', async route => {
      await new Promise(resolve => setTimeout(resolve, 800));
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock-token',
          user: {
            id: '2',
            email: validUserData.email,
            name: validUserData.name,
            role: 'user'
          }
        })
      });
      fulfillRoute();
    });

    // Fill in valid user data
    await page.locator('input[name="name"]').fill(validUserData.name);
    await page.locator('input[name="email"]').fill(validUserData.email);
    await page.locator('input[name="phone"]').fill(validUserData.phone);
    await page.locator('input[name="password"]').fill(validUserData.password);
    await page.locator('input[name="confirmPassword"]').fill(validUserData.confirmPassword);
    
    // Submit form
    const submitButton = page.locator('button:has-text("Sign Up")').or(page.locator('button[type="submit"]'));
    await submitButton.click();
    
    // Wait a bit for state to update
    await page.waitForTimeout(100);
    
    // Check for loading state
    const loadingText = page.locator('text=Signing up...').or(page.locator('text=Creating account...'));
    const disabledButton = page.locator('button[type="submit"]:disabled');
    
    const hasLoadingText = await loadingText.isVisible().catch(() => false);
    const isButtonDisabled = await disabledButton.isVisible().catch(() => false);
    
    expect(hasLoadingText || isButtonDisabled).toBeTruthy();
    
    await routeFulfilled;
  });

  test('should navigate to login page when clicking login link', async ({ page }) => {
    // Find and click login link
    const loginLink = page.locator('a:has-text("Login")').or(page.locator('a:has-text("Sign in")'));
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
      await page.waitForURL('**/login', { timeout: 5000 });
      expect(page.url()).toContain('/login');
    }
  });

  test('should prevent form submission with invalid data', async ({ page }) => {
    // Fill in invalid data
    await page.locator('input[name="name"]').fill('A');
    await page.locator('input[name="email"]').fill('invalid-email');
    await page.locator('input[name="phone"]').fill('123');
    await page.locator('input[name="password"]').fill('12345');
    await page.locator('input[name="confirmPassword"]').fill('different');
    
    // Try to submit form
    await page.locator('button:has-text("Sign Up")').or(page.locator('button[type="submit"]')).click();
    
    // Should still be on signup page
    expect(page.url()).toContain('/signup');
    
    // Should show multiple validation errors
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/signup', route => {
      route.abort('failed');
    });

    // Fill in valid data
    await page.locator('input[name="name"]').fill(validUserData.name);
    await page.locator('input[name="email"]').fill(validUserData.email);
    await page.locator('input[name="phone"]').fill(validUserData.phone);
    await page.locator('input[name="password"]').fill(validUserData.password);
    await page.locator('input[name="confirmPassword"]').fill(validUserData.confirmPassword);
    
    // Submit form
    await page.locator('button:has-text("Sign Up")').or(page.locator('button[type="submit"]')).click();
    
    // Wait for error message
    await expect(page.locator('text=Network error').or(page.locator('[role="alert"]'))).toBeVisible({ timeout: 5000 });
  });
});






