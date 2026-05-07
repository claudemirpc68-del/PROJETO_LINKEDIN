import { useState, useRef, useMemo } from 'react';
import { Send, Loader2, Sparkles, Settings, Plus, MessageSquare, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Message, Conversation } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChatMessage } from './ChatMessage';
import { ChatSuggestions } from './ChatSuggestions';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-post`;

export function ChatInterface() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('linkedin-conversations', []);
  const [webhookUrl, setWebhookUrl] = useLocalStorage<string>('linkedin-webhook-url', '');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempWebhookUrl, setTempWebhookUrl] = useState(webhookUrl);
  const [showHistory, setShowHistory] = useState(false);
  const [visibleConversations, setVisibleConversations] = useState(10);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const CONVERSATIONS_PER_PAGE = 10;

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // Paginated conversations for sidebar
  const paginatedConversations = useMemo(() => {
    return conversations.slice(0, visibleConversations);
  }, [conversations, visibleConversations]);

  const hasMoreConversations = conversations.length > visibleConversations;

  const loadMoreConversations = () => {
    setVisibleConversations(prev => prev + CONVERSATIONS_PER_PAGE);
  };

  // Virtualized list handles scrolling automatically

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  };

  const updateConversation = (convId: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, ...updates, updatedAt: new Date() } : c))
    );
  };

  const addMessage = (convId: string, message: Message) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === convId
          ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
          : c
      )
    );
  };

  const updateAssistantMessage = (convId: string, content: string, messageId?: string) => {
    let msgId = messageId;

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg?.role === 'assistant') {
          msgs[msgs.length - 1] = { ...lastMsg, content };
          msgId = lastMsg.id;
        } else {
          const newId = crypto.randomUUID();
          msgs.push({
            id: newId,
            role: 'assistant',
            content,
            timestamp: new Date(),
          });
          msgId = newId;
        }
        return { ...c, messages: msgs, updatedAt: new Date() };
      })
    );

    return msgId;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    let convId = currentConversationId;
    if (!convId) {
      convId = createNewConversation();
    }

    // Update title if first message
    const conv = conversations.find(c => c.id === convId);
    if (conv && conv.messages.length === 0) {
      updateConversation(convId, { title: input.trim().slice(0, 50) });
    }

    // Add user message
    addMessage(convId, userMessage);

    setInput('');
    setIsLoading(true);

    try {
      // Get current conversation history for context
      const currentConv = conversations.find(c => c.id === convId);
      const messageHistory = currentConv?.messages.map(m => ({
        role: m.role,
        content: m.content,
      })) || [];

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Faça login para gerar posts.');
        setIsLoading(false);
        return;
      }
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          messages: messageHistory,
          webhookUrl: webhookUrl.trim(),
          conversationId: convId,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate post');
      }

      if (!resp.body) {
        throw new Error('No response body');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let streamDone = false;
      let assistantMsgId: string | undefined;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              assistantMsgId = updateAssistantMessage(convId!, assistantContent, assistantMsgId);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              assistantMsgId = updateAssistantMessage(convId!, assistantContent, assistantMsgId);
            }
          } catch { /* ignore */ }
        }
      }

      if (webhookUrl.trim()) {
        toast.success('Post gerado com IA!');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar post';
      
      // Add error message inline in chat
      const errorAssistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠️ **Erro ao gerar resposta**\n\n${errorMessage}\n\nPor favor, tente novamente.`,
        timestamp: new Date(),
      };
      addMessage(convId!, errorAssistantMessage);
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveWebhook = () => {
    setWebhookUrl(tempWebhookUrl);
    setSettingsOpen(false);
    toast.success('Configurações salvas');
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
    toast.success('Conversa excluída');
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setShowHistory(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setShowHistory(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {/* History Sidebar */}
      <div className={`${showHistory ? 'flex' : 'hidden'} md:flex w-64 flex-col border-r border-border bg-card/50`}>
        <div className="p-4 border-b border-border">
          <Button onClick={handleNewChat} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-medium text-foreground mb-1">
                  Nenhuma conversa
                </h4>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Suas conversas aparecerão aqui
                </p>
                <Button 
                  onClick={handleNewChat} 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Começar agora
                </Button>
              </div>
            ) : (
              <>
                {paginatedConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`group flex items-center justify-between gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentConversationId === conv.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(conv.updatedAt), "dd 'de' MMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {hasMoreConversations && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={loadMoreConversations}
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Carregar mais ({conversations.length - visibleConversations} restantes)
                  </Button>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top bar */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowHistory(!showHistory)}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => {
                setTempWebhookUrl(webhookUrl);
              }}>
                <Settings className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook de Notificações (n8n)</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://seu-webhook.com/..."
                    value={tempWebhookUrl}
                    onChange={(e) => setTempWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Disparado a cada mensagem enviada (opcional)
                  </p>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 A publicação no LinkedIn agora usa a API direta. Configure seu token no painel de administração.
                  </p>
                </div>
                
                <Button onClick={handleSaveWebhook} className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages area */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-16 h-16 rounded-2xl linkedin-gradient flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Crie posts virais para o LinkedIn
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Me conte sobre o que você quer postar e eu vou te ajudar a criar conteúdo 
              que gera engajamento real.
            </p>
            <ChatSuggestions onSelect={handleSuggestionClick} />
          </div>
        ) : (
          <VirtualizedMessageList
            messages={messages}
            isLoading={isLoading}
          />
        )}

        {/* Input area */}
        <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Descreva sua ideia de post ou peça ajuda com algo..."
                className="min-h-[56px] max-h-[200px] pr-14 resize-none bg-background"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-2 bottom-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
