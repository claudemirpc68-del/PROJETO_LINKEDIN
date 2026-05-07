import { useNavigate } from 'react-router-dom';
import { FileEdit, ArrowRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarPosts } from '@/hooks/useCalendarPosts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DraftPostsList() {
  const navigate = useNavigate();
  const { posts: calendarPosts, isLoading } = useCalendarPosts();

  const draftPosts = calendarPosts
    .filter(p => p.status === 'rascunho')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Rascunhos</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => navigate('/calendar')}
          >
            Calendário
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : draftPosts.length === 0 ? (
          <div className="text-center py-8">
            <FileEdit className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum rascunho salvo</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/calendar')}
            >
              Criar rascunho
            </Button>
          </div>
        ) : (
          draftPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => navigate('/calendar')}
            >
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <FileEdit className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate text-foreground">
                  {post.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                </p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                Rascunho
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
