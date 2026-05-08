import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Carousel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Layers, 
  Loader2, 
  Plus, 
  Trash2, 
  GripVertical,
  Copy,
  Check,
  Sparkles,
  Save,
  FolderOpen
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateUUID } from '@/utils/uuid';

const CAROUSEL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-carousel`;

interface Slide {
  id: string;
  title: string;
  content: string;
}

interface SavedCarousel {
  id: string;
  topic: string;
  slides: Slide[];
  createdAt: Date;
}

export default function CarouselPage() {
  const [topic, setTopic] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localCarousels, setLocalCarousels] = useLocalStorage<Carousel[]>('linkedin-carousels', []);
  const [savedDialogOpen, setSavedDialogOpen] = useState(false);
  const { toast } = useToast();

  const savedCarousels: SavedCarousel[] = localCarousels.map(c => ({
    id: c.id,
    topic: c.title,
    slides: c.slides.map(s => ({ id: s.id, title: s.title, content: s.content })),
    createdAt: new Date(c.createdAt),
  }));

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        sonnerToast.error('Faça login para gerar carrosséis.');
        return;
      }
      const response = await fetch(CAROUSEL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar carrossel');
      }

      const result = await response.json();
      setSlides(result.slides.map((s: { title: string; content: string }) => ({
        id: generateUUID(),
        title: s.title,
        content: s.content
      })));
    } catch (error) {
      console.error('Error generating carousel:', error);
      sonnerToast.error(error instanceof Error ? error.message : 'Erro ao gerar carrossel');
    } finally {
      setIsLoading(false);
    }
  };

  const addSlide = () => {
    setSlides([...slides, {
      id: generateUUID(),
      title: `Slide ${slides.length + 1}`,
      content: ''
    }]);
  };

  const removeSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const updateSlide = (id: string, field: 'title' | 'content', value: string) => {
    setSlides(slides.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const copyAllContent = async () => {
    const content = slides.map((s, i) => 
      `--- SLIDE ${i + 1}: ${s.title} ---\n${s.content}`
    ).join('\n\n');
    
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast({
      title: 'Copiado!',
      description: 'Conteúdo do carrossel copiado para a área de transferência.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const saveCarousel = () => {
    if (slides.length === 0) return;
    
    const newCarousel: Carousel = {
      id: generateUUID(),
      title: topic || 'Carrossel sem título',
      slides: slides.map((s, i) => ({
        id: s.id,
        order: i,
        title: s.title,
        content: s.content,
        type: i === 0 ? 'cover' : i === slides.length - 1 ? 'cta' : 'content'
      })),
      createdAt: new Date()
    };
    
    setLocalCarousels(prev => [newCarousel, ...prev]);
    toast({
      title: 'Salvo!',
      description: 'Carrossel salvo localmente.',
    });
  };

  const loadCarousel = (carousel: SavedCarousel) => {
    setTopic(carousel.topic);
    setSlides(carousel.slides);
    setSavedDialogOpen(false);
  };

  const deleteCarousel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalCarousels(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Excluído!',
      description: 'Carrossel removido.',
    });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerador de Carrossel</h1>
          <p className="text-muted-foreground">
            Crie estruturas de carrossel otimizadas para alto engajamento no LinkedIn.
          </p>
        </div>

        {/* Topic Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Tema do Carrossel</CardTitle>
            <CardDescription>
              Digite o tema e a IA vai gerar uma estrutura de slides para você
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: produtividade, liderança, marketing digital..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <Button onClick={handleGenerate} disabled={!topic.trim() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Estrutura
                  </>
                )}
              </Button>
              <Dialog open={savedDialogOpen} onOpenChange={setSavedDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Salvos
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Carrosséis Salvos</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[400px]">
                    {savedCarousels.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum carrossel salvo ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {savedCarousels.map((carousel) => (
                          <div
                            key={carousel.id}
                            onClick={() => loadCarousel(carousel)}
                            className="group flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent/50"
                          >
                            <div>
                              <p className="font-medium">{carousel.topic}</p>
                              <p className="text-xs text-muted-foreground">
                                {carousel.slides.length} slides • {format(carousel.createdAt, "dd 'de' MMM", { locale: ptBR })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => deleteCarousel(carousel.id, e)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Slides Editor */}
        {slides.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Slides ({slides.length})
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addSlide}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
                <Button variant="outline" size="sm" onClick={copyAllContent}>
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar Tudo
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={saveCarousel}>
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slides.map((slide, index) => (
                <Card key={slide.id} className="relative group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          SLIDE {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSlide(slide.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      className="text-sm font-medium"
                      placeholder="Título do slide"
                    />
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={slide.content}
                      onChange={(e) => updateSlide(slide.id, 'content', e.target.value)}
                      placeholder="Conteúdo do slide..."
                      className="min-h-[120px] text-sm resize-none"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tips */}
            <Card className="bg-accent/30 border-accent">
              <CardContent className="py-4">
                <h3 className="font-medium text-foreground mb-2">💡 Dicas para carrosséis de sucesso:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>→ Capa com título impactante e design limpo</li>
                  <li>→ Uma ideia por slide, texto curto e direto</li>
                  <li>→ Use números, emojis e ícones para escaneabilidade</li>
                  <li>→ Último slide com CTA claro (salvar, comentar, seguir)</li>
                  <li>→ Ideal: 5-10 slides no total</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {slides.length === 0 && !isLoading && (
          <Card className="flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center py-12">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">Nenhum carrossel ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Digite um tema acima e clique em "Gerar Estrutura" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
