import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Linkedin,
  Check,
  Copy,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LinkedInWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TONES = [
  { value: 'professional', label: 'Profissional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspiracional' },
  { value: 'educational', label: 'Educativo' },
  { value: 'formal', label: 'Formal' },
] as const;

type Step = 1 | 2 | 3;

export function LinkedInWizard({ open, onOpenChange }: LinkedInWizardProps) {
  const [step, setStep] = useState<Step>(1);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [caption, setCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setStep(1);
    setTopic('');
    setTone('professional');
    setCaption('');
    setIsGenerating(false);
    setIsPublishing(false);
    setIsPublished(false);
    setCopied(false);
  };

  const handleClose = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Digite um tema para o post.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-linkedin-caption', {
        body: { topic: topic.trim(), tone, language: 'pt-BR' },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.caption) {
        setCaption(data.caption);
        setStep(2);
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      toast.error('Erro ao gerar legenda. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-linkedin-caption', {
        body: { topic: topic.trim(), tone, language: 'pt-BR' },
      });

      if (error) throw error;
      if (data?.caption) {
        setCaption(data.caption);
        toast.success('Nova legenda gerada!');
      }
    } catch (error) {
      console.error('Error regenerating:', error);
      toast.error('Erro ao regenerar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    if (!caption.trim()) return;
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-linkedin', {
        body: { content: caption.trim() },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setIsPublished(true);
      toast.success(data?.message || 'Post publicado no LinkedIn!');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Erro ao publicar. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  const stepLabels = ['Tema', 'Editar', 'Publicar'];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0077B5] flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-white" />
            </div>
            Publicar no LinkedIn
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium',
                  i + 1 <= step ? 'text-[#0077B5]' : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                    i + 1 < step
                      ? 'bg-[#0077B5] text-white'
                      : i + 1 === step
                      ? 'border-2 border-[#0077B5] text-[#0077B5]'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {label}
              </div>
              {i < stepLabels.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px',
                    i + 1 < step ? 'bg-[#0077B5]' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Topic & Tone */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sobre o que você quer postar?
              </label>
              <Input
                placeholder="Ex: Dicas de produtividade para desenvolvedores"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tom</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full gap-2 bg-[#0077B5] hover:bg-[#005885] text-white"
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar legenda com IA
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Edit Caption */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Legenda gerada
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Regenerar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[200px] text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground text-right">
                {caption.length} caracteres
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-[#0077B5] hover:bg-[#005885] text-white"
                onClick={() => setStep(3)}
                disabled={!caption.trim()}
              >
                Pré-visualizar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Publish */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            {/* LinkedIn-style preview */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-[#0077B5]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Seu Nome</p>
                  <p className="text-xs text-muted-foreground">Agora • 🌐</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                  {caption}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="w-4 h-4" />
                Editar
              </Button>
              {isPublished ? (
                <Button
                  className="flex-1 gap-1.5 bg-emerald-600 text-white cursor-default"
                  disabled
                >
                  <Check className="w-4 h-4" />
                  Publicado!
                </Button>
              ) : (
                <Button
                  className="flex-1 gap-1.5 bg-[#0077B5] hover:bg-[#005885] text-white"
                  onClick={handlePublish}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Linkedin className="w-4 h-4" />
                      Publicar no LinkedIn
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
