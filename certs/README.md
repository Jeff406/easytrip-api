# TLS certificates (self-signed)

Do not commit private keys. Generate certs on the machine that will run the API (or generate once and copy the whole `certs/` folder securely).

For the full debug/release workflow (app env files, PM2, Android builds), see [docs/debug-and-release.md](../../docs/debug-and-release.md).

## Generate

```bash
# default IP: 172.245.33.131
./scripts/generate-self-signed-cert.sh

# or a different IP
./scripts/generate-self-signed-cert.sh 203.0.113.10
```

Creates:

- `ca.crt` / `ca.key` — local CA (trust `ca.crt` in the Android app)
- `server.crt` / `server.key` — API server certificate

## Run API with PM2 (dual HTTP + HTTPS)

The API runs under **PM2**. With `--env production`, `ecosystem.config.js` sets SSL paths and both ports so one process listens on:

- HTTP on `HTTP_PORT` (`5000`) — used by debug builds
- HTTPS on `HTTPS_PORT` (`443`) — used by release builds

```bash
# from easytrip-api/
pm2 start ecosystem.config.js --env production
pm2 restart easytrip-api --env production
pm2 logs easytrip-api
pm2 status
```

HTTP-only (no TLS): `pm2 start ecosystem.config.js` (default `env`).

One-off without PM2: `npm run start:dual` or `npm start`.

## Trust CA in Android

```bash
cp certs/ca.crt ../EasyTrip/android/app/src/main/res/raw/easytrip_ca.crt
```

Then rebuild the **release** APK. Release app config (`.env.production`) should use:

```text
EASYTRIP_API_URL=https://172.245.33.131
```

Debug (`.env`) uses cleartext:

```text
EASYTRIP_API_URL=http://172.245.33.131:5000
```

## Verify

```bash
curl -sS "http://172.245.33.131:5000/api/routes/nearby?lng=106.7&lat=10.8"
curl -v --cacert certs/ca.crt "https://172.245.33.131/api/routes/nearby?lng=106.7&lat=10.8"
```

Browsers will warn about the certificate; that is expected for self-signed.
