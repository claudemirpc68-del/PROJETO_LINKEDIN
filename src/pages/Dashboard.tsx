import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  LayoutTemplate,
  BarChart3,
  Layers,
  Calendar,
  ImageIcon,
  Sparkles,
  Clock,
  TrendingUp,
  FileText,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useCalendarPosts } from '@/hooks/useCalendarPosts';
import { Conversation } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GeneratedPostsList } from '@/components/dashboard/GeneratedPostsList';
import { DraftPostsList } from '@/components/dashboard/DraftPostsList';

const quickActions = [
  {
    name: 'Criar Post',
    description: 'Gere conteúdo viral com IA',
    icon: MessageSquare,
    href: '/chat',
    color: 'hsl(201 89% 48%)',
  },
  {
    name: 'Templates',
    description: 'Modelos prontos para usar',
    icon: LayoutTemplate,
    href: '/templates',
    color: 'hsl(38 92% 50%)',
  },
  {
    name: 'Analisar Post',
    description: 'Avalie seu conteúdo',
    icon: BarChart3,
    href: '/analyze',
    color: 'hsl(142 71% 45%)',
  },
  {
    name: 'Carrossel',
    description: 'Crie carrosséis impactantes',
    icon: Layers,
    href: '/carousel',
    color: 'hsl(280 65% 60%)',
  },
  {
    name: 'Calendário',
    description: 'Gerencie agendamentos',
    icon: Calendar,
    href: '/calendar',
    color: 'hsl(340 75% 55%)',
  },
  {
    name: 'Galeria',
    description: 'Suas imagens geradas',
    icon: ImageIcon,
    href: '/gallery',
    color: 'hsl(30 80% 55%)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }, // Faster stagger for stability
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }, // Removed Y transform to prevent shaking
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [conversations] = useLocalStorage<Conversation[]>('linkedin-conversations', []);
  const { posts: calendarPosts, isLoading: calendarLoading } = useCalendarPosts();

  // Show landing page for unauthenticated users
  if (!authLoading && !user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  // Metrics (Memoized values to avoid jumps)
  const totalConversations = conversations.length;
  const totalMessages = conversations.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
  const totalPosts = totalMessages > 0
    ? conversations.reduce((acc, c) => acc + (c.messages?.filter(m => m.role === 'assistant').length || 0), 0)
    : 0;
  const scheduledPosts = calendarPosts.filter(p => p.status === 'agendado').length;
  const publishedPosts = calendarPosts.filter(p => p.status === 'publicado').length;

  // Recent conversations (last 5)
  const recentConversations = [...conversations]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Upcoming scheduled posts
  const upcomingPosts = calendarPosts
    .filter(p => p.status === 'agendado' && p.scheduledDate && p.scheduledDate >= new Date())
    .sort((a, b) => (a.scheduledDate?.getTime() || 0) - (b.scheduledDate?.getTime() || 0))
    .slice(0, 4);

  const metrics = [
    {
      label: 'Posts Gerados',
      value: totalPosts,
      icon: FileText,
      description: 'Total via IA',
    },
    {
      label: 'Conversas',
      value: totalConversations,
      icon: MessageSquare,
      description: 'Sessões de criação',
    },
    {
      label: 'Agendados',
      value: scheduledPosts,
      icon: Clock,
      description: 'No calendário',
    },
    {
      label: 'Publicados',
      value: publishedPosts,
      icon: TrendingUp,
      description: 'Finalizados',
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg linkedin-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Visão geral do seu conteúdo LinkedIn
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => (
              <Card key={m.label} className="relative overflow-hidden border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <m.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{m.value}</p>
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <Card
                  key={action.name}
                  className="cursor-pointer hover:shadow-md transition-all group border-border/50"
                  onClick={() => navigate(action.href)}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-1"
                      style={{ backgroundColor: action.color }}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{action.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight hidden md:block">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Two columns: Recent + Upcoming */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            {/* Recent Conversations */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Conversas Recentes</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => navigate('/chat')}
                  >
                    Ver todas
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate('/chat')}
                    >
                      Criar primeiro post
                    </Button>
                  </div>
                ) : (
                  recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate('/chat')}
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-foreground">
                          {conv.title || 'Conversa sem título'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(conv.updatedAt), "dd MMM, HH:mm", { locale: ptBR })}
                          {' · '}
                          {conv.messages?.length || 0} msgs
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Scheduled Posts */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Próximos Agendamentos</CardTitle>
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
                {calendarLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : upcomingPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum post agendado</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => navigate('/calendar')}
                    >
                      Agendar post
                    </Button>
                  </div>
                ) : (
                  upcomingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate('/calendar')}
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-foreground">
                          {post.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(post.scheduledDate), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Agendado
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Generated Posts + Drafts */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mt-6">
            <GeneratedPostsList />
            <DraftPostsList />
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
