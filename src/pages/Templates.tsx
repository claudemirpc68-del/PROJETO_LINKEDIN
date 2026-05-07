import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { templates, getCategoryLabel, getCategoryColor } from '@/data/templates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Eye } from 'lucide-react';
import { PostTemplate, TemplateCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

const categories: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'historia-pessoal', label: '📖 História Pessoal' },
  { id: 'dica-pratica', label: '💡 Dica Prática' },
  { id: 'case-sucesso', label: '📊 Case de Sucesso' },
  { id: 'ia-tecnologia', label: '🤖 IA & Tecnologia' },
  { id: 'esg-cultura', label: '🌱 ESG & Cultura' },
  { id: 'tendencias', label: '📈 Tendências' },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(null);
  const [copied, setCopied] = useState<'structure' | 'example' | null>(null);
  const { toast } = useToast();

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleCopy = async (text: string, type: 'structure' | 'example') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Templates de Posts</h1>
          <p className="text-muted-foreground">
            Estruturas testadas e aprovadas para criar posts que engajam no LinkedIn.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="whitespace-nowrap"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{template.icon}</span>
                  <Badge variant="secondary" className={getCategoryColor(template.category)}>
                    {getCategoryLabel(template.category)}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                  {template.title}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full group-hover:bg-accent">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Detail Dialog */}
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTemplate?.icon}</span>
                <div>
                  <DialogTitle className="text-xl">{selectedTemplate?.title}</DialogTitle>
                  <DialogDescription>{selectedTemplate?.description}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="structure" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="structure">📝 Estrutura</TabsTrigger>
                <TabsTrigger value="example">✨ Exemplo</TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="flex-1 overflow-auto mt-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => selectedTemplate && handleCopy(selectedTemplate.structure, 'structure')}
                  >
                    {copied === 'structure' ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedTemplate?.structure}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="example" className="flex-1 overflow-auto mt-4">
                {selectedTemplate?.example ? (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 z-10"
                      onClick={() => selectedTemplate.example && handleCopy(selectedTemplate.example, 'example')}
                    >
                      {copied === 'example' ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <div className="bg-card border border-border p-4 rounded-lg">
                      <div className="prose prose-sm max-w-none">
                        {selectedTemplate.example.split('\n').map((line, i) => (
                          <p key={i} className={line === '' ? 'h-3' : 'mb-1'}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Exemplo não disponível para este template.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
