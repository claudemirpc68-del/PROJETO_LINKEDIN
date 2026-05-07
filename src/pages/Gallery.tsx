import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Trash2, Copy, ImageOff, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const STYLE_LABELS: Record<string, { label: string; icon: string }> = {
  minimalista: { label: 'Minimalista', icon: '◯' },
  corporativo: { label: 'Corporativo', icon: '◼' },
  colorido: { label: 'Colorido', icon: '◆' },
  tecnologia: { label: 'Tecnologia', icon: '⬡' },
  natureza: { label: 'Natureza', icon: '❋' },
};

interface GeneratedImage {
  id: string;
  image_url: string;
  storage_path: string;
  style: string;
  description: string | null;
  post_content: string | null;
  created_at: string;
}

export default function Gallery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ['generated-images', selectedFilter],
    queryFn: async () => {
      let query = supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedFilter) {
        query = query.eq('style', selectedFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Generate fresh signed URLs (bucket is private)
      const withSigned = await Promise.all(
        (data as GeneratedImage[]).map(async (img) => {
          const { data: signed } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(img.storage_path, 60 * 60);
          return { ...img, image_url: signed?.signedUrl ?? img.image_url };
        })
      );
      return withSigned;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (image: GeneratedImage) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('generated-images')
        .remove([image.storage_path]);
      
      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-images'] });
      toast.success('Imagem excluída!');
    },
    onError: () => {
      toast.error('Erro ao excluir imagem');
    },
  });

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Download iniciado!');
    } catch {
      toast.error('Erro ao baixar imagem');
    }
  };

  const handleCopyUrl = async (imageUrl: string) => {
    await navigator.clipboard.writeText(imageUrl);
    toast.success('URL copiada!');
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <ImageOff className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Faça login para ver sua galeria</h2>
            <p className="text-muted-foreground">Suas imagens geradas serão salvas aqui.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Galeria de Imagens</h1>
          <p className="text-muted-foreground mt-1">
            Suas imagens geradas por IA para reutilizar nos posts
          </p>
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter(null)}
          >
            Todos
          </Button>
          {Object.entries(STYLE_LABELS).map(([id, { label, icon }]) => (
            <Button
              key={id}
              variant={selectedFilter === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(id)}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !images?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <ImageOff className="w-16 h-16 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">Nenhuma imagem salva</h3>
            <p className="text-muted-foreground max-w-md">
              Gere um post no chat e clique no ícone de imagem para criar e salvar imagens na galeria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => {
              const styleInfo = STYLE_LABELS[image.style] || { label: image.style, icon: '•' };
              return (
                <div
                  key={image.id}
                  className="group relative rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.description || 'Imagem gerada'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleDownload(image.image_url)}
                        title="Baixar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleCopyUrl(image.image_url)}
                        title="Copiar URL"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-9 w-9"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A imagem será removida permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(image)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {styleInfo.icon} {styleInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(image.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {image.post_content && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.post_content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
