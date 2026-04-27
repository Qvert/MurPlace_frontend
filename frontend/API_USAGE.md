# Frontend API Usage Inventory

Last audited: 2026-04-20

This file documents HTTP APIs currently used by the frontend codebase.

## Scope

Audited files include:

- src/pages/Home.jsx
- src/pages/ProductDetail.jsx
- src/pages/Products.jsx
- src/pages/SearchResults.jsx
- src/services/api.js
- src/services/auth.js
- src/utils/api.js
- src/components/ExampleComponent.jsx
- scripts/smoke-language.js

## Runtime Clients

### Fetch-based calls

- Used directly in pages and in src/utils/api.js.
- Use relative paths like /api/products/.
- In development, Vite proxies /api to backend (see vite.config.js).

### Axios-based calls

- Client: src/services/api.js.
- baseURL: VITE_API_URL.
- timeout: 10000 ms.
- withCredentials: true.
- Adds Authorization header when localStorage token exists.
- Adds X-Lang and Accept-Language from localStorage lang.
- On 401, tries POST {VITE_API_URL}/api/token/refresh/ and retries original request.

## Endpoint Inventory

### Catalog and Product Endpoints

1. GET /api/products.pb
- Source: src/pages/Home.jsx
- Purpose: preferred Home product source (protobuf payload).
- Response expected: protobuf binary decoded by src/utils/proto.js into product array.
- Fallback: on failure or non-200, frontend falls back to GET /api/products/.

2. GET /api/products/
- Sources: src/pages/Home.jsx, src/utils/api.js
- Purpose:
  - Home popular items fallback/source.
  - Category listing in Products page.
- Query params used in code:
  - category (optional)
  - subcategory (optional)
  - page (required by caller)
- Response shapes supported:
  - Paginated: { count, results: [...] }
  - Plain array: [...]
  - Home flow also accepts { products: [...] }.

  3. GET /api/products/popular/
  - Source: src/utils/api.js (used by src/pages/Home.jsx)
  - Purpose: dedicated endpoint for Home popular items.
  - Fallback behavior: frontend falls back to GET /api/products/ if this route is unavailable.

  4. GET /api/products/search/
- Source: src/utils/api.js (used by src/pages/SearchResults.jsx)
- Purpose: product search.
- Query params used in code:
  - q (search term)
  - offset
  - limit
- Response expected in SearchResults page: { products: [...], total: number }.

5. GET /api/products/:id/
- Source: src/pages/ProductDetail.jsx
- Purpose: product detail page.
- Response shapes supported:
  - { product: {...} }
  - {...} (direct product object)

6. GET /api/dealscarousel
- Source: src/pages/Home.jsx
- Purpose: hero/deals carousel data.
- Response shapes supported:
  - [...]
  - { deals: [...] }
  - { cards: [...] }
- Fallback: mockDealsCarousel on failure/empty.

7. GET review endpoint(s) for product detail
- Source: src/utils/reviews.js (used by src/pages/ProductDetail.jsx)
- Purpose: load product reviews from backend.
- Frontend tries these routes in order:
  - /api/products/:id/reviews/
  - /api/reviews/?product=:id
- Response shapes supported:
  - [...]
  - { results: [...] }
  - { reviews: [...] }
- Fallback: if endpoints are unavailable, frontend uses localStorage cache.

8. POST review endpoint(s) for product detail
- Source: src/utils/reviews.js (used by src/pages/ProductDetail.jsx)
- Purpose: submit a new review.
- Frontend tries these routes in order:
  - POST /api/products/:id/reviews/ with { author, rating, comment }
  - POST /api/reviews/ with { product, author, rating, comment }
- Fallback: if endpoints are unavailable, frontend stores review in localStorage cache.

### Auth and Account Endpoints

9. POST /api/login/
- Source: src/services/auth.js
- Used by: src/pages/Login.jsx
- Request body sent: { email, username, password }
  - email and username both receive the same login input value.
  - Login form now labels this field as email address.
- Response shapes supported:
  - JWT style: { access, refresh }
  - Legacy style: { token }

10. POST password reset request endpoint(s)
- Source: src/services/auth.js
- Used by: src/pages/ResetPassword.jsx
- Request body sent: { email }
- Frontend will try these common endpoint paths until one responds:
  - /api/password/reset/
  - /api/password-reset/
  - /api/auth/password/reset/
  - /api/password-reset-request/
- Purpose: send a password reset email or link.

11. POST /api/logout/
- Source: src/services/auth.js
- Used by: src/pages/Account.jsx
- Purpose: server logout (frontend clears tokens regardless of response outcome).

12. POST /api/token/refresh/
- Sources: src/services/auth.js and src/services/api.js interceptor
- Request body: { refresh }
- Response expected: { access }
- Behavior: if refresh fails, frontend clears tokens and redirects to /login.

13. POST /api/signup/
- Source: src/services/auth.js
- Used by: src/pages/Signup.jsx
- Request body: signup form payload (username, first_name, email, password).
- Response handling:
  - If access/token present, user is treated as authenticated.
  - Otherwise UI proceeds with email verification flow.

14. GET /api/profile/
- Source: src/services/auth.js
- Used by: src/pages/Account.jsx
- Purpose: fetch current user profile.

15. PATCH /api/profile/
- Source: src/services/auth.js
- Purpose: update profile fields.
- Notes:
  - Not directly called by Account page in current UI path.
  - Explicitly watched in scripts/smoke-language.js to validate language persistence flow.

16. GET /api/email/verification-status/
- Source: src/services/auth.js
- Used by: src/pages/ConfirmEmail.jsx
- Purpose: check whether user email is verified.
- Response expected: includes verified boolean; may also include auth token fields.

17. POST /api/email/request-verification/
- Source: src/services/auth.js
- Used by: src/pages/Signup.jsx and src/pages/ConfirmEmail.jsx
- Request body: { email }
- Purpose: send/resend confirmation email.

18. GET /api/telegram/generate-link/
- Source: src/services/auth.js
- Used by: src/pages/Account.jsx
- Response expected: { link }
- Purpose: generate Telegram bot/account-link URL.

### Example/Demo Endpoint

19. GET /items/
- Source: src/components/ExampleComponent.jsx
- Purpose: sample/demo data loading component.
- Client: axios instance with baseURL VITE_API_URL.
- Note: this endpoint is not part of core storefront/auth flows.

## Mock Mode Notes

When VITE_USE_MOCK_AUTH=true (src/services/auth.js):

- login, signup, refreshToken, confirmEmail, resendConfirmation, and checkEmailVerificationStatus may skip backend HTTP calls and use localStorage-backed mock behavior.
- Product/catalog endpoints are still real fetch calls.

## Quick Coverage Summary

- Core product/catalog endpoints: 7
- Auth/account endpoints: 9
- Demo endpoint: 1
- Total distinct API routes in code: 19