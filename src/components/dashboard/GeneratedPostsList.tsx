import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Conversation } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface GeneratedPost {
  id: string;
  content: string;
  createdAt: string;
  conversationTitle: string;
}

export function GeneratedPostsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations] = useLocalStorage<Conversation[]>('linkedin-conversations', []);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      if (user) {
        // Load from database
        const { data, error } = await supabase
          .from('messages')
          .select('id, content, created_at, conversation_id, role')
          .eq('role', 'assistant')
          .order('created_at', { ascending: false })
          .limit(8);

        if (!error && data) {
          // Get conversation titles
          const convIds = [...new Set(data.map(m => m.conversation_id))];
          const { data: convs } = await supabase
            .from('conversations')
            .select('id, title')
            .in('id', convIds);

          const titleMap = new Map(convs?.map(c => [c.id, c.title]) ?? []);

          setPosts(data.map(m => ({
            id: m.id,
            content: m.content,
            createdAt: m.created_at,
            conversationTitle: titleMap.get(m.conversation_id) || 'Conversa',
          })));
        }
      } else {
        // Load from localStorage
        const allPosts: GeneratedPost[] = [];
        for (const conv of conversations) {
          for (const msg of conv.messages) {
            if (msg.role === 'assistant') {
              allPosts.push({
                id: msg.id,
                content: msg.content,
                createdAt: new Date(msg.timestamp).toISOString(),
                conversationTitle: conv.title,
              });
            }
          }
        }
        allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(allPosts.slice(0, 8));
      }
      setLoading(false);
    }
    loadPosts();
  }, [user, conversations]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Post copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Posts Gerados pela IA</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigate('/chat')}
          >
            Ver todos
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-3 pr-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum post gerado ainda</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/chat')}
                >
                  Gerar primeiro post
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="group p-4 rounded-lg hover:bg-accent/50 transition-colors border border-border"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs text-muted-foreground">
                      {post.conversationTitle} · {format(new Date(post.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => handleCopy(post.content, post.id)}
                    >
                      {copiedId === post.id ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
