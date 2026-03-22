/**
 * Upload iTel product images to Supabase Storage
 * 
 * Prerequisites:
 * 1. Create a storage bucket named "products" in Supabase Dashboard
 * 2. Make it public or set appropriate policies
 * 3. Run: node upload-images.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ijmhkuenipllgbotltyx.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbWhrdWVuaXBsbGdib3RsdHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDM0MjAsImV4cCI6MjA4ODU3OTQyMH0.pyx2w6CfA-hWRAqKLU_LblZ-rEKjHANlUT6CfM3VhjM';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'products';
const IMAGE_DIR = './product-images/itel-solar-generator';

async function uploadImages() {
  console.log('🚀 Starting image upload to Supabase Storage...\n');

  // Check if bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
    return;
  }

  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    console.log(`📦 Creating bucket: ${BUCKET_NAME}...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });
    
    if (createError) {
      console.error('❌ Error creating bucket:', createError);
      return;
    }
    console.log('✅ Bucket created!\n');
  } else {
    console.log(`✅ Bucket "${BUCKET_NAME}" exists\n`);
  }

  // Get all image files
  const imageFiles = fs.readdirSync(IMAGE_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .filter(file => file.startsWith('image-'));

  console.log(`📸 Found ${imageFiles.length} images to upload\n`);

  const uploadedUrls = [];

  for (const filename of imageFiles) {
    const filePath = path.join(IMAGE_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `itel-solar-generator/${filename}`;

    console.log(`📤 Uploading ${filename}...`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`❌ Error uploading ${filename}:`, error);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
      
      uploadedUrls.push({
        filename,
        url: publicUrl,
      });
      console.log(`✅ Uploaded: ${publicUrl}\n`);
    }
  }

  // Save URLs to file
  const urlsText = uploadedUrls.map((item, index) => 
    `-- Image ${index + 1}\n'${item.url}'`
  ).join(',\n');

  fs.writeFileSync('uploaded-urls.txt', 
    uploadedUrls.map(item => item.url).join('\n')
  );

  console.log('\n================================================');
  console.log('✅ Upload complete!');
  console.log(`📝 ${uploadedUrls.length} images uploaded`);
  console.log('📋 URLs saved to: uploaded-urls.txt\n');

  console.log('🔄 Updated SQL for itel-product-seed.sql:\n');
  console.log('INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order, is_primary)');
  console.log('VALUES');
  uploadedUrls.forEach((item, index) => {
    const altText = `iTel 500W Solar Generator ${index === 0 ? 'Front View' : index === 1 ? 'Side View' : index === 2 ? 'Display Panel' : 'Detail View'}`;
    const isPrimary = index === 0 ? 'true' : 'false';
    const comma = index < uploadedUrls.length - 1 ? ',' : ';';
    console.log(`  (v_product_id, '${item.url}', '${altText}', ${index}, ${isPrimary})${comma}`);
  });

  console.log('\n📌 Next steps:');
  console.log('1. Copy the INSERT statement above');
  console.log('2. Replace the placeholder URLs in itel-product-seed.sql');
  console.log('3. Run the SQL file in Supabase Dashboard');
}

uploadImages().catch(console.error);
