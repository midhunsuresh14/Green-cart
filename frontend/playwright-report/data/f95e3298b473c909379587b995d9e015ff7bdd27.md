# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "G GreenCart" [ref=e5]:
        - /url: /
        - generic [ref=e6]: G
        - heading "GreenCart" [level=6] [ref=e7]
      - generic [ref=e8]:
        - link "Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - link "Products" [ref=e10] [cursor=pointer]:
          - /url: /products
        - link "Herbal Remedies" [ref=e11] [cursor=pointer]:
          - /url: /remedies
        - link "Blog" [ref=e12] [cursor=pointer]:
          - /url: /blog
        - button "Cart" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
        - link "Wishlist" [ref=e16] [cursor=pointer]:
          - /url: /wishlist
          - generic [ref=e17]: favorite
        - button "Feedback" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
        - generic [ref=e21]:
          - link "Login" [ref=e22] [cursor=pointer]:
            - /url: /login
            - img [ref=e24]
            - text: Login
          - link "Sign Up" [ref=e26] [cursor=pointer]:
            - /url: /signup
            - img [ref=e28]
            - text: Sign Up
  - main [ref=e31]:
    - paragraph [ref=e36]: Loading categories...
  - button [ref=e37] [cursor=pointer]:
    - img [ref=e38]
```