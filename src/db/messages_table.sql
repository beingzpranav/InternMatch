-- Create messages table for communication between admins, students, and companies
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_to VARCHAR NOT NULL CHECK (related_to IN ('application', 'internship', 'general')),
  related_id UUID, -- ID of the related item (application, internship, etc.)
  subject VARCHAR(255),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own messages
CREATE POLICY "Users can insert messages they create" 
ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);

-- Allow users to view messages they sent or received
CREATE POLICY "Users can view their own messages" 
ON public.messages FOR SELECT 
TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to update read status of messages they received
CREATE POLICY "Recipients can mark messages as read" 
ON public.messages FOR UPDATE 
TO authenticated 
USING (auth.uid() = recipient_id)
WITH CHECK (
  auth.uid() = recipient_id AND
  is_read IS TRUE AND
  OLD.is_read IS FALSE AND
  OLD.created_at = created_at AND
  OLD.message_text = message_text AND
  OLD.sender_id = sender_id AND
  OLD.recipient_id = recipient_id
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_related_id_idx ON public.messages(related_id);

-- Function to mark message as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET is_read = TRUE
  WHERE id = message_id
  AND recipient_id = auth.uid();
  
  RETURN FOUND;
END;
$$; 