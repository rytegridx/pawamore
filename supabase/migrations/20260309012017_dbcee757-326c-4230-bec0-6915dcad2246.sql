-- Create support tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NULL,
    guest_email TEXT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'medium',
    category TEXT NOT NULL DEFAULT 'general',
    assigned_to UUID REFERENCES auth.users(id) NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT valid_user CHECK ((user_id IS NOT NULL) OR (guest_email IS NOT NULL))
);

-- Create chat conversations table  
CREATE TABLE public.chat_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NULL,
    guest_id TEXT NULL,
    title TEXT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_participant CHECK ((user_id IS NOT NULL) OR (guest_id IS NOT NULL))
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create FAQ items table
CREATE TABLE public.faq_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Support tickets policies
CREATE POLICY "Users can create support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_email IS NOT NULL));

CREATE POLICY "Users can view own support tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all support tickets"
ON public.support_tickets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat conversations policies
CREATE POLICY "Users can manage own chat conversations"
ON public.chat_conversations
FOR ALL
USING (auth.uid() = user_id OR (auth.uid() IS NULL AND guest_id IS NOT NULL));

CREATE POLICY "Admins can view all chat conversations"
ON public.chat_conversations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chat messages policies  
CREATE POLICY "Users can view messages in own conversations"
ON public.chat_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_conversations
        WHERE id = conversation_id 
        AND (user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL))
    )
);

CREATE POLICY "Users can create messages in own conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_conversations
        WHERE id = conversation_id 
        AND (user_id = auth.uid() OR (auth.uid() IS NULL AND guest_id IS NOT NULL))
    )
);

CREATE POLICY "Admins can manage all chat messages"
ON public.chat_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- FAQ policies
CREATE POLICY "Published FAQs viewable by everyone"
ON public.faq_items
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all FAQs"
ON public.faq_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at
    BEFORE UPDATE ON public.faq_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default FAQ items
INSERT INTO public.faq_items (question, answer, category, sort_order) VALUES
('How do I place an order?', 'You can place an order by browsing our products and adding items to your cart. Once ready, click the cart icon and proceed to checkout where you can enter your shipping details and payment information.', 'orders', 1),
('What payment methods do you accept?', 'We accept multiple payment methods including Flutterwave for card payments, and Pay on Delivery for cash payments when your order arrives.', 'payments', 2),
('How long does delivery take?', 'Delivery typically takes 3-7 business days depending on your location in Nigeria. We will provide tracking information once your order ships.', 'shipping', 3),
('Can I return a product?', 'Yes, we accept returns within 14 days of delivery. Products must be in original condition and packaging. Contact our support team to initiate a return.', 'returns', 4),
('Do you offer installation services?', 'Yes, we provide professional installation services for solar systems and power solutions. You can book a free consultation to discuss your installation needs.', 'services', 5);