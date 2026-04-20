# MurPlace Frontend

Frontend for the MurPlace project. This repository contains a Vite + React application.

**Development**

- **Install dependencies (first time):**

```bash
cd frontend
npm install
```

- **Run frontend dev server (Vite):**

```bash
cd frontend
npm run dev
```

Vite will print the local dev URL in the terminal.
The port shown is for the site. All api request are proxied at port 8000. 
- **Run frontend + backend together (concurrently):**

```bash
cd frontend
npm install    # if not already installed
npm run start
```

This runs both the Vite dev server and the backend Django dev server (`python ../manage.py runserver 8000`) as defined in `package.json`.  
For this to work you need to put the backend server in the folder that is written above.

- **Run backend only (Django):**

```bash
# from the repository root where `manage.py` lives
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # if available
python manage.py runserver 8000
```
**How to run this with the server**

You need to build the frontend with Vite and serve the built files using the backend that you have.

```bash

```

copy the files from dist into the static folder of your backend. and update the server to serve the pages in question. In Django for example, you'll add the views for em.

## API Documentation (Used By Frontend)

This section documents all API calls currently used by the frontend codebase.
For the latest audited endpoint inventory with source mappings, see [frontend/API_USAGE.md](frontend/API_USAGE.md).

### Base URL and Transport

- Relative fetch calls use Vite proxy in development and resolve under the same host in production.
- Axios client in [frontend/src/services/api.js](frontend/src/services/api.js) uses env var VITE_API_URL as base URL.
- Axios timeout: 10000 ms.
- Axios sends credentials with withCredentials=true.

### Common Request Headers

- Authorization: Bearer access token (when token exists in localStorage).
- X-Lang: language from localStorage lang key.
- Accept-Language: ru or en (derived from lang).
- Content-Type: application/json for JSON requests.

### Authentication and User APIs

Source: [frontend/src/services/auth.js](frontend/src/services/auth.js), [frontend/src/services/api.js](frontend/src/services/api.js), [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx)

- POST /api/login/
	- Used in both authService login and login page helper.
	- Accepts credentials.
	- Frontend supports either:
		- JWT style: access + refresh
		- Legacy style: token

- POST /api/logout/
	- Logs out on backend (best effort).
	- Frontend always clears local tokens.

- POST /api/token/refresh/
	- Called by authService and axios response interceptor on 401.
	- Expected response: access.

- POST /api/signup/
	- Creates account.
	- May return tokens (same formats as login).

- GET /api/profile/
	- Fetch current user profile.

- PATCH /api/profile/
	- Update profile fields (for example lang).

- GET /api/email/verification-status/
	- Used to confirm/check email verification.

- POST /api/email/request-verification/
	- Resend verification email.

- GET /api/telegram/generate-link/
	- Returns Telegram link object.

### Product and Catalog APIs

Source: [frontend/src/utils/api.js](frontend/src/utils/api.js), [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx), [frontend/src/pages/ProductDetail.jsx](frontend/src/pages/ProductDetail.jsx)

- GET /api/products/?category={category}&page={page}
	- Category listing in Products page.
	- Frontend supports paginated shape with results and count.

- GET /api/products/search/?q={query}&offset={offset}&limit={limit}
	- Search results endpoint.

- GET /api/products/{id}/
	- Product detail endpoint.

- GET /api/products/
	- Home page JSON fallback and popular products source.

- GET /api/products.pb
	- Home page preferred protobuf source when available.

- GET /api/dealscarousel
	- Home page deals carousel source.

### Misc/Example API

Source: [frontend/src/components/ExampleComponent.jsx](frontend/src/components/ExampleComponent.jsx)

- GET /items/
	- Uses axios base URL (VITE_API_URL).
	- Example/demo component only.

### Frontend Browser APIs Used

The frontend also relies on these browser APIs:

- localStorage
	- Keys used: token, refreshToken, lang, theme, cartItems, mock_confirmation_codes.

- Window events and custom events
	- storage
	- cart-updated
	- lang-changed
	- lang-saved

- Navigation/location
	- window.location.href is used in auth redirect paths.

## Pricing Contract (Current + Future)

Source: [frontend/src/utils/currency.js](frontend/src/utils/currency.js), [frontend/src/utils/cart.js](frontend/src/utils/cart.js)

### Current Behavior

- Frontend formats by locale:
	- ru uses rouble sign.
	- en uses dollar sign.
- Numeric value is currently the same base number if backend only sends one price field.

### Forward-Compatible Product Price Fields

Frontend supports these fields now:

- Base fallback field:
	- price

- USD candidates:
	- price_usd
	- usd_price
	- priceUsd

- RUB candidates:
	- price_rub
	- rub_price
	- priceRub

Selection logic:

- For ru locale: prefer RUB candidates, then USD candidates, then price.
- For en locale: prefer USD candidates, then price, then RUB candidates.

### Cart Storage Compatibility

- Cart still stores price for backward compatibility.
- Cart now also stores optional price_usd and price_rub when provided.
- Totals are computed from locale-selected price value, so once backend starts returning dual prices, totals and line items switch automatically without additional frontend changes.

### Recommended Backend Response Shape

For each product object, provide at least:

- id
- name
- image_url
- price_usd
- price_rub

Optional fallback for legacy clients:

- price