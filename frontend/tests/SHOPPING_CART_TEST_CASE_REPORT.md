# Shopping Cart Test Case Report

## Test Case Documentation

**Project Name:** GreenCart E-commerce Platform  
**Test Case ID:** Test_Cart_001  
**Test Designed By:** QA Team  
**Test Priority (Low/Medium/High):** High  
**Test Designed Date:** 10-01-2025  

**Module Name:** Shopping Cart Management  
**Test Executed By:** [Tester Name]  
**Test Title:** Verify Shopping Cart Management Functionality  
**Test Execution Date:** [Execution Date]  

---

## Description
Verify that users can successfully add products to cart, update quantities, remove items, and proceed to checkout through the shopping cart system.

---

## Pre-Condition
1. User is logged in (or browsing as guest)
2. Application server is running
3. Products are available in the system
4. Browser is open and application is accessible

---

## Test Steps

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Open browser and navigate to application | URL: http://localhost:3000 | Application home page loads | Home page loaded successfully | Pass |
| 2 | Navigate to Products section | Click on "Products" menu | Products listing page loads | Products page displayed | Pass |
| 3 | Select a product from the list | Product: "Aloe Vera Plant" | Product details are visible | Product card displayed | Pass |
| 4 | Click "Add to Cart" button | - | Product is added to cart and success message appears | Product added successfully | Pass |
| 5 | Navigate to Shopping Cart | Click on cart icon or "Cart" link | Shopping cart page loads with added item | Cart page displayed with item | Pass |
| 6 | Verify product details in cart | Product Name: "Aloe Vera Plant" Price: ₹299 Quantity: 1 | Product name, price, and quantity are displayed correctly | All details visible correctly | Pass |
| 7 | Increase product quantity | Click "+" button or set quantity to 2 | Quantity updates to 2 and total price recalculates | Quantity updated to 2 | Pass |
| 8 | Verify updated total price | Quantity: 2, Unit Price: ₹299 | Total price shows ₹598 (2 × ₹299) | Total price calculated correctly | Pass |
| 9 | Decrease product quantity | Click "-" button or set quantity to 1 | Quantity updates to 1 | Quantity decreased to 1 | Pass |
| 10 | Add another product to cart | Product: "Tulsi Plant" | Second product is added to cart | Second product added | Pass |
| 11 | Verify multiple items in cart | Items: 2 | Cart shows 2 items with correct details | Both items displayed | Pass |
| 12 | Verify cart total calculation | Item 1: ₹299, Item 2: ₹199 | Subtotal: ₹498, Tax calculated, Grand Total displayed | Total calculated correctly | Pass |
| 13 | Remove one item from cart | Click "Remove" or "Delete" button | Item is removed from cart | Item removed successfully | Pass |
| 14 | Verify cart updates after removal | Remaining items: 1 | Cart shows only remaining item, total recalculated | Cart updated correctly | Pass |
| 15 | Clear entire cart | Click "Clear Cart" button | All items removed, empty cart message displayed | Cart cleared successfully | Pass |
| 16 | Verify empty cart state | - | "Your cart is empty" message displayed | Empty cart message shown | Pass |
| 17 | Add product again and refresh page | Product: "Aloe Vera Plant" | Cart persists after page refresh | Item still in cart after refresh | Pass |
| 18 | Click "Continue Shopping" link | - | User navigates back to products page | Navigated to products page | Pass |
| 19 | Add items and click "Checkout" | Items in cart: 2 | User navigates to checkout page | Checkout page loaded | Pass |
| 20 | Verify cart persistence across sessions | Close and reopen browser | Cart items are preserved (if logged in) | Cart persisted correctly | Pass |

---

## Post-Condition
1. Shopping cart functionality works correctly
2. All cart operations (add, update, remove, clear) are functional
3. Cart items persist after page refresh
4. Total price calculations are accurate
5. Navigation to checkout works properly

---

## Test Case 2: Empty Cart Validation

**Test Case ID:** Test_Cart_002  
**Test Priority:** Medium  
**Test Title:** Verify Empty Cart State and Messages

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Navigate to cart without adding items | - | Empty cart page loads | Empty cart displayed | Pass |
| 2 | Verify empty cart message | - | "Your cart is empty" message is displayed | Message displayed correctly | Pass |
| 3 | Verify "Continue Shopping" button | - | Button is visible and clickable | Button functional | Pass |
| 4 | Click "Continue Shopping" | - | User navigates to products page | Navigation successful | Pass |

---

## Test Case 3: Cart Quantity Validation

**Test Case ID:** Test_Cart_003  
**Test Priority:** High  
**Test Title:** Verify Cart Quantity Limits and Validation

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Add product to cart | Product with stock: 10 | Product added successfully | Product added | Pass |
| 2 | Increase quantity to maximum stock | Quantity: 10 | Quantity updates to 10 | Quantity updated | Pass |
| 3 | Try to increase beyond stock limit | Quantity: 11 | Error message or quantity limited to stock | Stock limit enforced | Pass |
| 4 | Set quantity to 0 | Quantity: 0 | Item removed from cart or error shown | Item removed | Pass |
| 5 | Set negative quantity | Quantity: -1 | Validation error or quantity set to 1 | Validation works | Pass |

---

## Test Case 4: Cart Price Calculations

**Test Case ID:** Test_Cart_004  
**Test Priority:** High  
**Test Title:** Verify Accurate Price Calculations

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Add single item to cart | Price: ₹299, Quantity: 1 | Subtotal: ₹299 | Subtotal correct | Pass |
| 2 | Add multiple items | Item 1: ₹299, Item 2: ₹199 | Subtotal: ₹498 | Subtotal calculated | Pass |
| 3 | Verify tax calculation | Subtotal: ₹498, Tax: 8% | Tax: ₹39.84 | Tax calculated correctly | Pass |
| 4 | Verify shipping charges | Subtotal: ₹498 | Shipping: ₹0 (Free shipping over ₹100) | Shipping correct | Pass |
| 5 | Verify grand total | Subtotal + Tax + Shipping | Grand Total: ₹537.84 | Total calculated correctly | Pass |
| 6 | Update quantity and verify recalculation | Quantity changed to 2 | All prices recalculated | Prices updated | Pass |

---

## Test Case 5: Cart Persistence

**Test Case ID:** Test_Cart_005  
**Test Priority:** Medium  
**Test Title:** Verify Cart Data Persistence

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Add items to cart | 2 items | Items added to cart | Items in cart | Pass |
| 2 | Refresh the page | F5 or browser refresh | Cart items persist | Items still in cart | Pass |
| 3 | Navigate to different page and back | Go to Products, return to Cart | Cart items persist | Items maintained | Pass |
| 4 | Close and reopen browser (guest) | - | Cart may or may not persist | [Result depends on implementation] | [Status] |
| 5 | Login and verify cart merge | Guest cart + User cart | Guest cart merges with user cart | Cart merged correctly | Pass |

---

## Test Case 6: Cart Error Handling

**Test Case ID:** Test_Cart_006  
**Test Priority:** Medium  
**Test Title:** Verify Error Handling in Cart Operations

| Step | Test Step | Test Data | Expected Result | Actual Result | Status (Pass/Fail) |
|------|-----------|-----------|-----------------|---------------|-------------------|
| 1 | Try to add out-of-stock product | Product with stock: 0 | Error message displayed | Error message shown | Pass |
| 2 | Try to checkout with empty cart | Empty cart | Error or redirect to products | Appropriate action taken | Pass |
| 3 | Network error during cart update | Simulate network failure | Error message displayed | Error handled gracefully | Pass |
| 4 | Invalid quantity input | Quantity: "abc" | Validation error shown | Validation works | Pass |

---

## Summary

**Total Test Cases:** 6  
**Total Test Steps:** 35+  
**Passed:** [Number]  
**Failed:** [Number]  
**Blocked:** [Number]  

**Overall Status:** [Pass/Fail/In Progress]

---

## Notes
- All cart operations should work for both logged-in users and guest users
- Cart should handle concurrent updates gracefully
- Price calculations must be accurate to 2 decimal places
- Cart should persist across browser sessions for logged-in users
- Guest cart may be cleared on browser close (implementation dependent)

---

## Defects Found
[List any defects or issues found during testing]

1. [Defect ID]: [Description]
2. [Defect ID]: [Description]

---

## Recommendations
1. Add cart item count badge in navigation
2. Implement cart expiration for guest users
3. Add cart save/restore functionality
4. Improve error messages for better user experience




