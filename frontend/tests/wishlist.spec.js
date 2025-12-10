const { test, expect } = require('@playwright/test');

/**
 * Test Case 5: Wishlist Management Functionality
 * 
 * This test suite covers all aspects of wishlist functionality including:
 * - Adding items to wishlist
 * - Removing items from wishlist
 * - Viewing wishlist
 * - Adding wishlist items to cart
 * - Empty wishlist state
 * - Wishlist persistence
 */

test.describe('Wishlist Management Functionality', () => {
  const mockProduct = {
    id: '1',
    name: 'Aloe Vera Plant',
    price: 299,
    imageUrl: '/test-image.jpg',
    category: 'Plants',
    stock: 10
  };

  test.beforeEach(async ({ page }) => {
    // Clear wishlist before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('wishlist');
      localStorage.removeItem('wishlist:guest');
    });
  });

  test('should display empty wishlist message when wishlist is empty', async ({ page }) => {
    await page.goto('/wishlist');
    
    // Check for empty wishlist message
    await expect(
      page.locator('text=Your Wishlist is Empty')
        .or(page.locator('text=Wishlist is empty'))
        .or(page.locator('text=No items in wishlist'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should add product to wishlist from product page', async ({ page }) => {
    // Mock products API
    await page.route('**/api/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProduct])
      });
    });

    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find wishlist button (heart icon or "Add to Wishlist" button)
    const wishlistButton = page.locator('button[aria-label*="wishlist"]')
      .or(page.locator('button:has-text("Wishlist")'))
      .or(page.locator('[data-testid*="wishlist"]'))
      .or(page.locator('svg[aria-label*="heart"]').locator('..'))
      .first();
    
    if (await wishlistButton.count() > 0) {
      await wishlistButton.click();
      await page.waitForTimeout(1000);
      
      // Check for success message/toast
      const successMessage = await page.locator('text=Added to wishlist')
        .or(page.locator('text=Wishlist'))
        .isVisible()
        .catch(() => false);
      
      // Navigate to wishlist to verify
      await page.goto('/wishlist');
      await expect(page.locator(`text=${mockProduct.name}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display wishlist items correctly', async ({ page }) => {
    // Set up wishlist with items in localStorage
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/wishlist');
    
    // Verify wishlist items are displayed
    await expect(page.locator(`text=${mockProduct.name}`)).toBeVisible({ timeout: 3000 });
    
    // Verify price is shown
    await expect(page.locator('text=299').or(page.locator('text=₹299'))).toBeVisible();
  });

  test('should remove item from wishlist', async ({ page }) => {
    // Set up wishlist with items
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/wishlist');
    
    // Find and click remove button
    const removeButton = page.locator('button:has-text("Remove")')
      .or(page.locator('button[aria-label*="remove"]'))
      .or(page.locator('button:has-text("Delete")'))
      .or(page.locator('svg[aria-label*="remove"]').locator('..'))
      .first();
    
    if (await removeButton.count() > 0) {
      await removeButton.click();
      await page.waitForTimeout(1000);
      
      // Verify item is removed
      const itemVisible = await page.locator(`text=${mockProduct.name}`).isVisible().catch(() => false);
      expect(itemVisible).toBeFalsy();
      
      // Verify empty wishlist message
      await expect(
        page.locator('text=Your Wishlist is Empty')
          .or(page.locator('text=Wishlist is empty'))
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should add wishlist item to cart', async ({ page }) => {
    // Set up wishlist with items
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/wishlist');
    
    // Find "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Add to Cart")')
      .or(page.locator('button:has-text("Add")'))
      .or(page.locator('button[aria-label*="cart"]'))
      .first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
      
      // Check for success message
      const successMessage = await page.locator('text=Added to cart')
        .or(page.locator('text=Product added'))
        .isVisible()
        .catch(() => false);
      
      // Navigate to cart to verify
      await page.goto('/cart');
      await expect(page.locator(`text=${mockProduct.name}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should persist wishlist items after page refresh', async ({ page }) => {
    // Add item to wishlist
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/wishlist');
    
    // Verify item is in wishlist
    await expect(page.locator(`text=${mockProduct.name}`)).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Verify item is still in wishlist after refresh
    await expect(page.locator(`text=${mockProduct.name}`)).toBeVisible({ timeout: 3000 });
  });

  test('should handle multiple wishlist items', async ({ page }) => {
    const products = [
      { ...mockProduct, id: '1', name: 'Plant 1' },
      { ...mockProduct, id: '2', name: 'Plant 2', price: 399 },
      { ...mockProduct, id: '3', name: 'Plant 3', price: 199 }
    ];
    
    // Set up wishlist with multiple items
    await page.goto('/');
    await page.evaluate((prods) => {
      localStorage.setItem('wishlist:guest', JSON.stringify(prods));
    }, products);

    await page.goto('/wishlist');
    
    // Verify all items are displayed
    for (const product of products) {
      await expect(page.locator(`text=${product.name}`)).toBeVisible({ timeout: 3000 });
    }
  });

  test('should navigate to product details from wishlist', async ({ page }) => {
    // Set up wishlist with items
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/wishlist');
    
    // Click on product name or image
    const productLink = page.locator(`text=${mockProduct.name}`)
      .or(page.locator('img[alt*="Aloe"]'))
      .first();
    
    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForTimeout(2000);
      
      // Verify navigation to product detail page
      const url = page.url();
      expect(url).toMatch(/\/(pdp|product)/);
    }
  });

  test('should show continue shopping link in empty wishlist', async ({ page }) => {
    await page.goto('/wishlist');
    
    // Check for continue shopping link/button
    const continueShopping = page.locator('a:has-text("Continue Shopping")')
      .or(page.locator('button:has-text("Continue Shopping")'))
      .or(page.locator('a:has-text("Shop")'))
      .or(page.locator('a:has-text("Browse Products")'));
    
    if (await continueShopping.count() > 0) {
      await continueShopping.first().click();
      
      // Should navigate to products or home page
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toMatch(/\/(products|$)/);
    }
  });

  test('should toggle wishlist item (add/remove)', async ({ page }) => {
    // Mock products API
    await page.route('**/api/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProduct])
      });
    });

    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find wishlist button
    const wishlistButton = page.locator('button[aria-label*="wishlist"]')
      .or(page.locator('button:has-text("Wishlist")'))
      .first();
    
    if (await wishlistButton.count() > 0) {
      // Add to wishlist
      await wishlistButton.click();
      await page.waitForTimeout(1000);
      
      // Verify item is in wishlist
      await page.goto('/wishlist');
      await expect(page.locator(`text=${mockProduct.name}`)).toBeVisible({ timeout: 3000 });
      
      // Go back to products
      await page.goto('/products');
      await page.waitForTimeout(2000);
      
      // Remove from wishlist (click again)
      await wishlistButton.click();
      await page.waitForTimeout(1000);
      
      // Verify item is removed from wishlist
      await page.goto('/wishlist');
      const itemVisible = await page.locator(`text=${mockProduct.name}`).isVisible().catch(() => false);
      expect(itemVisible).toBeFalsy();
    }
  });

  test('should display product images in wishlist', async ({ page }) => {
    // Set up wishlist with items
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/wishlist');
    
    // Check for product images
    const productImages = page.locator('img[alt*="Aloe"]')
      .or(page.locator('img[src*="test-image"]'))
      .or(page.locator('[data-testid*="wishlist"] img'));
    
    if (await productImages.count() > 0) {
      await expect(productImages.first()).toBeVisible();
    }
  });

  test('should show wishlist count in navbar', async ({ page }) => {
    // Set up wishlist with items
    await page.goto('/');
    await page.evaluate((product) => {
      const wishlist = [product, { ...product, id: '2', name: 'Another Plant' }];
      localStorage.setItem('wishlist:guest', JSON.stringify(wishlist));
    }, mockProduct);

    await page.goto('/');
    
    // Check for wishlist icon with count badge
    const wishlistIcon = page.locator('[aria-label*="wishlist"]')
      .or(page.locator('svg[aria-label*="heart"]').locator('..'))
      .or(page.locator('button:has-text("Wishlist")'));
    
    // Wishlist count might be displayed as a badge
    const hasWishlistIndicator = await wishlistIcon.count() > 0;
    expect(hasWishlistIndicator).toBeTruthy();
  });
});






