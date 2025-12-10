const { test, expect } = require('@playwright/test');

test('Navbar should remain visible when scrolling', async ({ page }) => {
    // Go to products page
    await page.goto('/products');

    // Locate the Navbar - MUI AppBar usually renders as a header
    const navbar = page.locator('header').first();

    // Verify initial visibility
    await expect(navbar).toBeVisible();

    // Get initial bounding box
    const initialBox = await navbar.boundingBox();
    expect(initialBox).not.toBeNull();
    expect(initialBox.y).toBe(0);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Wait a bit for any potential animation or re-render (though fixed should be instant)
    await page.waitForTimeout(500);

    // Verify Navbar is still visible
    await expect(navbar).toBeVisible();

    // Verify Navbar is still at the top of the viewport
    // We need to check its position relative to the viewport
    const boxAfterScroll = await navbar.boundingBox();
    expect(boxAfterScroll).not.toBeNull();

    // For fixed position, y should still be 0 relative to viewport
    // Note: boundingBox returns coordinates relative to viewport in Playwright for visible elements usually, 
    // but let's verify if it changed relative to document or viewport. 
    // Playwright boundingBox is relative to the page (frame), but for fixed elements it should "stick" to viewport visually.
    // Actually documentation says: "returns the bounding box of the element relative to the main frame."
    // If it scrolls away, y stays 0 relative to page top but scrolling moves the viewport.
    // Wait, if it is fixed, it moves WITH the viewport. So its Y coordinate relative to the *viewport* stays 0.
    // But boundingBox is relative to the page. So if I scroll 500px, top of viewport is at 500px.
    // If element is fixed at top:0, its page Y should be 500px (to be at top of viewport).
    // Let's use evaluate to check viewport relative position.

    const viewportY = await page.evaluate(() => {
        const header = document.querySelector('header');
        const rect = header.getBoundingClientRect();
        return rect.top;
    });

    expect(viewportY).toBe(0);
});
