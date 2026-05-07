import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  MessageCircle, 
  BookOpen,
  Search 
} from 'lucide-react';

const suggestions = [
  {
    icon: Search,
    text: '🔍 Pesquise tendências atuais e crie um post baseado em dados reais',
    color: 'text-orange-600',
  },
  {
    icon: Lightbulb,
    text: 'Me ajude a criar um post sobre produtividade',
    color: 'text-yellow-600',
  },
  {
    icon: TrendingUp,
    text: 'Como aumentar meu engajamento no LinkedIn?',
    color: 'text-green-600',
  },
  {
    icon: MessageCircle,
    text: 'Quero escrever sobre uma história pessoal de carreira',
    color: 'text-blue-600',
  },
  {
    icon: BookOpen,
    text: 'Crie um post sobre como uso IA no meu trabalho',
    color: 'text-purple-600',
  },
];

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export const ChatSuggestions = forwardRef<HTMLDivElement, ChatSuggestionsProps>(
  ({ onSelect }, ref) => {
    return (
      <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((suggestion, i) => (
          <Button
            key={i}
            variant="outline"
            className="h-auto p-4 flex items-start gap-3 text-left justify-start hover:bg-accent transition-all whitespace-normal"
            onClick={() => onSelect(suggestion.text)}
          >
            <suggestion.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${suggestion.color}`} />
            <span className="text-sm text-foreground text-left leading-snug">{suggestion.text}</span>
          </Button>
        ))}
      </div>
    );
  }
);

ChatSuggestions.displayName = 'ChatSuggestions';
