#!/bin/sh
set -e

# Start nginx as a background process
nginx

# Start the Vite dev server in the foreground.
exec npm run dev