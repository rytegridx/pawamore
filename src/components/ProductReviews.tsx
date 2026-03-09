import { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    display_name: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewAdded: () => void;
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().trim().max(100, "Title must be less than 100 characters").optional(),
  content: z.string().trim().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters")
});

const ProductReviews = ({ 
  productId, 
  productName, 
  reviews, 
  averageRating, 
  totalReviews,
  onReviewAdded 
}: ProductReviewsProps) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    title: "",
    content: ""
  });

  const hasUserReviewed = user && reviews.some(r => r.user_id === user.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in to write a review", variant: "destructive" });
      return;
    }

    try {
      // Validate input
      const validatedData = reviewSchema.parse(form);
      
      setSubmitting(true);

      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating: validatedData.rating,
        title: validatedData.title || null,
        content: validatedData.content,
        is_approved: false // Reviews need admin approval
      });

      if (error) throw error;

      toast({ 
        title: "Review submitted! ✨", 
        description: "Your review will be published after admin approval." 
      });
      
      setForm({ rating: 0, title: "", content: "" });
      setIsDialogOpen(false);
      onReviewAdded();
    } catch (error: any) {
      console.error("Review submission error:", error);
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Validation Error", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Failed to submit review", 
          description: error.message, 
          variant: "destructive" 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false, size = "w-5 h-5" }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: string;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={readonly ? undefined : () => onRatingChange?.(star)}
            disabled={readonly}
            className={`${size} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all`}
          >
            <Star
              className={`w-full h-full ${
                star <= rating 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">Customer Reviews</h3>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} readonly size="w-5 h-5" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet</p>
          )}
        </div>

        {user && !hasUserReviewed && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Star className="w-4 h-4" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Write a Review for {productName}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  <StarRating 
                    rating={form.rating} 
                    onRatingChange={(rating) => setForm({ ...form, rating })}
                    size="w-8 h-8"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review Title (Optional)</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Sum up your experience..."
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review *</label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {form.content.length}/1000 characters
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={submitting || form.rating === 0} className="flex-1">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating rating={review.rating} readonly size="w-4 h-4" />
                      {!review.is_approved && (
                        <Badge variant="secondary" className="text-xs">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <CardTitle className="text-base">{review.title}</CardTitle>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{review.profiles?.display_name || "Anonymous"}</p>
                    <p>{formatDate(review.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              {review.content && (
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed">{review.content}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductReviews;