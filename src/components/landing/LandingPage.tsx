import { motion, useInView } from 'framer-motion';
import { 
  MessageSquare, 
  LayoutTemplate, 
  BarChart3, 
  Layers, 
  Calendar,
  Sparkles,
  Zap,
  TrendingUp,
  ArrowRight,
  Star,
  CheckCircle2,
  Rocket,
  ArrowUpRight,
  MousePointer2,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InteractivePreview } from './InteractivePreview';
import { useRef, useEffect, useState } from 'react';

const features = [
  {
    icon: MessageSquare,
    title: 'Chat com IA',
    description: 'Gere posts virais conversando naturalmente com nossa IA especializada em LinkedIn.',
    size: 'large' as const,
  },
  {
    icon: LayoutTemplate,
    title: 'Templates Prontos',
    description: 'Dezenas de templates testados e aprovados para diferentes objetivos.',
    size: 'small' as const,
  },
  {
    icon: BarChart3,
    title: 'Análise de Posts',
    description: 'Analise seus posts existentes e receba sugestões de melhorias.',
    size: 'small' as const,
  },
  {
    icon: Layers,
    title: 'Carrosséis',
    description: 'Crie carrosséis profissionais que geram até 3x mais engajamento.',
    size: 'large' as const,
  },
  {
    icon: Calendar,
    title: 'Calendário Editorial',
    description: 'Planeje e organize seus posts com um calendário visual intuitivo.',
    size: 'small' as const,
  },
  {
    icon: TrendingUp,
    title: 'Otimizado para Viralizar',
    description: 'Técnicas comprovadas de copywriting para maximizar seu alcance.',
    size: 'small' as const,
  },
];

const testimonials = [
  { name: 'Ana Silva', role: 'CEO, TechStartup', text: 'Triplicou meu engajamento em apenas 2 semanas! Ferramenta indispensável.', avatar: '👩‍💼' },
  { name: 'Carlos Mendes', role: 'Consultor de Negócios', text: 'Ferramenta essencial para construir meu branding pessoal no LinkedIn.', avatar: '👨‍💻' },
  { name: 'Julia Santos', role: 'Marketing Lead', text: 'Economizo horas toda semana e meus posts nunca tiveram tanto alcance.', avatar: '👩‍🎨' },
];

const marqueeItems = [
  'Posts Virais', 'IA Avançada', 'Templates', 'Carrosséis', 'Calendário', 'Análise', 
  'Copywriting', 'Engajamento', 'LinkedIn', 'Branding', 'Networking', 'Crescimento'
];

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');
  
  useEffect(() => {
    if (!isInView) return;
    const numericPart = target.replace(/[^0-9.]/g, '');
    const num = parseFloat(numericPart);
    const prefix = target.replace(/[0-9.+]/g, '').replace(suffix, '');
    const hasPlus = target.includes('+');
    const duration = 1500;
    const steps = 40;
    const stepDuration = duration / steps;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num * 10) / 10;
      
      if (Number.isInteger(num)) {
        setDisplay(`${prefix}${Math.round(eased * num)}${hasPlus ? '+' : ''}${suffix}`);
      } else {
        setDisplay(`${prefix}${(eased * num).toFixed(1)}${hasPlus ? '+' : ''}${suffix}`);
      }
      
      if (step >= steps) {
        setDisplay(target + suffix);
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [isInView, target, suffix]);

  return <span ref={ref}>{display}</span>;
}

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ x: 2 }}
            >
              <div className="w-10 h-10 border-2 border-border bg-foreground flex items-center justify-center shadow-[var(--shadow-xs)]">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-foreground tracking-tight leading-tight font-mono">LinkedIn Viral</span>
                <span className="text-[8px] text-muted-foreground leading-none">By: Claudemir</span>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                onClick={onGetStarted}
                className="font-mono text-sm shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200"
              >
                Começar Grátis <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-secondary text-sm font-mono font-medium mb-8 shadow-[var(--shadow-xs)]"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Zap className="w-4 h-4" />
                </motion.div>
                IA de última geração
              </motion.div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-8 tracking-tight">
                Crie posts
                <br />
                que{' '}
                <motion.span 
                  className="relative inline-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="relative z-10">viralizam</span>
                  <motion.div 
                    className="absolute bottom-1 left-0 right-0 h-4 bg-foreground/10"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                    style={{ originX: 0 }}
                  />
                </motion.span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-10 leading-relaxed"
              >
                Transforme suas ideias em conteúdo que engaja, conecta e viraliza. 
                Nossa IA entende as melhores práticas do LinkedIn.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    onClick={onGetStarted}
                    className="text-lg px-8 py-7 font-mono shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group"
                  >
                    <Rocket className="mr-2 w-5 h-5" />
                    Começar Agora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={onGetStarted}
                    className="text-lg px-8 py-7 font-mono shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] transition-all duration-200 group"
                  >
                    <MousePointer2 className="mr-2 w-5 h-5" />
                    Ver Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="flex -space-x-2">
                  {['👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬', '👨‍🚀'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                      className="w-9 h-9 border-2 border-border bg-secondary flex items-center justify-center text-base shadow-[var(--shadow-2xs)]"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <span className="font-bold text-foreground font-mono">4.9</span>
                  <span>· +500 usuários</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: '3x', label: 'Mais engajamento', icon: TrendingUp },
                { value: '10k+', label: 'Posts gerados', icon: MessageSquare },
                { value: '95%', label: 'Satisfação', icon: Star },
                { value: '60s', label: 'Tempo médio', icon: Zap },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ x: -3, y: -3 }}
                  className="p-6 border-2 border-border bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group cursor-default"
                >
                  <stat.icon className="w-5 h-5 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
                  <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground mb-1">
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y-2 border-border py-4 overflow-hidden bg-secondary">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-sm font-mono font-bold text-foreground/60 flex items-center gap-3">
              {item}
              <span className="w-2 h-2 bg-foreground/30" />
            </span>
          ))}
        </motion.div>
      </div>

      {/* Interactive Preview Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-secondary text-sm font-mono font-medium mb-6 shadow-[var(--shadow-xs)]"
            >
              <Zap className="w-4 h-4" />
              Veja em Ação
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Simples assim
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja como a IA transforma sua ideia em um post pronto para viralizar
            </p>
          </motion.div>

          <InteractivePreview onGetStarted={onGetStarted} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onGetStarted}
                className="font-mono shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group"
              >
                <Rocket className="mr-2 w-5 h-5" />
                Experimentar Agora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-background text-sm font-mono font-medium mb-6 shadow-[var(--shadow-xs)]"
            >
              <Sparkles className="w-4 h-4" />
              Recursos
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Tudo para viralizar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais para criar, analisar e planejar seu conteúdo
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ x: -3, y: -3 }}
                className={`group relative p-6 sm:p-8 border-2 border-border bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-default overflow-hidden ${
                  feature.size === 'large' ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: -5 }}
                    className="w-12 h-12 border-2 border-border bg-secondary flex items-center justify-center mb-5 shadow-[var(--shadow-2xs)]"
                  >
                    <feature.icon className="w-6 h-6 text-foreground" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-2 font-mono">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                </div>

                {/* Hover corner accent */}
                <motion.div 
                  className="absolute bottom-0 right-0 w-16 h-16 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-secondary text-sm font-mono font-medium mb-6 shadow-[var(--shadow-xs)]"
            >
              <Rocket className="w-4 h-4" />
              Como Funciona
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
              3 passos simples
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Do zero ao post viral em menos de um minuto
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { 
                step: '01', 
                title: 'Descreva sua ideia', 
                description: 'Conte para a IA sobre o que você quer falar ou escolha um de nossos templates.',
                icon: MessageSquare,
              },
              { 
                step: '02', 
                title: 'IA gera o conteúdo', 
                description: 'Nossa IA cria um post otimizado com técnicas comprovadas de copywriting viral.',
                icon: Sparkles,
              },
              { 
                step: '03', 
                title: 'Publique e engaje', 
                description: 'Copie, ajuste se necessário e publique. Veja o engajamento crescer!',
                icon: TrendingUp,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ x: -3, y: -3 }}
                className="relative p-8 border-2 border-border bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-2 px-3 py-1 border-2 border-border bg-foreground text-background font-mono font-bold text-sm shadow-[var(--shadow-xs)]">
                  {item.step}
                </div>

                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-6 lg:w-8 h-0.5 bg-border z-10">
                    <ArrowRight className="w-3 h-3 absolute -right-1 -top-[5px] text-muted-foreground" />
                  </div>
                )}
                
                <div className="w-14 h-14 border-2 border-border bg-secondary flex items-center justify-center mt-4 mb-5 shadow-[var(--shadow-2xs)] group-hover:bg-foreground group-hover:text-background transition-colors duration-200">
                  <item.icon className="w-7 h-7" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 font-mono">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
              O que dizem nossos usuários
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: -3, y: -3 }}
                className="p-8 border-2 border-border bg-card shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200"
              >
                <Quote className="w-8 h-8 text-muted-foreground/30 mb-4" />
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-foreground text-foreground" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed text-lg">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t-2 border-border">
                  <div className="w-11 h-11 border-2 border-border bg-secondary flex items-center justify-center text-xl shadow-[var(--shadow-2xs)]">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-foreground font-mono">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative p-10 sm:p-16 border-2 border-border bg-foreground text-background shadow-[var(--shadow-lg)] overflow-hidden">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'linear-gradient(hsl(var(--background)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--background)) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-background/30 text-sm font-mono font-medium mb-8"
              >
                <CheckCircle2 className="w-4 h-4" />
                Sem cartão de crédito
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Pronto para viralizar?
              </h2>
              <p className="text-lg sm:text-xl opacity-80 mb-10 max-w-2xl mx-auto">
                Comece agora gratuitamente e descubra como criar conteúdo que realmente engaja.
              </p>
              
              <motion.div whileHover={{ x: -2, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  onClick={onGetStarted}
                  variant="outline"
                  className="text-lg px-10 py-8 bg-background text-foreground border-2 border-background hover:bg-background/90 font-mono font-bold shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 group"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t-2 border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-border bg-foreground flex items-center justify-center shadow-[var(--shadow-2xs)]">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="font-bold text-foreground font-mono">LinkedIn Viral</span>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            © 2024 LinkedIn Viral · Feito com ♥ para criadores
          </p>
        </div>
      </footer>
    </div>
  );
}
