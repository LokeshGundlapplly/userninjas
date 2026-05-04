-- ============================================================
-- Support Tickets + Chat Infrastructure Migration
-- UserNinjas AI Support Assistant
-- ============================================================

-- 1. chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name  TEXT,
  visitor_email TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'escalated', 'closed')),
  escalated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER trg_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- chat_conversations policies (drop first for idempotency)
DROP POLICY IF EXISTS "Anyone can create conversations"   ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update own conversation" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can read conversations"     ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can update all conversations" ON public.chat_conversations;

CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read conversations"
  ON public.chat_conversations FOR SELECT USING (true);

CREATE POLICY "Anyone can update own conversation"
  ON public.chat_conversations FOR UPDATE USING (true);

CREATE POLICY "Admins can view all conversations"
  ON public.chat_conversations FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all conversations"
  ON public.chat_conversations FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 2. chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'agent')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_convo ON public.chat_messages(conversation_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_messages policies
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can read chat messages"   ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all messages"    ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can insert messages"      ON public.chat_messages;

CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read chat messages"
  ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Admins can view all messages"
  ON public.chat_messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert messages"
  ON public.chat_messages FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 3. support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  issue            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority         TEXT NOT NULL DEFAULT 'normal'
                     CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  conversation_id  UUID REFERENCES public.chat_conversations(id) ON DELETE SET NULL,
  assigned_to      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status  ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email   ON public.support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- support_tickets policies
DROP POLICY IF EXISTS "Anyone can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets"       ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets"         ON public.support_tickets;

CREATE POLICY "Anyone can create support tickets"
  ON public.support_tickets FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );
