# AI Travel Planner

A full-stack travel planner for remote workers. It generates structured day-by-day itineraries with OpenAI and stores saved trips in PostgreSQL.

## Run with Docker

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in `OPENAI_API_KEY` and review the remaining values. `DATABASE_URL` must use the Compose database host (`db`) and match the Postgres credentials.

3. Start the app:

   ```bash
   docker compose up --build
   ```

4. Open [http://localhost](http://localhost).

Only Caddy is exposed publicly. It reverse-proxies to nginx, which serves the React app and proxies `/api` to the backend. With `DOMAIN=localhost`, Caddy provides local HTTPS using its internal certificate authority; your browser may warn until that local certificate is trusted.

## Services

- `caddy`: public HTTP/HTTPS entry point and automatic certificate management
- `frontend`: React + TypeScript, built with Vite and served by nginx
- `backend`: Express + TypeScript, OpenAI calls, validation, and database access
- `db`: PostgreSQL with `db/init.sql` mounted for initial schema creation

Postgres data is persisted in the `postgres_data` Docker volume. Caddy certificates and configuration are persisted in the `caddy_data` and `caddy_config` volumes. To recreate all persistent data, run `docker compose down -v` before starting again.

## Local development

Start the Docker services with the explicit development configuration in one terminal. `docker-compose.dev.yml` exposes the backend only on `127.0.0.1:3000`:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Then run the Vite development server in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite provides frontend hot reload and proxies `/api` requests to the local backend on port 3000.

Plain `docker compose up` uses only the production setup, so the backend stays private.

## Deploy to a VPS

1. Point your domain's DNS `A` record to the VPS public IP address.
2. Install Docker and Docker Compose, clone the project, and copy `.env.example` to `.env`.
3. Set `DOMAIN` to the real domain, add the OpenAI key, and replace the example database password in both `POSTGRES_PASSWORD` and `DATABASE_URL`.
4. Allow inbound TCP ports 80 and 443 in the VPS firewall, then run:

   ```bash
   docker compose up --build -d
   ```

Caddy will request and renew the HTTPS certificate automatically once the domain resolves to the VPS and ports 80 and 443 are reachable.
