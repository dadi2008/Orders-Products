# Deploy to a Google Cloud VM with GitHub Actions

The workflow `.github/workflows/deploy.yml` runs build/tests on a GitHub-hosted runner for pull requests and pushes to `development`. After a successful push, deployment runs on a **self-hosted runner installed on the target Compute Engine VM**. Manual runs deploy only when the selected branch is `development`.

## Prepare the VM once

1. Create an x86-64 Linux Compute Engine VM with a persistent boot disk. The stack builds Node.js images and runs Kafka, two PostgreSQL instances, Redis and application services; provision sufficient RAM and disk space for these together.
2. Install Docker Engine, Docker Compose **2.24.4 or newer**, Git and curl. The runner account must have Docker access; verify `docker info` without sudo under that account.
3. In the repository, open **Settings → Actions → Runners → New self-hosted runner**. Follow the generated Linux x64 commands on the VM. Add the custom label **`gcp-production`** and install the runner as a system service so it survives VM restarts. Keep the runner software updated for the checkout action.
4. Create a GitHub Actions environment named **`production`**. Restrict its deployment branches to `development`; configure reviewers if required. Restrict who can push/merge into this branch, because that code executes on the server.
5. Configure the public hostname/IP and Google Cloud ingress rules for the web port. Only the web entry point needs public application ingress; PostgreSQL, Redis, Kafka and realtime remain internal. SSH is only needed for administration, not by this workflow.

For HTTPS, use a TLS reverse proxy or Google Cloud load balancer forwarding HTTP and WebSockets to the configured `WEB_PORT`. HTTPS is needed for the application's service worker/PWA outside localhost. Configure `WEB_ORIGIN` to the public HTTPS origin, not the internal VM address.

## GitHub secrets

Create these under **Settings → Environments → production → Environment secrets** (repository Actions secrets also work):

| Secret | Value |
| --- | --- |
| `ORDERS_POSTGRES_PASSWORD` | Random database password, at least 24 characters using only letters, digits, `_`, `-` |
| `PRODUCTS_POSTGRES_PASSWORD` | A different random password with the same format |
| `JWT_ACCESS_SECRET` | Random signing secret, at least 32 characters |
| `JWT_REFRESH_SECRET` | A different random signing secret, at least 32 characters |
| `WEB_ORIGIN` | Public origin such as `https://inventory.example.com` or `http://VM_EXTERNAL_IP`, without a trailing slash |

Optionally add the environment **variable** `WEB_PORT` (default `80`). If an existing reverse proxy uses port 80, set a different port such as `8080` and forward to it.

Secrets are passed to Compose as process environment variables. The workflow does not generate a `.env` file or print the resolved Compose configuration. Docker still retains runtime environment values in container metadata accessible to administrators with Docker access. No Google Cloud JSON key or SSH key is needed because the runner executes directly on the VM.

## Deployment behavior

- Node.js 24 matches the Docker image. CI installs dependencies, generates Prisma clients, builds all workspaces and runs the backend Vitest suite.
- Pull requests use GitHub-hosted runners and never run the deployment job or receive deployment secrets.
- Production deploys are serialized to avoid simultaneous Compose updates.
- Images are built on the VM from the checked-out commit; no container registry setup is needed.
- Compose runs migrations and seeds before starting dependent services, in both local and production configurations. Seeds ensure four sample arrivals, six products and 20 demo users exist. Existing users and products are preserved, including their passwords and prices; missing seed records are added without duplicating existing records. Products reference the actual seeded arrival IDs, including on databases that already contain user-created arrivals.
- Demo accounts `user1@inventory.local` through `user20@inventory.local` initially use password `Inventory123!`. These are test accounts intended for QA; their known credentials must be considered before making this demo deployment publicly accessible.
- PostgreSQL data and uploaded media use persistent named Docker volumes in the fixed Compose project `orders-products-production`. Checkout cleanup does not delete them.
- The web image uses same-origin GraphQL and Socket.IO; the browser does not connect to `localhost:3003` on users' computers.
- The workflow waits for Compose readiness, then checks the web and health endpoints.
- Deployments update containers in place without `docker compose down`. Brief interruption is possible; this is not a zero-downtime deployment. A failed migration stops deployment; automatic database rollback is not attempted.

Never run `docker compose down -v` on this deployment unless you intend to delete its data. Back up PostgreSQL volumes and media before production migrations. Changing database password secrets does not rotate credentials inside an existing PostgreSQL volume; perform database password rotation separately.

Local development continues to use `docker compose up -d --build` with the original Compose file. To administer production manually, use the same project name and both configuration files, with the required environment variables supplied:

```bash
docker compose -p orders-products-production \
  -f docker-compose.yml -f docker-compose.production.yml ps
```

The files prepare deployment but do not create the VM, configure DNS/TLS/firewall rules or register the runner. The first deployment starts after those steps and a push to `development`.
