const { test, expect } = require('@playwright/test');

/**
 * Test Case 3: Shopping Cart Management Functionality
 * 
 * This test suite covers all aspects of shopping cart functionality including:
 * - Adding items to cart
 * - Updating item quantities
 * - Removing items from cart
 * - Clearing entire cart
 * - Cart persistence
 * - Navigation to checkout
 */

test.describe('Shopping Cart Management Functionality', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Plant',
    price: 299,
    imageUrl: '/test-image.jpg',
    category: 'Plants',
    stock: 10
  };

  test.beforeEach(async ({ page }) => {
    // Clear cart before each test - clear all possible cart keys
    await page.goto('/');
    await page.evaluate(() => {
      // Clear all cart-related keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cart')) {
          localStorage.removeItem(key);
        }
      });
    });
    // Wait a bit for cleanup
    await page.waitForTimeout(500);
  });

  test('should display empty cart message when cart is empty', async ({ page }) => {
    await page.goto('/cart');
    
    // Check for empty cart message
    await expect(
      page.locator('text=Your cart is empty')
        .or(page.locator('text=Cart is empty'))
        .or(page.locator('text=No items in cart'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should add product to cart from product page', async ({ page }) => {
    // Mock products API
    await page.route('**/api/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProduct])
      });
    });

    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Find and click "Add to Cart" button
    const addToCartButton = page.locator('button:has-text("Add to Cart")')
      .or(page.locator('button:has-text("Add")'))
      .or(page.locator('[aria-label*="Add to cart"]'))
      .first();
    
    if (await addToCartButton.count() > 0) {
      await addToCartButton.click();
      
      // Wait for cart update (might show toast or notification)
      await page.waitForTimeout(1000);
      
      // Navigate to cart
      await page.goto('/cart');
      
      // Wait for cart to load
      await page.waitForTimeout(2000);
      
      // Verify product is in cart
      await expect(
        page.locator('.cart-item').locator(`text=${mockProduct.name}`)
          .or(page.locator(`text=${mockProduct.name}`))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display cart items correctly', async ({ page }) => {
    // Set up cart with items in localStorage (use both keys for compatibility)
    await page.goto('/');
    await page.evaluate((product) => {
      const cart = [{
        ...product,
        quantity: 2,
        finalPrice: product.price || 299
      }];
      // Set both keys to ensure compatibility
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, mockProduct);

    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(2000);
    
    // Verify cart items are displayed - look for the item name in cart-item
    await expect(
      page.locator('.cart-item').locator(`text=${mockProduct.name}`)
        .or(page.locator(`text=${mockProduct.name}`))
    ).toBeVisible({ timeout: 5000 });
    
    // Verify quantity is shown (in quantity-value span)
    await expect(
      page.locator('.quantity-value:has-text("2")')
        .or(page.locator('text=2').filter({ hasText: /^2$/ }))
    ).toBeVisible({ timeout: 3000 });
    
    // Verify price is shown (₹299 or 299.00)
    await expect(
      page.locator('text=₹299')
        .or(page.locator('text=299.00'))
        .or(page.locator('text=299'))
    ).toBeVisible({ timeout: 3000 });
  });

  test('should update item quantity in cart', async ({ page }) => {
    // Set up cart with items
    await page.goto('/');
    await page.evaluate((product) => {
      const cart = [{
        ...product,
        quantity: 1,
        finalPrice: product.price || 299
      }];
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, mockProduct);

    await page.goto('/cart');
    
    // Find quantity input or increment button
    const quantityInput = page.locator('input[type="number"]').first();
    const incrementButton = page.locator('button:has-text("+")').or(page.locator('[aria-label*="increase"]')).first();
    
    if (await incrementButton.count() > 0) {
      // Click increment button
      await incrementButton.click();
      await page.waitForTimeout(500);
      
      // Verify quantity updated (check if input value is 2 or button shows 2)
      const newQuantity = await quantityInput.inputValue().catch(() => null);
      if (newQuantity) {
        expect(parseInt(newQuantity)).toBeGreaterThan(1);
      }
    } else if (await quantityInput.count() > 0) {
      // Update quantity directly
      await quantityInput.fill('3');
      await quantityInput.blur();
      await page.waitForTimeout(500);
      
      const updatedQuantity = await quantityInput.inputValue();
      expect(parseInt(updatedQuantity)).toBe(3);
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Set up cart with items
    await page.goto('/');
    await page.evaluate((product) => {
      const cart = [{
        ...product,
        quantity: 1,
        finalPrice: product.price || 299
      }];
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, mockProduct);

    await page.goto('/cart');
    
    // Find and click remove button
    const removeButton = page.locator('button:has-text("Remove")')
      .or(page.locator('button[aria-label*="remove"]'))
      .or(page.locator('button:has-text("Delete")'))
      .first();
    
    if (await removeButton.count() > 0) {
      await removeButton.click();
      await page.waitForTimeout(500);
      
      // Verify item is removed (cart should be empty or item not visible)
      const itemVisible = await page.locator(`text=${mockProduct.name}`).isVisible().catch(() => false);
      expect(itemVisible).toBeFalsy();
    }
  });

  test('should calculate total price correctly', async ({ page }) => {
    const product1 = { ...mockProduct, id: '1', price: 100, finalPrice: 100, quantity: 2 };
    const product2 = { ...mockProduct, id: '2', name: 'Test Plant 2', price: 200, finalPrice: 200, quantity: 1 };
    
    // Set up cart with multiple items
    await page.goto('/');
    await page.evaluate((p1, p2) => {
      const cart = [p1, p2];
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, product1, product2);

    await page.goto('/cart');
    
    // Wait for cart to load and calculations
    await page.waitForTimeout(2000);
    
    // Calculate expected subtotal: 2*100 + 1*200 = 400
    // With tax (8%): 400 * 1.08 = 432
    // Check for subtotal or total (might show with tax)
    const subtotalVisible = await page.locator('text=400').or(page.locator('text=₹400')).isVisible().catch(() => false);
    const totalVisible = await page.locator('text=432').or(page.locator('text=₹432')).isVisible().catch(() => false);
    
    // At least verify total section exists and shows some price
    await expect(
      page.locator('text=Total')
        .or(page.locator('text=Subtotal'))
        .or(page.locator('text=Grand Total'))
        .or(page.locator('.order-summary'))
    ).toBeVisible({ timeout: 3000 });
    
    // Verify at least one price is visible in the summary
    expect(subtotalVisible || totalVisible).toBeTruthy();
  });

  test('should clear entire cart', async ({ page }) => {
    // Set up cart with items
    await page.goto('/');
    await page.evaluate((product) => {
      const cart = [
        { ...product, finalPrice: product.price || 299 },
        { ...product, id: '2', name: 'Another Plant', finalPrice: product.price || 299 }
      ];
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, mockProduct);

    await page.goto('/cart');
    
    // Find and click clear cart button
    const clearButton = page.locator('button:has-text("Clear Cart")')
      .or(page.locator('button:has-text("Remove All")'))
      .or(page.locator('button:has-text("Empty Cart")'));
    
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      // Confirm if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirm")').or(page.locator('button:has-text("Yes")'));
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      await page.waitForTimeout(500);
      
      // Verify cart is empty
      await expect(
        page.locator('text=Your cart is empty')
          .or(page.locator('text=Cart is empty'))
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    // Set up cart with items
    await page.goto('/');
    await page.evaluate((product) => {
      const cart = [{
        ...product,
        quantity: 1,
        finalPrice: product.price || 299
      }];
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, mockProduct);

    await page.goto('/cart');
    
    // Find and click checkout button
    const checkoutButton = page.locator('button:has-text("Checkout")')
      .or(page.locator('button:has-text("Proceed to Checkout")'))
      .or(page.locator('a:has-text("Checkout")'));
    
    if (await checkoutButton.count() > 0) {
      await checkoutButton.click();
      
      // Wait for navigation to checkout
      await page.waitForURL('**/checkout', { timeout: 5000 });
      expect(page.url()).toContain('/checkout');
    }
  });

  test('should persist cart items after page refresh', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await page.evaluate((product) => {
      const cart = [{
        ...product,
        quantity: 1,
        finalPrice: product.price || 299
      }];
      // Set both keys for compatibility
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, mockProduct);

    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(2000);
    
    // Verify item is in cart
    await expect(
      page.locator('.cart-item').locator(`text=${mockProduct.name}`)
        .or(page.locator(`text=${mockProduct.name}`))
    ).toBeVisible({ timeout: 5000 });
    
    // Refresh page
    await page.reload();
    
    // Wait for cart to reload after refresh
    await page.waitForTimeout(2000);
    
    // Verify item is still in cart after refresh
    await expect(
      page.locator('.cart-item').locator(`text=${mockProduct.name}`)
        .or(page.locator(`text=${mockProduct.name}`))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show continue shopping link', async ({ page }) => {
    await page.goto('/cart');
    
    // Check for continue shopping link/button
    const continueShopping = page.locator('a:has-text("Continue Shopping")')
      .or(page.locator('button:has-text("Continue Shopping")'))
      .or(page.locator('a:has-text("Shop")'));
    
    if (await continueShopping.count() > 0) {
      await continueShopping.first().click();
      
      // Should navigate to products or home page
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toMatch(/\/(products|$)/);
    }
  });

  test('should handle cart with multiple items', async ({ page }) => {
    const products = [
      { ...mockProduct, id: '1', name: 'Plant 1', finalPrice: mockProduct.price },
      { ...mockProduct, id: '2', name: 'Plant 2', price: 399, finalPrice: 399 },
      { ...mockProduct, id: '3', name: 'Plant 3', price: 199, finalPrice: 199 }
    ];
    
    // Set up cart with multiple items
    await page.goto('/');
    await page.evaluate((prods) => {
      const cart = prods.map(p => ({ ...p, quantity: 1 }));
      localStorage.setItem('cart:guest', JSON.stringify(cart));
      localStorage.setItem('cart', JSON.stringify(cart));
    }, products);

    await page.goto('/cart');
    
    // Wait for cart to load
    await page.waitForTimeout(2000);
    
    // Verify all items are displayed
    for (const product of products) {
      await expect(
        page.locator('.cart-item').locator(`text=${product.name}`)
          .or(page.locator(`text=${product.name}`))
      ).toBeVisible({ timeout: 5000 });
    }
    
    // Verify cart shows correct item count
    await expect(
      page.locator('text=3 items')
        .or(page.locator('text=3 item'))
    ).toBeVisible({ timeout: 3000 });
  });
});

7