#!/bin/bash
set -e

# Replace BACKEND_URL placeholder in nginx config
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
sed -i "s|\${BACKEND_URL}|${BACKEND_URL}|g" /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
