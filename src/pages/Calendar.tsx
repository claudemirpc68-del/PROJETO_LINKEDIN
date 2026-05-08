import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCalendarPosts } from '@/hooks/useCalendarPosts';
import { CalendarPost, TemplateCategory } from '@/types';
import { getCategoryLabel, getCategoryColor } from '@/data/templates';
import { useToast } from '@/hooks/use-toast';
import { LinkedInPublishButton } from '@/components/linkedin/LinkedInPublishButton';
import { 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  Edit2,
  Loader2,
  Cloud,
  CloudOff,
  Download
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const categories: TemplateCategory[] = [
  'historia-pessoal',
  'dica-pratica',
  'case-sucesso',
  'ia-tecnologia',
  'esg-cultura',
  'tendencias'
];

export default function CalendarPage() {
  const { posts, isLoading, isAuthenticated, addPost, updatePost, deletePost } = useCalendarPosts();
  // webhookUrl removed - now using direct LinkedIn API
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'dica-pratica' as TemplateCategory,
    status: 'rascunho' as CalendarPost['status'],
    time: '09:00'
  });
  const { toast } = useToast();

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getPostsForDay = (day: Date) => {
    return posts.filter(post =>
      post.scheduledDate && isSameDay(new Date(post.scheduledDate), day)
    );
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      category: 'dica-pratica',
      status: 'rascunho',
      time: format(new Date(), 'HH:mm')
    });
    setIsDialogOpen(true);
  };

  const handleEditPost = (post: CalendarPost) => {
    setEditingPost(post);
    setSelectedDate(new Date(post.scheduledDate));
    setFormData({
      title: post.title,
      content: post.content || '',
      category: post.category,
      status: post.status,
      time: format(new Date(post.scheduledDate), 'HH:mm')
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !selectedDate) return;

    setIsSaving(true);

    try {
      const [hours, minutes] = formData.time.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      if (editingPost) {
        const result = await updatePost(editingPost.id, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          status: formData.status,
          scheduledDate: scheduledDateTime
        });

        if (result.success) {
          toast({ title: 'Atualizado!', description: 'Post atualizado com sucesso.' });
        } else {
          throw result.error;
        }
      } else {
        const result = await addPost({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          status: formData.status,
          scheduledDate: scheduledDateTime
        });

        if (result.success) {
          toast({ title: 'Salvo!', description: 'Post adicionado ao calendário.' });
        } else {
          throw result.error;
        }
      }

      setIsDialogOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o post. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);

    try {
      const result = await deletePost(id);

      if (result.success) {
        toast({ title: 'Excluído!', description: 'Post removido do calendário.' });
        setIsDialogOpen(false);
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o post. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: CalendarPost['status']) => {
    switch (status) {
      case 'publicado': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'agendado': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const exportAsJSON = () => {
    const dataToExport = posts.map(post => ({
      title: post.title,
      content: post.content,
      category: post.category,
      status: post.status,
      scheduledDate: format(new Date(post.scheduledDate), 'yyyy-MM-dd HH:mm'),
      createdAt: post.createdAt ? format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm:ss') : null
    }));
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posts-linkedin-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Exportado!', description: `${posts.length} post(s) exportado(s) como JSON.` });
  };

  const exportAsCSV = () => {
    const headers = ['Título', 'Conteúdo', 'Categoria', 'Status', 'Data Agendada', 'Data Criação'];
    const rows = posts.map(post => [
      `"${(post.title || '').replace(/"/g, '""')}"`,
      `"${(post.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      post.category,
      post.status,
      format(new Date(post.scheduledDate), 'yyyy-MM-dd HH:mm'),
      post.createdAt ? format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posts-linkedin-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Exportado!', description: `${posts.length} post(s) exportado(s) como CSV.` });
  };

  // Get first day of month's day of week (0 = Sunday)
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-3 md:p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:items-center sm:flex-row justify-between mb-2 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendário de Conteúdo</h1>
            <div className="flex flex-wrap items-center gap-3">
              {posts.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportAsJSON}>
                      Exportar como JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportAsCSV}>
                      Exportar como CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className="text-sm">
                {isAuthenticated ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Cloud className="w-4 h-4" />
                    Sincronizado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <CloudOff className="w-4 h-4" />
                    Local
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Organize e planeje seus posts do LinkedIn com antecedência.
            {!isAuthenticated && (
              <span className="block text-xs mt-1">
                💡 Faça login para sincronizar seus posts entre dispositivos.
              </span>
            )}
          </p>
        </div>

        {/* Calendar Header */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first day of month */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] bg-muted/30 rounded-lg" />
              ))}

              {days.map(day => {
                const dayPosts = getPostsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                      isCurrentDay ? 'border-primary bg-accent/30' : 'border-border'
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentDay ? 'text-primary' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 2).map(post => (
                        <div
                          key={post.id}
                          className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPost(post);
                          }}
                        >
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayPosts.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Posts */}
        {posts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Próximos Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {posts
                  .filter(p => p.scheduledDate)
                  .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
                  .slice(0, 5)
                  .map(post => (
                    <div 
                      key={post.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer gap-3"
                      onClick={() => handleEditPost(post)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="text-center flex-shrink-0">
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(post.scheduledDate), 'MMM', { locale: ptBR })}
                          </div>
                          <div className="text-lg font-bold text-foreground">
                            {format(new Date(post.scheduledDate), 'd')}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground truncate">{post.title}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className={`${getCategoryColor(post.category)} text-xs`}>
                              {getCategoryLabel(post.category)}
                            </Badge>
                            <Badge variant="secondary" className={`${getStatusColor(post.status)} text-xs`}>
                              {post.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {post.content && (
                          <LinkedInPublishButton 
                            content={post.content} 
                          />
                        )}
                        <Button variant="ghost" size="icon">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Post Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Editar Post' : 'Novo Post'}
              </DialogTitle>
              <DialogDescription>
                {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do post..."
                  className="mt-1"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Conteúdo</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Rascunho do post..."
                  className="mt-1 min-h-[150px]"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as TemplateCategory })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryLabel(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CalendarPost['status'] })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Horário de Postagem</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O post será publicado automaticamente no LinkedIn neste horário se o status estiver como "Agendado".
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              {editingPost && (
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(editingPost.id)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
                  Excluir
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                {editingPost && editingPost.content && (
                  <LinkedInPublishButton 
                    content={editingPost.content} 
                    variant="full"
                    size="default"
                  />
                )}
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.title.trim() || isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
