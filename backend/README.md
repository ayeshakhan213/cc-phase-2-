# Backend Docker guide

This folder should contain your backend application (Node/Express, Fastify, etc.).

Suggested structure:

- `backend/package.json` — package manifest
- `backend/index.js` or `backend/src/` — source
- `backend/Dockerfile` — container image (this file)

How to build locally (from repo root):

```powershell
docker build -t your-dockerhub-username/glamcart-backend:local -f backend/Dockerfile ./backend
docker run -e PORT=8080 -p 8080:8080 your-dockerhub-username/glamcart-backend:local
```

CI/CD

The repository includes a GitHub Actions workflow `.github/workflows/backend-docker-publish.yml` that builds and pushes the image to Docker Hub.

Set these repository secrets before using the workflow:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_ACCESS_TOKEN` (or `DOCKERHUB_PASSWORD` if you prefer)

DigitalOcean VM (example)

On your DO VM (Docker installed), pull and run the image:

```powershell
docker pull <your-dockerhub-username>/glamcart-backend:latest
docker run -d --name glamcart-backend -p 80:8080 \
  -e DATABASE_URL='postgres://user:pass@db-host:5432/dbname' \
  <your-dockerhub-username>/glamcart-backend:latest
```

Database

We recommend using a separate Postgres instance — either a managed DB (DigitalOcean Managed Databases) or a separate container on the same VM. See `docker-compose.db.yml` at repo root for a sample local DB setup.
