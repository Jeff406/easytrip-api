#!/usr/bin/env bash
# Generate a local CA and a server cert for the EasyTrip API (self-signed).
# Default host IP matches the current production VPS.
set -euo pipefail

HOST_IP="${1:-172.245.33.131}"
DAYS="${CERT_DAYS:-825}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="${ROOT_DIR}/certs"

mkdir -p "${CERT_DIR}"
cd "${CERT_DIR}"

openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days "${DAYS}" \
  -subj "/CN=EasyTrip Local CA/O=EasyTrip/C=US" \
  -out ca.crt

openssl genrsa -out server.key 2048
openssl req -new -key server.key \
  -subj "/CN=${HOST_IP}/O=EasyTrip/C=US" \
  -out server.csr

cat > server.ext <<EOF
basicConstraints=CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = ${HOST_IP}
DNS.1 = localhost
IP.2 = 127.0.0.1
EOF

openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days "${DAYS}" -sha256 -extfile server.ext

rm -f server.csr server.ext ca.srl

chmod 600 ca.key server.key
chmod 644 ca.crt server.crt

echo ""
echo "Created certs in ${CERT_DIR}:"
echo "  ca.crt / ca.key"
echo "  server.crt / server.key (SAN IP: ${HOST_IP})"
echo ""
echo "Copy ca.crt into the Android app:"
echo "  cp ${CERT_DIR}/ca.crt <EasyTrip>/android/app/src/main/res/raw/easytrip_ca.crt"
echo ""
echo "Set env on the API host:"
echo "  SSL_KEY_PATH=${CERT_DIR}/server.key"
echo "  SSL_CERT_PATH=${CERT_DIR}/server.crt"
echo "  PORT=443"
