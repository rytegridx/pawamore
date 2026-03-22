import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  productName: string;
  productPrice?: number;
  productUrl?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  variant?: "default" | "outline" | "ghost";
  iconOnly?: boolean;
}

const WHATSAPP_NUMBER = "2347062716154";

const WhatsAppButton = ({
  productName,
  productPrice,
  productUrl,
  size = "default",
  className = "",
  variant = "outline",
  iconOnly = false,
}: WhatsAppButtonProps) => {
  // Format price with Naira symbol
  const formattedPrice = productPrice 
    ? `₦${Number(productPrice).toLocaleString('en-NG')}` 
    : null;

  // Create a well-formatted WhatsApp message
  const message = encodeURIComponent(
    `🛒 *PawaMore Product Inquiry*\n\n` +
    `Product: *${productName}*\n` +
    `${formattedPrice ? `Price: ${formattedPrice}\n` : ''}` +
    `${productUrl ? `\n🔗 Product Link:\n${productUrl}\n` : ''}` +
    `\n━━━━━━━━━━━━━━━\n` +
    `Hello PawaMore team! 👋\n\n` +
    `I'm interested in this product and would like more information about:\n` +
    `• Product availability\n` +
    `• Delivery timeline\n` +
    `• Installation support\n` +
    `• Payment options\n\n` +
    `Looking forward to your response!`
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={iconOnly ? "" : "w-full"}>
      <Button
        variant={variant}
        size={size}
        className={`gap-1.5 text-green-600 border-green-600/30 hover:bg-green-50 hover:text-green-700 ${iconOnly ? "" : "w-full"} ${className}`}
        type="button"
      >
        <MessageCircle className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0`} />
        {!iconOnly && <span className="hidden xs:inline truncate">WhatsApp</span>}
      </Button>
    </a>
  );
};

export default WhatsAppButton;
