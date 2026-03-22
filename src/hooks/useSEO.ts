import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  price?: number;
  availability?: string;
}

const useSEO = ({ title, description, image, url, type = "website", price, availability }: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const updateMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Basic meta tags
    updateMeta("name", "description", description);
    
    // Open Graph tags
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    updateMeta("property", "og:type", type);
    updateMeta("property", "og:site_name", "PawaMore Systems");
    updateMeta("property", "og:locale", "en_NG");
    
    // Twitter Card tags
    updateMeta("name", "twitter:card", "summary_large_image");
    updateMeta("name", "twitter:title", title);
    updateMeta("name", "twitter:description", description);
    updateMeta("name", "twitter:site", "@PawaMoreNG");

    // Product-specific tags
    if (type === "product" && price) {
      updateMeta("property", "product:price:amount", price.toString());
      updateMeta("property", "product:price:currency", "NGN");
      updateMeta("property", "og:price:amount", price.toString());
      updateMeta("property", "og:price:currency", "NGN");
      
      if (availability) {
        updateMeta("property", "product:availability", availability);
      }
    }

    if (image) {
      // Ensure absolute URL for OG image
      const absoluteImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      updateMeta("property", "og:image", absoluteImage);
      updateMeta("property", "og:image:secure_url", absoluteImage);
      updateMeta("property", "og:image:type", "image/jpeg");
      updateMeta("property", "og:image:width", "1200");
      updateMeta("property", "og:image:height", "630");
      updateMeta("property", "og:image:alt", title);
      updateMeta("name", "twitter:image", absoluteImage);
      updateMeta("name", "twitter:image:alt", title);
    }

    if (url) {
      const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
      updateMeta("property", "og:url", absoluteUrl);
    } else {
      updateMeta("property", "og:url", window.location.href);
    }
  }, [title, description, image, url, type, price, availability]);
};

export default useSEO;
