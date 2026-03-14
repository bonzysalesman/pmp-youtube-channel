#!/bin/bash

# Configuration
PDF_PATH="/Users/bonzysalesman/Project/pmp-exam-prep/020BABOK20Guide20v3.319690814.pdf"
OUTPUT_DIR="/Users/bonzysalesman/Project/pmp-exam-prep/_bmad-output/atoms"
TEXT_OUTPUT="$OUTPUT_DIR/babok_text.txt"
IMAGE_DIR="$OUTPUT_DIR/images"

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$IMAGE_DIR"

echo "Step 1: Extracting text from PDF..."
pdftotext -layout "$PDF_PATH" "$TEXT_OUTPUT"

echo "Step 2: Extracting images from PDF..."
pdfimages -j "$PDF_PATH" "$IMAGE_DIR/img"

echo "Step 3: Chunking text into atoms (conceptually)..."
# In a real workflow, we might use a script to split by chapter.
# For now, we'll keep the full text and identify chapters manually or via grep.

echo "Dissection complete. Files located in $OUTPUT_DIR"
