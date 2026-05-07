import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Linkedin,
  Check,
  Copy,
  RefreshCw,
  Send,
  ThumbsUp,
  MessageCircle,
  Repeat2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TONES = [
  { value: 'professional', label: 'Profissional', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '😊' },
  { value: 'inspirational', label: 'Inspiracional', emoji: '✨' },
  { value: 'educational', label: 'Educativo', emoji: '📚' },
  { value: 'formal', label: 'Formal', emoji: '🎩' },
] as const;

type Step = 1 | 2 | 3;

const stepLabels = ['Tema & Tom', 'Editar Legenda', 'Pré-visualizar & Publicar'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function LinkedInPage() {
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
      if (data?.error) { toast.error(data.error); return; }
      if (data?.caption) { setCaption(data.caption); setStep(2); }
    } catch {
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
      if (data?.caption) { setCaption(data.caption); toast.success('Nova legenda gerada!'); }
    } catch {
      toast.error('Erro ao regenerar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success('Copiado para a área de transferência!');
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
      if (data?.error) { toast.error(data.error); return; }
      setIsPublished(true);
      toast.success(data?.message || 'Post publicado no LinkedIn!');
    } catch {
      toast.error('Erro ao publicar. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-[#0077B5] flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Publicar no LinkedIn</h1>
              <p className="text-sm text-muted-foreground">
                Crie, edite e publique posts diretamente no LinkedIn
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stepper */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={cn('flex items-center gap-2 text-sm font-medium whitespace-nowrap', i + 1 <= step ? 'text-[#0077B5]' : 'text-muted-foreground')}>
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                    i + 1 < step ? 'bg-[#0077B5] text-white'
                      : i + 1 === step ? 'border-2 border-[#0077B5] text-[#0077B5]'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground'
                  )}>
                    {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={cn('flex-1 h-px', i + 1 < step ? 'bg-[#0077B5]' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" key={step}>
          {/* Step 1: Topic & Tone */}
          {step === 1 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Sobre o que você quer postar?
                    </label>
                    <Input
                      placeholder="Ex: Dicas de produtividade para desenvolvedores"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Descreva o tema principal do seu post. Seja específico para melhores resultados.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tom de voz</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {TONES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTone(t.value)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
                            tone === t.value
                              ? 'border-[#0077B5] bg-[#0077B5]/10 text-[#0077B5]'
                              : 'border-border text-muted-foreground hover:border-[#0077B5]/40 hover:text-foreground'
                          )}
                        >
                          <span>{t.emoji}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2 bg-[#0077B5] hover:bg-[#005885] text-white h-12 text-base"
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Gerando legenda...</>
                    ) : (
                      <><Sparkles className="w-5 h-5" /> Gerar legenda com IA</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Edit Caption */}
          {step === 2 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Legenda gerada</label>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleRegenerate} disabled={isGenerating}>
                          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          Regenerar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopy}>
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="min-h-[280px] text-sm leading-relaxed resize-y"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tema: <Badge variant="secondary" className="text-xs">{topic}</Badge></span>
                      <span>{caption.length} caracteres</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-1.5" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                    <Button
                      className="flex-1 gap-1.5 bg-[#0077B5] hover:bg-[#005885] text-white"
                      onClick={() => setStep(3)}
                      disabled={!caption.trim()}
                    >
                      Pré-visualizar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Preview & Publish */}
          {step === 3 && (
            <motion.div variants={itemVariants} className="space-y-6">
              {/* LinkedIn-style preview card */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Post header */}
                  <div className="flex items-center gap-3 p-4 md:p-5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center">
                      <Linkedin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Seu Nome</p>
                      <p className="text-xs text-muted-foreground">Sua headline profissional</p>
                      <p className="text-xs text-muted-foreground">Agora • 🌐</p>
                    </div>
                  </div>
                  {/* Post content */}
                  <div className="px-4 md:px-5 pb-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
                      {caption}
                    </p>
                  </div>
                  {/* Engagement bar */}
                  <div className="border-t border-border px-4 md:px-5 py-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 text-xs font-medium transition-colors">
                        <ThumbsUp className="w-4 h-4" /> Gostei
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 text-xs font-medium transition-colors">
                        <MessageCircle className="w-4 h-4" /> Comentar
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 text-xs font-medium transition-colors">
                        <Repeat2 className="w-4 h-4" /> Repostar
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent/50 text-xs font-medium transition-colors">
                        <Send className="w-4 h-4" /> Enviar
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="gap-1.5" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" /> Editar
                </Button>
                {isPublished ? (
                  <Button className="flex-1 gap-1.5 bg-emerald-600 text-white cursor-default" disabled>
                    <Check className="w-4 h-4" /> Publicado com sucesso!
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-1.5 bg-[#0077B5] hover:bg-[#005885] text-white h-12 text-base"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Publicando...</>
                    ) : (
                      <><Linkedin className="w-5 h-5" /> Publicar no LinkedIn</>
                    )}
                  </Button>
                )}
              </div>

              {/* New Post button after publishing */}
              {isPublished && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Button variant="outline" className="w-full gap-2" onClick={reset}>
                    <Sparkles className="w-4 h-4" /> Criar novo post
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
