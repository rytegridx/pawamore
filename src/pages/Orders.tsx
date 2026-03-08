import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChevronDown, ChevronUp } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  confirmed: "bg-primary/20 text-primary",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-primary/30 text-primary",
  delivered: "bg-primary/40 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, quantity, unit_price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (!user) return <Layout><div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><p>Please log in.</p><Link to="/login"><Button variant="amber">Login</Button></Link></div></Layout>;

  return (
    <Layout>
      <div className="container py-8 sm:py-12 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6">My Orders</h1>
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet.</p>
            <Link to="/products"><Button variant="amber">Start Shopping →</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full p-4 flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="font-display font-bold">₦{Number(order.total_amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                      {order.status}
                    </span>
                    {expanded === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expanded === order.id && (
                  <div className="border-t border-border p-4 bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-2">Delivery: {order.shipping_name}, {order.shipping_address}, {order.shipping_city}</p>
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-1.5 text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="font-semibold">₦{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
