#!/usr/bin/env bash
set -e

APP_ROOT="$(pwd)"

cat > .htaccess <<HTACCESS
PassengerEnabled on
PassengerAppType node
PassengerAppRoot ${APP_ROOT}
PassengerStartupFile server.js
PassengerNodejs /usr/local/bin/node22
PassengerAppEnv production
HTACCESS

npm22 install
npm22 exec prisma generate
npm22 exec prisma db push
npm22 run build

mkdir -p tmp
touch tmp/restart.txt

echo "Done. Passenger config created for ${APP_ROOT}"
