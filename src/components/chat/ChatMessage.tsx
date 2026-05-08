import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { PostActionBar } from './PostActionBar';

import { Markdown } from './Markdown';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-fade-in', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-secondary' : 'linkedin-gradient'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        )}
      </div>
      <div className="max-w-[85%]">
        <div
          className={cn(
            'chat-bubble',
            isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'
          )}
        >
          <Markdown content={message.content} className={isUser ? 'prose-invert' : ''} />
        </div>
        
        {/* Integrated Action Bar for assistant messages */}
        {!isUser && message.content && (
          <PostActionBar content={message.content} />
        )}
      </div>
    </div>
  );
}
