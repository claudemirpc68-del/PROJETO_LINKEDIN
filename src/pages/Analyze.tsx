import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PostAnalysis } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2,
  Target,
  Heart,
  Layout,
  MessageCircle
} from 'lucide-react';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-post`;

export default function AnalyzePage() {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<PostAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Faça login para analisar posts.');
        return;
      }
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar post');
      }

      const result: PostAnalysis = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing post:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao analisar post');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa melhorar';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analisar Post</h1>
          <p className="text-muted-foreground">
            Cole seu post e receba uma análise de potencial viral com sugestões de melhoria.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seu Post</CardTitle>
                <CardDescription>
                  Cole o texto do seu post para análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Cole seu post aqui..."
                  className="min-h-[300px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {content.split(/\s+/).filter(w => w).length} palavras
                  </span>
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!content.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analisar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            {analysis ? (
              <>
                {/* Overall Score */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}
                      </div>
                      <div className="text-muted-foreground">
                        Potencial Viral: <span className="font-medium">{getScoreLabel(analysis.score)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas Detalhadas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-sm">Força do Gancho</span>
                        </div>
                        <span className="text-sm font-medium">{analysis.hookStrength}%</span>
                      </div>
                      <Progress value={analysis.hookStrength} className={`h-2 ${getProgressColor(analysis.hookStrength)}`} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          <span className="text-sm">Autenticidade</span>
                        </div>
                        <span className="text-sm font-medium">{analysis.authenticity}%</span>
                      </div>
                      <Progress value={analysis.authenticity} className={`h-2 ${getProgressColor(analysis.authenticity)}`} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layout className="w-4 h-4 text-primary" />
                          <span className="text-sm">Estrutura</span>
                        </div>
                        <span className="text-sm font-medium">{analysis.structure}%</span>
                      </div>
                      <Progress value={analysis.structure} className={`h-2 ${getProgressColor(analysis.structure)}`} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm">Chamada para Ação</span>
                        </div>
                        <span className="text-sm font-medium">{analysis.cta}%</span>
                      </div>
                      <Progress value={analysis.cta} className={`h-2 ${getProgressColor(analysis.cta)}`} />
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                {analysis.warnings.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                        <AlertTriangle className="w-5 h-5" />
                        Atenção
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.warnings.map((warning, i) => (
                          <li key={i} className="text-sm text-yellow-800 dark:text-yellow-300">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                        Sugestões de Melhoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-primary">→</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Nenhuma análise ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    Cole seu post e clique em "Analisar" para ver os resultados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
