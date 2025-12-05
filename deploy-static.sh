#!/bin/bash

# Build the client bundle
pnpm run build

# Upload to S3 (replace with your bucket name)
aws s3 sync ./dist s3://YOUR_BUCKET_NAME/static/ \
  --cache-control "public, max-age=31536000" \
  --exclude "*.map"

echo "Static assets deployed to S3"
