# TLS certificates (self-signed)

Do not commit private keys. Generate certs on the machine that will run the API (or generate once and copy the whole `certs/` folder securely).

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

## Run API with HTTPS

```bash
export SSL_KEY_PATH="$(pwd)/certs/server.key"
export SSL_CERT_PATH="$(pwd)/certs/server.crt"
export PORT=443
node server.js
```

Or use PM2 with `env_production` in `ecosystem.config.js`.

## Trust CA in Android

```bash
cp certs/ca.crt ../EasyTrip/android/app/src/main/res/raw/easytrip_ca.crt
```

Then rebuild the release APK. App `.env` should use:

```text
EASYTRIP_API_URL=https://172.245.33.131:443
```

## Verify

```bash
curl -v --cacert certs/ca.crt https://172.245.33.131:443/api/routes/nearby?lng=106.7&lat=10.8
```

Browsers will warn about the certificate; that is expected for self-signed.
