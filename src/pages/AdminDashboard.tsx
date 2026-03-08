import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Image, Package, LogOut, LayoutDashboard, Eye, ShoppingBag, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import logo from "@/assets/logo.png";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  status: string;
  is_featured: boolean;
  is_popular: boolean;
  promo_label: string | null;
  stock_quantity: number;
  short_description: string | null;
  created_at: string;
  product_images: { image_url: string; is_primary: boolean }[];
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  confirmed: "bg-primary/20 text-primary",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-primary/30 text-primary",
  delivered: "bg-primary/40 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, product_images(image_url, is_primary)")
      .order("created_at", { ascending: false });
    setProducts((data as any) || []);
    setLoadingData(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(id, product_name, quantity, unit_price)")
      .order("created_at", { ascending: false });
    setOrders((data as any) || []);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus as any }).eq("id", orderId);
    setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-forest border-b border-primary-foreground/10 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="PawaMore" className="h-8 w-auto rounded-lg" />
            <span className="font-display font-bold text-primary-foreground text-sm hidden sm:inline">Admin</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/"><Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground text-xs"><Eye className="w-4 h-4 mr-1" /> Site</Button></Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground text-xs"><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <Package className="w-5 h-5 text-primary mb-2" />
            <p className="font-display font-extrabold text-xl sm:text-2xl">{products.length}</p>
            <p className="text-xs text-muted-foreground">Products</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <ShoppingBag className="w-5 h-5 text-primary mb-2" />
            <p className="font-display font-extrabold text-xl sm:text-2xl">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <DollarSign className="w-5 h-5 text-accent mb-2" />
            <p className="font-display font-extrabold text-xl sm:text-2xl">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Users className="w-5 h-5 text-destructive mb-2" />
            <p className="font-display font-extrabold text-xl sm:text-2xl">{pendingOrders}</p>
            <p className="text-xs text-muted-foreground">Pending Orders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border">
          <button onClick={() => setActiveTab("products")} className={`px-4 py-2.5 text-sm font-display font-semibold border-b-2 transition-colors ${activeTab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Package className="w-4 h-4 inline mr-1.5" />Products
          </button>
          <button onClick={() => setActiveTab("orders")} className={`px-4 py-2.5 text-sm font-display font-semibold border-b-2 transition-colors ${activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <ShoppingBag className="w-4 h-4 inline mr-1.5" />Orders
            {pendingOrders > 0 && <span className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrders}</span>}
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold">All Products</h2>
              <Link to="/admin/products/new">
                <Button variant="amber" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
              </Link>
            </div>

            {loadingData ? (
              <div className="text-center py-16 text-muted-foreground">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products yet.</p>
                <Link to="/admin/products/new"><Button variant="amber">Add First Product →</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow">
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {primaryImage(product) ? (
                        <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Image className="w-10 h-10 text-muted-foreground/30" /></div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.is_featured && <span className="bg-accent text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>}
                        {product.is_popular && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.status === "active" ? "bg-primary/20 text-primary" : product.status === "draft" ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm mb-1 truncate">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display font-bold text-primary text-sm">
                          ₦{Number(product.discount_price || product.price).toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs">Stock: {product.stock_quantity}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/admin/products/${product.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {deleteId === product.id && (
                      <div className="border-t border-border p-3 bg-destructive/5 flex items-center justify-between">
                        <span className="text-xs text-destructive font-medium">Delete?</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setDeleteId(null)}>Cancel</Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDelete(product.id)}>Delete</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            <h2 className="text-lg sm:text-xl font-extrabold mb-6">Customer Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>{order.status}</span>
                        </div>
                        <p className="font-display font-bold text-sm mt-1">{order.shipping_name}</p>
                        <p className="text-xs text-muted-foreground">{order.shipping_city} • {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-display font-bold text-primary">₦{Number(order.total_amount).toLocaleString()}</p>
                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {expandedOrder === order.id && (
                      <div className="border-t border-border p-4 bg-secondary/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Delivery Details</p>
                            <p className="text-sm">{order.shipping_name}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_address}, {order.shipping_city}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Update Status</p>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {orderStatuses.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Items</p>
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between py-1.5 text-sm border-b border-border last:border-0">
                            <span>{item.product_name} × {item.quantity}</span>
                            <span className="font-semibold">₦{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-3 font-display font-bold">
                          <span>Total</span>
                          <span className="text-primary">₦{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
