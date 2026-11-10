Prepare this app for deployment on a VPS with HTTPS.

- Add a Caddy service to docker-compose.yml as the only public entry
  point (ports 80 and 443). It reverse-proxies to the frontend (nginx)
  and gets HTTPS certificates automatically.
- Add a Caddyfile that reads the domain from a DOMAIN env variable.
- Stop publishing the frontend's port 80 to the host. Only Caddy is public.
- Store Caddy's certificates in named volumes so they survive restarts.
- Add DOMAIN to .env.example (localhost for local development).
- Add a short "Deploy to a VPS" section to the README.

Keep the changes minimal and explain what you changed.
