#!/bin/bash

# Configuration
SOURCE_DIR="/Users/bonzysalesman/Project/pmp-exam-prep/understrap-child-1.2.0/"
DEST_DIR="/Users/bonzysalesman/Studio/pmp-exam-prep/wp-content/themes/pmp-mastery-framework/"

echo "Starting synchronization to staging..."
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"

# Ensure destination exists
mkdir -p "$DEST_DIR"

# Perform rsync
# -a: archive mode
# -v: verbose
# -H: preserve hard links
# -h: human-readable
# --progress: show progress
# --delete: delete extraneous files from dest dirs
rsync -avHh --progress --delete \
    --exclude '.git/' \
    --exclude '.github/' \
    --exclude 'node_modules/' \
    --exclude '.DS_Store' \
    --exclude 'package-lock.json' \
    --exclude 'extract_page.js' \
    --exclude 'page2.pdf' \
    --exclude 'mockup.png' \
    "$SOURCE_DIR" "$DEST_DIR"

echo "Synchronization complete!"
