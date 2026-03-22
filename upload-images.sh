#!/bin/bash
# Upload iTel product images to Supabase Storage
# Run this script after setting up your Supabase storage bucket

# Configuration
SUPABASE_URL="https://ijmhkuenipllgbotltyx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbWhrdWVuaXBsbGdib3RsdHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDM0MjAsImV4cCI6MjA4ODU3OTQyMH0.pyx2w6CfA-hWRAqKLU_LblZ-rEKjHANlUT6CfM3VhjM"
BUCKET_NAME="products"
IMAGE_DIR="./product-images/itel-solar-generator"

echo "🚀 Uploading iTel product images to Supabase Storage..."
echo "=================================================="

# Function to upload a file
upload_file() {
    local file=$1
    local filename=$(basename "$file")
    local path="itel-solar-generator/$filename"
    
    echo "📤 Uploading $filename..."
    
    response=$(curl -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET_NAME/$path" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: $(file -b --mime-type "$file")" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        --data-binary "@$file" \
        -s)
    
    if echo "$response" | grep -q "error"; then
        echo "❌ Error: $response"
    else
        public_url="$SUPABASE_URL/storage/v1/object/public/$BUCKET_NAME/$path"
        echo "✅ Uploaded: $public_url"
        echo "$public_url" >> uploaded_urls.txt
    fi
}

# Clear previous URLs file
> uploaded_urls.txt

# Upload all images
for img in $IMAGE_DIR/image-*.jpg $IMAGE_DIR/image-*.webp; do
    if [ -f "$img" ]; then
        upload_file "$img"
    fi
done

echo ""
echo "=================================================="
echo "✅ Upload complete!"
echo "📝 URLs saved to: uploaded_urls.txt"
echo ""
echo "Next steps:"
echo "1. Check uploaded_urls.txt for image URLs"
echo "2. Update itel-product-seed.sql with these URLs"
echo "3. Run the SQL file in Supabase"

# Display the URLs
echo ""
echo "📋 Uploaded Image URLs:"
cat uploaded_urls.txt
