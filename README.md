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
npm run build
```

copy the files from dist into the static folder of your backend. and update the serve to serve the pages in question. In Django for example, you'll add the views for em.