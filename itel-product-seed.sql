-- iTel 500W Solar Generator 1000Wh Product Data
-- Based on https://itelsolar.com/product/itel-500w-solar-generator-1000wh-lithium-battery-iess-05k10p/

-- First, let's get the category and brand IDs we need
DO $$
DECLARE
  v_solar_generator_category_id UUID;
  v_itel_brand_id UUID;
  v_product_id UUID;
BEGIN
  -- Get Solar Generator category (create if doesn't exist)
  SELECT id INTO v_solar_generator_category_id 
  FROM public.product_categories 
  WHERE slug = 'solar-generator' 
  LIMIT 1;
  
  IF v_solar_generator_category_id IS NULL THEN
    INSERT INTO public.product_categories (name, slug, description)
    VALUES ('Solar Generator', 'solar-generator', 'All-in-one solar power stations with inverter and battery')
    RETURNING id INTO v_solar_generator_category_id;
  END IF;

  -- Get Itel Energy brand
  SELECT id INTO v_itel_brand_id 
  FROM public.brands 
  WHERE slug = 'itel-energy' 
  LIMIT 1;

  -- Insert the product
  INSERT INTO public.products (
    category_id,
    brand_id,
    name,
    slug,
    description,
    short_description,
    price,
    discount_price,
    specs,
    powers,
    ideal_for,
    is_featured,
    is_popular,
    promo_label,
    stock_quantity,
    status
  ) VALUES (
    v_solar_generator_category_id,
    v_itel_brand_id,
    'iTel 500W Solar Generator 1000Wh LiFePO4 Battery',
    'itel-500w-solar-generator-1000wh-lifepo4-iess-05k10p',
    
    -- Full description with all details
    E'<h2>iTel IESS-05K10P Solar Generator – 500W/1000Wh</h2>

<p>The iTel IESS-05K10P Solar Generator is an all-in-one power station combining a 500W solar inverter, MPPT charge controller, and 1000Wh lithium battery (LiFePO4 battery). With 6000+ life cycles, 20ms UPS switchover, and dual PV/grid charging, it fully charges in 2 hours via solar (60V max) + grid simultaneously, providing backup power for homes, RVs, and emergencies.</p>

<h3>Key Features:</h3>
<ul>
  <li>✔ 3-in-1 Power Station – Integrates inverter (500W pure sine wave), MPPT controller (400W PV input), and 1000Wh battery</li>
  <li>✔ Rapid Dual Charging – Fully charges in 2 hours via solar (60V max) + grid simultaneously</li>
  <li>✔ Industrial-Grade Battery – LiFePO4 with 6000+ cycles (10-year lifespan)</li>
  <li>✔ Seamless Backup – &lt;20ms UPS switchover for critical loads</li>
  <li>✔ Smart Grid Adaptation – Handles unstable voltages (90-300V) with &lt;3% THD</li>
</ul>

<h3>Runtime Scenarios:</h3>

<h4>Evening Combo (TV, Fan, 2x Lights) - ~130W</h4>
<p>Runtime: ~7.7 hours</p>

<h4>Work Combo (Laptop, Fan, Light) - ~115W</h4>
<p>Runtime: ~8.7 hours</p>

<h4>Essentials (Lights, Router, Phones) - ~90W</h4>
<p>Runtime: ~11 hours</p>

<h4>Deep Freezer (145W)</h4>
<p>Runtime: ~7 hours</p>

<h3>What Can It Power?</h3>
<ul>
  <li>TV (up to 65W) – ~20 hours</li>
  <li>Fan (35W) – ~20 hours</li>
  <li>LED Lights (15W each) – ~100 hours per bulb</li>
  <li>Laptop (65W) – ~15 hours</li>
  <li>Deep Freezer (145W) – ~7 hours</li>
  <li>Microwave (300W) – ~3.3 hours</li>
</ul>',
    
    -- Short description
    'All-in-one 500W solar power station with 1000Wh LiFePO4 battery. 6000+ cycles, 2-hour fast charging, perfect for home backup and emergencies.',
    
    -- Price (₦304,000)
    304000.00,
    
    -- No discount
    NULL,
    
    -- Technical specifications as JSON
    '{
      "Inverter Output": "500W continuous (1000W surge)",
      "Wave Form": "Pure sine wave",
      "Battery Capacity": "1000Wh (48V system)",
      "Battery Type": "LiFePO4",
      "Life Cycles": "6000+ cycles",
      "Solar Input": "400W MPPT",
      "Voltage Range": "60-150V",
      "Charging Speed": "500W max (solar+grid)",
      "UPS Switchover": "<20ms",
      "Grid Compatibility": "90-300V",
      "THD": "<3%",
      "Weight": "~10kg",
      "Display": "LED with system status",
      "Warranty": "3-year limited",
      "Certifications": "CE, RoHS",
      "Model": "IESS-05K10P"
    }'::jsonb,
    
    -- What it powers
    'TV (65W), Fan (35W), LED Lights (15W x 5), Laptop (65W), Deep Freezer (145W), Microwave (300W)',
    
    -- Ideal for
    'Home backup power, RV/camping trips, Emergency power outages, Small off-grid systems',
    
    -- Featured product
    true,
    
    -- Popular product
    true,
    
    -- Promo label
    '6000+ Cycles',
    
    -- Stock quantity
    0,  -- Out of stock as per website
    
    -- Status
    'out_of_stock'
    
  ) RETURNING id INTO v_product_id;

  -- Insert product images
  -- Note: Using placeholder URLs - replace with actual images
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order, is_primary)
  VALUES 
    (v_product_id, 'https://placeholder-for-itel-product-image-1.jpg', 'iTel 500W Solar Generator Front View', 0, true),
    (v_product_id, 'https://placeholder-for-itel-product-image-2.jpg', 'iTel 500W Solar Generator Side View', 1, false),
    (v_product_id, 'https://placeholder-for-itel-product-image-3.jpg', 'iTel 500W Solar Generator Display', 2, false),
    (v_product_id, 'https://placeholder-for-itel-product-image-4.jpg', 'iTel 500W Solar Generator Ports', 3, false);

  RAISE NOTICE 'iTel product added successfully with ID: %', v_product_id;
END $$;
