import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Message } from '@/types';
import { ChatMessage } from './ChatMessage';
import { Loader2, Sparkles } from 'lucide-react';

interface VirtualizedMessageListProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage?: string | null;
}

export function VirtualizedMessageList({
  messages,
  isLoading,
  streamingMessage,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Add loading indicator or streaming message as a virtual item
  const showStreaming = !!streamingMessage;
  const showLoadingIndicator = isLoading && !showStreaming && messages[messages.length - 1]?.role !== 'assistant';
  const itemCount = messages.length + (showLoadingIndicator || showStreaming ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5, // Render 5 extra items above/below viewport
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (itemCount > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        virtualizer.scrollToIndex(itemCount - 1, { align: 'end', behavior: 'smooth' });
      }, 50);
    }
  }, [itemCount, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-auto px-4 py-6"
      style={{ contain: 'strict' }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLoadingItem = virtualItem.index === messages.length;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="pb-6">
                  {virtualItem.index < messages.length ? (
                    <ChatMessage
                      message={messages[virtualItem.index]}
                    />
                  ) : showStreaming ? (
                    <ChatMessage
                      message={{
                        id: 'streaming',
                        role: 'assistant',
                        content: streamingMessage!,
                        timestamp: new Date()
                      }}
                    />
                  ) : (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full linkedin-gradient flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="chat-bubble chat-bubble-assistant flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-muted-foreground">Gerando post...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
