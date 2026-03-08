import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart } from "lucide-react";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", state: "", notes: "" });

  if (!user) return <Layout><div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><p>Please log in.</p><Link to="/login"><Button variant="amber">Login</Button></Link></div></Layout>;
  if (items.length === 0) return <Layout><div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><ShoppingCart className="w-12 h-12 text-muted-foreground/30" /><p className="text-muted-foreground">Your cart is empty.</p><Link to="/products"><Button variant="amber">Browse Products</Button></Link></div></Layout>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: total,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state || null,
        notes: form.notes || null,
      }).select("id").single();

      if (error) throw error;

      const orderItems = items.map(item => {
        const p = (item as any).products;
        return {
          order_id: order.id,
          product_id: item.product_id,
          product_name: p?.name || "Product",
          quantity: item.quantity,
          unit_price: p?.discount_price || p?.price || 0,
        };
      });

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      await clearCart();
      toast({ title: "Order placed successfully! 🎉", description: "We'll contact you shortly to confirm." });
      navigate("/orders");
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8 sm:py-12 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Full Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="text-sm font-medium mb-1 block">Phone Number *</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium mb-1 block">Delivery Address *</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required /></div>
              <div><label className="text-sm font-medium mb-1 block">City *</label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required /></div>
              <div><label className="text-sm font-medium mb-1 block">State</label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium mb-1 block">Notes (optional)</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
            {items.map(item => {
              const p = (item as any).products;
              const unitPrice = p?.discount_price || p?.price || 0;
              return (
                <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{p?.name} × {item.quantity}</span>
                  <span className="text-sm font-semibold">₦{(Number(unitPrice) * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 mt-2">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-extrabold text-primary text-lg">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <Button variant="amber" size="lg" className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Placing Order..." : "Place Order →"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">You'll receive a confirmation call/WhatsApp. Payment on delivery or via bank transfer.</p>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
