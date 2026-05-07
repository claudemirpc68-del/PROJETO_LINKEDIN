-- Tabela para conversas do chat
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nova conversa',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para mensagens das conversas
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para carrosséis salvos
CREATE TABLE public.carousels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    slides JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para posts do calendário
CREATE TABLE public.calendar_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
    category TEXT NOT NULL DEFAULT 'personal-branding',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_posts ENABLE ROW LEVEL SECURITY;

-- Políticas para conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para messages (via conversation ownership)
CREATE POLICY "Users can view own messages" ON public.messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
    );
CREATE POLICY "Users can create own messages" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
    );
CREATE POLICY "Users can delete own messages" ON public.messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
    );

-- Políticas para carousels
CREATE POLICY "Users can view own carousels" ON public.carousels
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own carousels" ON public.carousels
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own carousels" ON public.carousels
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own carousels" ON public.carousels
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para calendar_posts
CREATE POLICY "Users can view own calendar_posts" ON public.calendar_posts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own calendar_posts" ON public.calendar_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar_posts" ON public.calendar_posts
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar_posts" ON public.calendar_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carousels_updated_at
    BEFORE UPDATE ON public.carousels
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_posts_updated_at
    BEFORE UPDATE ON public.calendar_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;