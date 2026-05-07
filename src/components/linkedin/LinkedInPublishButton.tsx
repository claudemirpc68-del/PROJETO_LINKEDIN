import { useState } from 'react';
import { Linkedin, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInPublishButtonProps {
  content: string;
  variant?: 'icon' | 'full';
  size?: 'sm' | 'default';
}

export function LinkedInPublishButton({ 
  content, 
  variant = 'icon',
  size = 'sm'
}: LinkedInPublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!content.trim()) {
      toast.error('Conteúdo vazio');
      return;
    }

    setIsPublishing(true);

    try {
      const { data, error } = await supabase.functions.invoke('publish-linkedin', {
        body: { content: content.trim() },
      });

      if (error) {
        console.error('Error publishing to LinkedIn:', error);
        toast.error(error.message || 'Erro ao publicar no LinkedIn');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setIsPublished(true);
      toast.success(data?.message || 'Post publicado no LinkedIn!');
      
      // Reset after 3 seconds
      setTimeout(() => setIsPublished(false), 3000);
    } catch (error) {
      console.error('Error publishing to LinkedIn:', error);
      toast.error('Erro ao publicar. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (variant === 'full') {
    return (
      <Button
        onClick={handlePublish}
        disabled={isPublishing}
        size={size}
        className="bg-[#0077B5] hover:bg-[#005885] text-white"
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publicando...
          </>
        ) : isPublished ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Publicado!
          </>
        ) : (
          <>
            <Linkedin className="w-4 h-4 mr-2" />
            Publicar no LinkedIn
          </>
        )}
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            ) : isPublished ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPublished ? 'Publicado!' : 'Publicar no LinkedIn'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
