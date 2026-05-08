import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * A lightweight, regex-based Markdown renderer for the chat interface.
 * Handles bold, italic, code blocks, and bullet points.
 */
export function Markdown({ content, className }: MarkdownProps) {
  // Split content by code blocks first
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className={cn("prose prose-sm max-w-none break-words", className)}>
      {blocks.map((block, index) => {
        if (block.startsWith("```")) {
          // Render code block
          const code = block.slice(3, -3).trim();
          const lines = code.split("\n");
          // Check if first line is a language hint
          const firstLine = lines[0].toLowerCase();
          const isLang = /^[a-z]+$/.test(firstLine);
          const finalCode = isLang ? lines.slice(1).join("\n") : code;

          return (
            <pre key={index} className="bg-muted p-3 rounded-lg my-2 overflow-x-auto border border-border">
              <code className="text-xs font-mono">{finalCode}</code>
            </pre>
          );
        }

        // Render text with basic markdown formatting
        return (
          <div key={index} className="space-y-1">
            {block.split("\n").map((line, lineIndex) => {
              if (line.trim() === "") return <div key={lineIndex} className="h-2" />;

              // Handle list items
              const isListItem = line.trim().startsWith("- ") || line.trim().startsWith("* ");
              
              let processedLine = line;
              if (isListItem) {
                processedLine = line.trim().slice(2);
              }

              // Parse bold and italic
              const parts = processedLine.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
              const formattedParts = parts.map((part, partIndex) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith("*") && part.endsWith("*")) {
                  return <em key={partIndex}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith("`") && part.endsWith("`")) {
                  return <code key={partIndex} className="bg-muted px-1 rounded font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
                }
                return part;
              });

              if (isListItem) {
                return (
                  <div key={lineIndex} className="flex gap-2 ml-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{formattedParts}</span>
                  </div>
                );
              }

              return <p key={lineIndex}>{formattedParts}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}
