import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    stock_quantity: number;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  itemCount: number;
  total: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [], loading: false, itemCount: 0, total: 0,
  addToCart: async () => {}, removeFromCart: async () => {},
  updateQuantity: async () => {}, clearCart: async () => {}, refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (authLoading) return; // Wait for auth to be ready
    if (!user) { 
      setItems([]); 
      setLoading(false);
      return; 
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, products(name, slug, price, discount_price, stock_quantity, product_images(image_url, is_primary))")
        .eq("user_id", user.id);
      if (error) throw error;
      setItems((data as any) || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId: string) => {
    if (!user) { 
      toast({ title: "Please log in", description: "You need to log in to add items to cart.", variant: "destructive" }); 
      return; 
    }
    try {
      const existing = items.find(i => i.product_id === productId);
      if (existing) {
        const { error } = await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: 1 });
        if (error) throw error;
      }
      await fetchCart();
      toast({ title: "Added to cart" });
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast({ title: "Failed to add item", description: error.message || "Please try again", variant: "destructive" });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
      if (error) throw error;
      await fetchCart();
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      toast({ title: "Failed to remove item", description: error.message || "Please try again", variant: "destructive" });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;
    try {
      const { error } = await supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("product_id", productId);
      if (error) throw error;
      await fetchCart();
    } catch (error: any) {
      console.error("Update quantity error:", error);
      toast({ title: "Failed to update quantity", description: error.message || "Please try again", variant: "destructive" });
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) throw error;
      setItems([]);
    } catch (error: any) {
      console.error("Clear cart error:", error);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const price = (i as any).products?.discount_price || (i as any).products?.price || 0;
    return sum + Number(price) * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, itemCount, total, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
