#!/bin/bash

# Configuration
PDF_PATH="/Users/bonzysalesman/Project/pmp-exam-prep/020BABOK20Guide20v3.319690814.pdf"
OUTPUT_DIR="/Users/bonzysalesman/Project/pmp-exam-prep/_bmad-output/atoms/visual_pages"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Step 1: Converting PDF pages to high-quality JPG images..."
# -jpeg: output as JPG
# -r 150: 150 DPI for good balance between quality and size
pdftoppm -jpeg -r 150 "$PDF_PATH" "$OUTPUT_DIR/page"

echo "Visual dissection complete. Images located in $OUTPUT_DIR"
