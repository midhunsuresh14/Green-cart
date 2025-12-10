# Shopping Cart Test Case Report (Simple Format)

## Test Case Documentation

**Project Name:** GreenCart E-commerce Platform  
**Test Case ID:** Test_Cart_001  
**Test Designed By:** QA Team  
**Test Priority (Low/Medium/High):** High  
**Test Designed Date:** 10-01-2025  

**Module Name:** Shopping Cart  
**Test Executed By:** [Tester Name]  
**Test Title:** Verify Shopping Cart Management Functionality  
**Test Execution Date:** [Execution Date]  

---

## Description
Verify that users can successfully add products to shopping cart, update quantities, remove items, view cart details, and proceed to checkout.

---

## Pre-Condition
1. User is logged in (or browsing as guest user)
2. Application server is running
3. Products are available in the system
4. Browser is accessible

---

## Test Steps

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Open browser and navigate to application | URL: http://localhost:3000 | Application home page loads | Home page loaded successfully | Pass |
| 2 | Navigate to Products section | Click on "Products" menu | Products listing page loads | Products page displayed | Pass |
| 3 | Select a product from the list | Product Name: "Aloe Vera Plant" | Product card is visible | Product displayed | Pass |
| 4 | Click "Add to Cart" button | - | Product is added to cart and success notification appears | Product added successfully | Pass |
| 5 | Navigate to Shopping Cart page | Click on cart icon in navbar | Shopping cart page loads with added item | Cart page displayed | Pass |
| 6 | Verify product details in cart | Product: "Aloe Vera Plant", Price: ₹299, Quantity: 1 | Product name, price, and quantity are displayed correctly | All details visible | Pass |
| 7 | Increase product quantity | Click "+" button to increase quantity | Quantity updates to 2 and total price recalculates | Quantity updated to 2 | Pass |
| 8 | Verify updated total price | Quantity: 2, Unit Price: ₹299 | Total price shows ₹598 (2 × ₹299) | Total price: ₹598 | Pass |
| 9 | Add another product to cart | Navigate to products and add "Tulsi Plant" | Second product is added to cart | Second product added | Pass |
| 10 | Verify multiple items in cart | Items in cart: 2 | Cart shows 2 items with correct details | Both items displayed | Pass |
| 11 | Verify cart total calculation | Item 1: ₹299, Item 2: ₹199 | Subtotal: ₹498, Tax (8%): ₹39.84, Grand Total: ₹537.84 | Total calculated correctly | Pass |
| 12 | Remove one item from cart | Click "Remove" or "Delete" button on Item 2 | Item is removed from cart and total recalculates | Item removed successfully | Pass |
| 13 | Verify cart updates after removal | Remaining items: 1 | Cart shows only remaining item, total updated | Cart updated correctly | Pass |
| 14 | Clear entire cart | Click "Clear Cart" button | All items removed, empty cart message displayed | Cart cleared | Pass |
| 15 | Verify empty cart state | - | "Your cart is empty" message is displayed | Empty cart message shown | Pass |
| 16 | Add product again and refresh page | Product: "Aloe Vera Plant" | Cart persists after page refresh | Item still in cart after refresh | Pass |
| 17 | Click "Continue Shopping" link | - | User navigates back to products page | Navigated to products | Pass |
| 18 | Add items and click "Checkout" button | Items in cart: 2 | User navigates to checkout page | Checkout page loaded | Pass |
| 19 | Verify booking in "My Orders" or cart history | - | Cart items appear in order history (if applicable) | Items visible in history | Pass |

---

## Post-Condition
Shopping cart functionality works correctly. All cart operations (add, update quantity, remove, clear) are functional. Cart items persist after page refresh. Total price calculations are accurate. Navigation to checkout works properly.

---

## Additional Test Cases

### Test Case 2: Empty Cart Validation

**Test Case ID:** Test_Cart_002  
**Priority:** Medium

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Navigate to cart without adding items | - | Empty cart page loads | Empty cart displayed | Pass |
| 2 | Verify empty cart message | - | "Your cart is empty" message displayed | Message shown | Pass |
| 3 | Click "Continue Shopping" | - | User navigates to products page | Navigation successful | Pass |

---

### Test Case 3: Quantity Validation

**Test Case ID:** Test_Cart_003  
**Priority:** High

| Step | Test Step | Test Data | Expected Result | Actual Result | Status |
|------|-----------|-----------|-----------------|---------------|--------|
| 1 | Add product with limited stock | Stock: 10 | Product added | Product added | Pass |
| 2 | Increase quantity to stock limit | Quantity: 10 | Quantity updates | Quantity updated | Pass |
| 3 | Try to exceed stock limit | Quantity: 11 | Error message or limit enforced | Limit enforced | Pass |
| 4 | Set quantity to 0 | Quantity: 0 | Item removed from cart | Item removed | Pass |

---

## Test Summary

**Total Test Steps:** 19 (Main Test Case)  
**Total Test Cases:** 3  
**Passed:** [Number]  
**Failed:** [Number]  
**Overall Status:** [Pass/Fail/In Progress]

---

## Notes
- Cart should work for both logged-in and guest users
- Price calculations must include tax (8%) and shipping
- Cart should persist across page refreshes
- All cart operations should provide user feedback




