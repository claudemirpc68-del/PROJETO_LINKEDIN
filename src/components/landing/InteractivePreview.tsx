import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Copy, Check, Image, Calendar, Linkedin, Sparkles, User } from 'lucide-react';

const SCENARIOS = [
  {
    userMessage: 'Crie um post sobre produtividade com IA',
    aiResponse: `🚀 5 formas de usar IA para ser 10x mais produtivo:

1️⃣ **Automatize tarefas repetitivas** — Deixe a IA cuidar do que é previsível
2️⃣ **Resuma documentos longos** — Extraia insights em segundos
3️⃣ **Crie rascunhos de e-mails** — Nunca mais encare uma tela em branco
4️⃣ **Organize suas prioridades** — Use IA para gerenciar seu backlog
5️⃣ **Analise dados complexos** — Encontre padrões que você não veria

O segredo? Não é substituir humanos.
É **amplificar** o que já fazemos de melhor.

Qual dessas você já usa? 👇`,
  },
  {
    userMessage: 'Faça um post sobre carreira e networking',
    aiResponse: `A verdade que ninguém te conta sobre networking:

❌ Não é colecionar conexões
❌ Não é mandar mensagens genéricas
❌ Não é só aparecer em eventos

✅ É criar valor ANTES de pedir algo
✅ É ser genuinamente curioso sobre as pessoas
✅ É manter contato de forma consistente

O melhor networking que fiz?
Comentei com profundidade no post de alguém.
Essa pessoa virou meu mentor.

**Networking de verdade começa com generosidade.**

Concorda? Compartilhe com alguém que precisa ler isso 🤝`,
  },
  {
    userMessage: 'Escreva sobre liderança no mundo digital',
    aiResponse: `Liderar em 2025 exige uma habilidade que poucos dominam:

**Comunicação assíncrona.**

Times remotos não funcionam como presenciais.
E muitos líderes ainda não entenderam isso.

3 práticas que transformaram meu time:

📝 Documentar decisões por escrito
🎯 Definir expectativas claras de resposta
🔄 Substituir reuniões por updates gravados

Resultado?
→ Menos reuniões
→ Mais foco
→ Time mais autônomo

A liderança do futuro não é sobre controle.
É sobre **confiança e clareza**.

Salve este post para aplicar na sua rotina 💡`,
  },
];

const CHAR_DELAY = 25;
const USER_TYPE_DELAY = 40;
const PAUSE_AFTER_USER = 800;
const PAUSE_THINKING = 1800;
const PAUSE_AFTER_COMPLETE = 4000;
const PAUSE_BEFORE_COPY = 1000;
const COPY_FLASH_DURATION = 2000;

type Phase = 'typing-user' | 'user-sent' | 'thinking' | 'typing-ai' | 'complete' | 'copy-flash' | 'fade-out';

interface InteractivePreviewProps {
  onGetStarted: () => void;
}

export function InteractivePreview({ onGetStarted }: InteractivePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing-user');
  const [displayedUserText, setDisplayedUserText] = useState('');
  const [displayedAiText, setDisplayedAiText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const scenario = SCENARIOS[scenarioIndex];

  // Start animation when in view
  useEffect(() => {
    if (isInView && !isActive) {
      setIsActive(true);
      setPhase('typing-user');
      setDisplayedUserText('');
      setDisplayedAiText('');
      setCopied(false);
    }
  }, [isInView, isActive]);

  // Typewriter for user message
  useEffect(() => {
    if (phase !== 'typing-user' || !isActive) return;
    if (displayedUserText.length < scenario.userMessage.length) {
      const t = setTimeout(() => {
        setDisplayedUserText(scenario.userMessage.slice(0, displayedUserText.length + 1));
      }, USER_TYPE_DELAY);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase('user-sent'), PAUSE_AFTER_USER);
      return () => clearTimeout(t);
    }
  }, [phase, displayedUserText, scenario.userMessage, isActive]);

  // User sent -> thinking
  useEffect(() => {
    if (phase !== 'user-sent') return;
    const t = setTimeout(() => setPhase('thinking'), 100);
    return () => clearTimeout(t);
  }, [phase]);

  // Thinking -> typing AI
  useEffect(() => {
    if (phase !== 'thinking') return;
    const t = setTimeout(() => setPhase('typing-ai'), PAUSE_THINKING);
    return () => clearTimeout(t);
  }, [phase]);

  // Typewriter for AI response
  useEffect(() => {
    if (phase !== 'typing-ai' || !isActive) return;
    if (displayedAiText.length < scenario.aiResponse.length) {
      const t = setTimeout(() => {
        setDisplayedAiText(scenario.aiResponse.slice(0, displayedAiText.length + 1));
      }, CHAR_DELAY);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase('complete'), 500);
      return () => clearTimeout(t);
    }
  }, [phase, displayedAiText, scenario.aiResponse, isActive]);

  // Complete -> copy flash
  useEffect(() => {
    if (phase !== 'complete') return;
    const t = setTimeout(() => {
      setCopied(true);
      setPhase('copy-flash');
    }, PAUSE_BEFORE_COPY);
    return () => clearTimeout(t);
  }, [phase]);

  // Copy flash -> fade out
  useEffect(() => {
    if (phase !== 'copy-flash') return;
    const t = setTimeout(() => {
      setCopied(false);
      setPhase('fade-out');
    }, COPY_FLASH_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  // Fade out -> next scenario
  useEffect(() => {
    if (phase !== 'fade-out') return;
    const t = setTimeout(() => {
      setScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
      setDisplayedUserText('');
      setDisplayedAiText('');
      setCopied(false);
      setPhase('typing-user');
    }, 1000);
    return () => clearTimeout(t);
  }, [phase]);

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formatted = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return (
        <p key={i} className={line === '' ? 'h-2' : 'mb-0.5'}>
          {formatted}
        </p>
      );
    });
  };

  return (
    <div ref={ref}>
      <AnimatePresence mode="wait">
        <motion.div
          key={scenarioIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase === 'fade-out' ? 0 : 1, y: phase === 'fade-out' ? -10 : 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl mx-auto"
        >
          {/* Window Chrome */}
          <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30 bg-card/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent-foreground/30" />
                <div className="w-3 h-3 rounded-full bg-primary/40" />
              </div>
              <span className="text-xs text-muted-foreground ml-2 font-medium">LinkedIn Viral — Chat com IA</span>
            </div>

            {/* Chat area */}
            <div className="p-4 sm:p-6 space-y-4 min-h-[320px] max-h-[480px] overflow-hidden bg-background/30">
              {/* User typing / message */}
              {(phase === 'typing-user') && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-primary text-primary-foreground text-sm">
                      {displayedUserText}
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-4 bg-primary-foreground ml-0.5 align-middle"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* User message sent */}
              {phase !== 'typing-user' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-3 flex-row-reverse"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-md bg-primary text-primary-foreground text-sm">
                      {scenario.userMessage}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Thinking indicator */}
              {phase === 'thinking' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full linkedin-gradient flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-muted/50 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>Gerando post</span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ...
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI response */}
              {(phase === 'typing-ai' || phase === 'complete' || phase === 'copy-flash' || phase === 'fade-out') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full linkedin-gradient flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[85%]">
                    <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-muted/50 text-sm text-muted-foreground leading-relaxed">
                      {renderFormattedText(displayedAiText)}
                      {phase === 'typing-ai' && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 bg-muted-foreground ml-0.5 align-middle"
                        />
                      )}
                    </div>

                    {/* Mock Action Bar */}
                    {(phase === 'complete' || phase === 'copy-flash' || phase === 'fade-out') && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 flex items-center gap-1 p-2 rounded-xl border border-border bg-card/50 backdrop-blur-sm"
                      >
                        <motion.button
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            copied
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'hover:bg-accent text-muted-foreground'
                          }`}
                          animate={copied ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </motion.button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
                          <Image className="w-3.5 h-3.5" />
                          Imagem
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
                          <Calendar className="w-3.5 h-3.5" />
                          Agendar
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#0077B5] hover:bg-accent transition-colors">
                          <Linkedin className="w-3.5 h-3.5" />
                          LinkedIn
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
