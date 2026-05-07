import { useState } from 'react';
import {
  Copy, Check, Image, Loader2, Download, Save,
  Calendar, Linkedin, ChevronDown, ChevronUp,
  Sparkles, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendarPosts } from '@/hooks/useCalendarPosts';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const IMAGE_STYLES = [
  { id: 'minimalista', label: 'Minimalista', icon: '◯' },
  { id: 'corporativo', label: 'Corporativo', icon: '◼' },
  { id: 'colorido', label: 'Colorido', icon: '◆' },
  { id: 'tecnologia', label: 'Tecnologia', icon: '⬡' },
  { id: 'natureza', label: 'Natureza', icon: '❋' },
] as const;

type FlowStep = 'idle' | 'image' | 'schedule' | 'publish';

interface PostActionBarProps {
  content: string;
}

export function PostActionBar({ content }: PostActionBarProps) {
  const { user } = useAuth();
  const { addPost } = useCalendarPosts();

  // State
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState<FlowStep>('idle');

  // Image state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('corporativo');

  // Schedule state
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [postTitle, setPostTitle] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  // Publish state
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Completed steps tracking
  const [completedSteps, setCompletedSteps] = useState<Set<FlowStep>>(new Set());

  const markCompleted = (step: FlowStep) => {
    setCompletedSteps(prev => new Set(prev).add(step));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Post copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateImage = async (style: string) => {
    setIsGeneratingImage(true);
    setSelectedStyle(style);
    setImageSaved(false);
    setCurrentStep('image');
    setIsExpanded(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { postContent: content, style },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Imagem gerada com sucesso!');
      } else {
        throw new Error('Nenhuma imagem retornada');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Erro ao gerar imagem. Tente novamente.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage || !user) {
      toast.error('Faça login para salvar imagens na galeria.');
      return;
    }
    setIsSavingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-image', {
        body: {
          imageBase64: generatedImage,
          style: selectedStyle,
          description: 'Imagem gerada para post',
          postContent: content,
        },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        setImageSaved(true);
        markCompleted('image');
        toast.success('Imagem salva na galeria!');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Erro ao salvar imagem na galeria.');
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `linkedin-post-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download iniciado!');
  };

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error('Selecione uma data para agendar.');
      return;
    }
    setIsScheduling(true);
    try {
      const title = postTitle.trim() || content.slice(0, 50) + '...';
      const result = await addPost({
        title,
        content,
        category: 'dica-pratica',
        scheduledDate,
        status: 'agendado',
      });
      if (result.success) {
        setIsScheduled(true);
        markCompleted('schedule');
        toast.success(`Post agendado para ${format(scheduledDate, "dd 'de' MMMM", { locale: ptBR })}!`);
      } else {
        throw new Error('Erro ao agendar');
      }
    } catch (error) {
      console.error('Error scheduling:', error);
      toast.error('Erro ao agendar post.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-linkedin', {
        body: { content: content.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setIsPublished(true);
      markCompleted('publish');
      toast.success(data?.message || 'Post publicado no LinkedIn!');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Erro ao publicar. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  const stepCount = completedSteps.size;

  return (
    <div className="mt-4 border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
      {/* Quick Action Bar - Always visible */}
      <div className="flex items-center gap-1 p-2 flex-wrap">
        {/* Copy */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>

        {/* Generate Image */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                completedSteps.has('image') && "text-emerald-600"
              )}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : completedSteps.has('image') ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Image className="w-3.5 h-3.5" />
              )}
              Imagem
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {IMAGE_STYLES.map((style) => (
              <DropdownMenuItem
                key={style.id}
                onClick={() => handleGenerateImage(style.id)}
                className="cursor-pointer"
              >
                <span className="mr-2">{style.icon}</span>
                {style.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Schedule */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            completedSteps.has('schedule') && "text-emerald-600"
          )}
          onClick={() => {
            setCurrentStep('schedule');
            setIsExpanded(true);
          }}
          disabled={isScheduled}
        >
          {isScheduled ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          {isScheduled ? 'Agendado' : 'Agendar'}
        </Button>

        {/* Publish */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs",
            completedSteps.has('publish') ? "text-emerald-600" : "text-[#0077B5]"
          )}
          onClick={handlePublish}
          disabled={isPublishing || isPublished}
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPublished ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Linkedin className="w-3.5 h-3.5" />
          )}
          {isPublished ? 'Publicado' : 'LinkedIn'}
        </Button>

        {/* Expand/collapse */}
        <div className="ml-auto flex items-center gap-2">
          {stepCount > 0 && (
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {stepCount}/3
            </span>
          )}
          {(generatedImage || currentStep !== 'idle') && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="border-t border-border p-3 space-y-3 animate-fade-in">
          {/* Image Section */}
          {(currentStep === 'image' || generatedImage) && (
            <div className="space-y-2">
              {isGeneratingImage && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando imagem...
                </div>
              )}
              {generatedImage && !isGeneratingImage && (
                <>
                  <img
                    src={generatedImage}
                    alt="Imagem gerada para o post"
                    className="rounded-lg w-full max-w-sm border border-border"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleDownloadImage}>
                      <Download className="w-3.5 h-3.5" />
                      Baixar
                    </Button>
                    <Button
                      variant={imageSaved ? 'outline' : 'secondary'}
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={handleSaveToGallery}
                      disabled={isSavingImage || imageSaved}
                    >
                      {isSavingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : imageSaved ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {imageSaved ? 'Salva' : 'Salvar na galeria'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Schedule Section */}
          {currentStep === 'schedule' && !isScheduled && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Agendar post</p>
              <Input
                placeholder="Título do post (opcional)"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="text-sm"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {scheduledDate
                      ? format(scheduledDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                className="w-full gap-1.5 text-xs linkedin-gradient text-white"
                onClick={handleSchedule}
                disabled={!scheduledDate || isScheduling}
              >
                {isScheduling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                Confirmar agendamento
              </Button>
            </div>
          )}

          {/* Success Summary */}
          {isScheduled && currentStep === 'schedule' && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 py-1">
              <CheckCircle2 className="w-4 h-4" />
              Agendado para {scheduledDate && format(scheduledDate, "dd/MM/yyyy", { locale: ptBR })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
