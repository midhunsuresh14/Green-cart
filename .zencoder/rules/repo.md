# Repo Overview: GreenCart

- **Root**: d:\\GreenCart
- **Apps**:
  - **frontend**: React (Create React App), React 19, React Router 7, Material UI theme present, Tailwind 3.4 configured.
  - **backend**: Flask API with MongoDB (pymongo), JWT auth.

## Frontend (CRA)
- **Entry**: src/index.js imports src/index.css (Tailwind enabled) and MUI ThemeProvider.
- **Routing**: react-router-dom v7.
- **UI**: Material UI theme: src/theme.js. Tailwind added (postcss.config.js, tailwind.config.js) with `@tailwindcss/line-clamp` plugin.
- **Components**: src/components/Products/* (ProductCard, ProductListing, ProductDetail). ProductCard migrated to Tailwind classes.
- **Config**: package.json scripts (start/build/test). Dev deps pinned: tailwindcss 3.4.13, postcss, autoprefixer.
- **Assets**: Google Fonts (Inter) and Material Icons in public/index.html.
- **Firebase**: src/firebase.js initializes Firebase Auth and Google provider.

## Backend (Flask)
- **Main**: backend/app.py
  - CORS enabled, MongoDB at mongodb://localhost:27017/, DB name `greencart`.
  - Collections: users, products, orders, remedies.
  - JWT via `SECRET_KEY` in app.py (should be overridden in env for prod).
  - Routes include: /, /api/db-status, /api/google-auth, /api/signup, /api/login, /api/user/<id>, admin users management, products CRUD.
- **Dependencies**: See backend/requirements.txt (Flask 3.0, Flask-CORS 4.0, pymongo 4.6, PyJWT 2.8, Werkzeug 3.0.1).
- **Run**: python backend/app.py (default port 5000).

## Local Dev Quickstart
- **Frontend**: 
  1. `Set-Location "d:\\GreenCart\\frontend"; npm install`
  2. `npm start` → http://localhost:3000
- **Backend**: 
  1. Ensure MongoDB on localhost:27017
  2. `Set-Location "d:\\GreenCart\\backend"; python -m venv venv; ./venv/Scripts/Activate.ps1`
  3. `pip install -r requirements.txt`
  4. `python app.py` → http://localhost:5000

## Notes
- Replace hardcoded JWT `SECRET_KEY` via env in production.
- Tailwind purge content set to `./src/**/*.{js,jsx,ts,tsx}` and `./public/index.html`.
- Material UI and Tailwind are both active; prefer one consistently per component.
- If CSS files exist alongside Tailwind-migrated components, remove unused CSS and imports.