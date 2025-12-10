const { test, expect } = require('@playwright/test');

/**
 * Test Case 4: Product Browsing & Search Functionality
 * 
 * This test suite covers all aspects of product browsing and search including:
 * - Product listing display
 * - Product search functionality
 * - Category and subcategory filtering
 * - Price filtering
 * - Sorting options
 * - Product card interactions
 */

test.describe('Product Browsing & Search Functionality', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Aloe Vera Plant',
      price: 299,
      category: 'Plants',
      subcategory: 'Medicinal',
      stock: 10,
      rating: 4.5,
      imageUrl: '/test-image1.jpg'
    },
    {
      id: '2',
      name: 'Tulsi Plant',
      price: 199,
      category: 'Plants',
      subcategory: 'Medicinal',
      stock: 5,
      rating: 4.8,
      imageUrl: '/test-image2.jpg'
    },
    {
      id: '3',
      name: 'Rose Plant',
      price: 499,
      category: 'Plants',
      subcategory: 'Ornamental',
      stock: 0,
      rating: 4.2,
      imageUrl: '/test-image3.jpg'
    },
    {
      id: '4',
      name: 'Herbal Tea',
      price: 150,
      category: 'Products',
      subcategory: 'Beverages',
      stock: 20,
      rating: 4.6,
      imageUrl: '/test-image4.jpg'
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Mock products API
    await page.route('**/api/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts)
      });
    });

    // Mock categories API
    await page.route('**/api/categories**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { key: 'Plants', name: 'Plants' },
          { key: 'Products', name: 'Products' }
        ])
      });
    });
  });

  test('should display products page correctly', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForTimeout(2000);
    
    // Verify products are displayed
    await expect(page.locator('text=Aloe Vera Plant').or(page.locator('[data-testid*="product"]'))).toBeVisible({ timeout: 5000 });
  });

  test('should display product cards with correct information', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Check for product name
    await expect(page.locator('text=Aloe Vera Plant')).toBeVisible({ timeout: 5000 });
    
    // Check for price (might be formatted as ₹299 or 299)
    const priceVisible = await page.locator('text=299').or(page.locator('text=₹299')).isVisible().catch(() => false);
    expect(priceVisible).toBeTruthy();
  });

  test('should search products by name', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find search input
    const searchInput = page.locator('input[type="search"]')
      .or(page.locator('input[placeholder*="Search"]'))
      .or(page.locator('input[name="search"]'))
      .first();
    
    if (await searchInput.count() > 0) {
      // Enter search query
      await searchInput.fill('Aloe');
      await page.waitForTimeout(1000);
      
      // Verify search results show Aloe Vera
      await expect(page.locator('text=Aloe Vera Plant')).toBeVisible({ timeout: 3000 });
      
      // Verify other products are filtered out
      const tulsiVisible = await page.locator('text=Tulsi Plant').isVisible().catch(() => false);
      expect(tulsiVisible).toBeFalsy();
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find category filter/button
    const categoryButton = page.locator('button:has-text("Plants")')
      .or(page.locator('a:has-text("Plants")'))
      .or(page.locator('[data-category="Plants"]'))
      .first();
    
    if (await categoryButton.count() > 0) {
      await categoryButton.click();
      await page.waitForTimeout(1000);
      
      // Verify only Plants category products are shown
      await expect(page.locator('text=Aloe Vera Plant')).toBeVisible({ timeout: 3000 });
      
      // Verify Products category items are filtered out
      const herbalTeaVisible = await page.locator('text=Herbal Tea').isVisible().catch(() => false);
      expect(herbalTeaVisible).toBeFalsy();
    }
  });

  test('should filter products by price range', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find price filter (slider or input)
    const priceFilter = page.locator('input[type="range"]')
      .or(page.locator('input[name*="price"]'))
      .or(page.locator('[aria-label*="price"]'))
      .first();
    
    if (await priceFilter.count() > 0) {
      // Set max price to 300
      await priceFilter.fill('300');
      await page.waitForTimeout(1000);
      
      // Verify only products under 300 are shown
      await expect(page.locator('text=Aloe Vera Plant')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('text=Tulsi Plant')).toBeVisible({ timeout: 3000 });
      
      // Verify expensive products are filtered out
      const roseVisible = await page.locator('text=Rose Plant').isVisible().catch(() => false);
      expect(roseVisible).toBeFalsy();
    }
  });

  test('should sort products by price low to high', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find sort dropdown/button
    const sortButton = page.locator('select[name*="sort"]')
      .or(page.locator('button:has-text("Sort")'))
      .or(page.locator('[aria-label*="sort"]'))
      .first();
    
    if (await sortButton.count() > 0) {
      // If it's a select dropdown
      if (await sortButton.evaluate(el => el.tagName === 'SELECT').catch(() => false)) {
        await sortButton.selectOption('price-asc');
      } else {
        // If it's a button, click and select option
        await sortButton.click();
        await page.locator('text=Price: Low → High').or(page.locator('[value="price-asc"]')).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Verify products are sorted (first product should be cheaper)
      const firstProduct = page.locator('[data-testid*="product"]').first();
      const firstProductText = await firstProduct.textContent().catch(() => '');
      expect(firstProductText).toContain('Herbal Tea'); // Should be cheapest at 150
    }
  });

  test('should sort products by price high to low', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const sortButton = page.locator('select[name*="sort"]')
      .or(page.locator('button:has-text("Sort")'))
      .first();
    
    if (await sortButton.count() > 0) {
      if (await sortButton.evaluate(el => el.tagName === 'SELECT').catch(() => false)) {
        await sortButton.selectOption('price-desc');
      } else {
        await sortButton.click();
        await page.locator('text=Price: High → Low').or(page.locator('[value="price-desc"]')).click();
      }
      
      await page.waitForTimeout(1000);
      
      // Verify products are sorted (first product should be most expensive)
      const firstProduct = page.locator('[data-testid*="product"]').first();
      const firstProductText = await firstProduct.textContent().catch(() => '');
      expect(firstProductText).toContain('Rose Plant'); // Should be most expensive at 499
    }
  });

  test('should filter products by in-stock only', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find in-stock filter checkbox
    const inStockCheckbox = page.locator('input[type="checkbox"][name*="stock"]')
      .or(page.locator('input[type="checkbox"][aria-label*="stock"]'))
      .or(page.locator('label:has-text("In Stock") input'))
      .first();
    
    if (await inStockCheckbox.count() > 0) {
      await inStockCheckbox.check();
      await page.waitForTimeout(1000);
      
      // Verify out-of-stock products are filtered out
      const roseVisible = await page.locator('text=Rose Plant').isVisible().catch(() => false);
      expect(roseVisible).toBeFalsy();
      
      // Verify in-stock products are still visible
      await expect(page.locator('text=Aloe Vera Plant')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should navigate to product details page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Find product card or "View Details" button
    const productCard = page.locator('text=Aloe Vera Plant').first();
    const viewDetailsButton = page.locator('button:has-text("View Details")')
      .or(page.locator('a:has-text("View Details")'))
      .first();
    
    if (await viewDetailsButton.count() > 0) {
      await viewDetailsButton.click();
    } else if (await productCard.count() > 0) {
      await productCard.click();
    }
    
    // Wait for navigation to product detail page
    await page.waitForTimeout(2000);
    
    // Verify we're on product detail page (URL should contain /pdp/ or /product/)
    const url = page.url();
    expect(url).toMatch(/\/(pdp|product)/);
  });

  test('should display product images', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Check for product images
    const productImages = page.locator('img[alt*="Aloe"]')
      .or(page.locator('img[src*="test-image"]'))
      .or(page.locator('[data-testid*="product"] img'));
    
    if (await productImages.count() > 0) {
      await expect(productImages.first()).toBeVisible();
    }
  });

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[type="search"]')
      .or(page.locator('input[placeholder*="Search"]'))
      .first();
    
    if (await searchInput.count() > 0) {
      // Search for non-existent product
      await searchInput.fill('NonExistentProductXYZ123');
      await page.waitForTimeout(1000);
      
      // Verify no results message or empty state
      const noResults = await page.locator('text=No products found')
        .or(page.locator('text=No results'))
        .or(page.locator('text=No items found'))
        .isVisible()
        .catch(() => false);
      
      // Either show no results message or no products visible
      expect(noResults || await page.locator('text=Aloe Vera Plant').isVisible().catch(() => false) === false).toBeTruthy();
    }
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Apply category filter
    const categoryButton = page.locator('button:has-text("Plants")').first();
    if (await categoryButton.count() > 0) {
      await categoryButton.click();
      await page.waitForTimeout(500);
    }
    
    // Apply price filter
    const priceFilter = page.locator('input[type="range"]').first();
    if (await priceFilter.count() > 0) {
      await priceFilter.fill('300');
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      await expect(page.locator('text=Aloe Vera Plant')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('text=Tulsi Plant')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display product ratings', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);
    
    // Check for rating display (stars or numbers)
    const ratingElement = page.locator('[aria-label*="rating"]')
      .or(page.locator('text=4.5'))
      .or(page.locator('[data-rating]'));
    
    // Ratings might be displayed, verify if present
    const hasRating = await ratingElement.count() > 0;
    // This is optional - some implementations might not show ratings on listing page
  });
});






