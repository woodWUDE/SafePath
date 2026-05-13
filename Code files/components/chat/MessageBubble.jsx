import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try { return typeof results === 'string' ? JSON.parse(results) : results; } catch { return results; }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-muted-foreground', text: 'Pending' },
    running: { icon: Loader2, color: 'text-primary', text: 'Running...', spin: true },
    in_progress: { icon: Loader2, color: 'text-primary', text: 'Running...', spin: true },
    completed: isError
      ? { icon: AlertCircle, color: 'text-destructive', text: 'Failed' }
      : { icon: CheckCircle2, color: 'text-emerald-600', text: 'Success' },
    success: { icon: CheckCircle2, color: 'text-emerald-600', text: 'Success' },
    failed: { icon: AlertCircle, color: 'text-destructive', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-destructive', text: 'Failed' },
  }[status] || { icon: Zap, color: 'text-muted-foreground', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:bg-muted ${
          expanded ? 'bg-muted border-border' : 'bg-card border-border'
        }`}
      >
        <Icon className={`h-3 w-3 ${statusConfig.color} ${statusConfig.spin ? 'animate-spin' : ''}`} />
        <span className="text-foreground">{formattedName}</span>
        {statusConfig.text && (
          <span className={`text-muted-foreground ${isError ? 'text-destructive' : ''}`}>• {statusConfig.text}</span>
        )}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform ml-auto ${expanded ? 'rotate-90' : ''}`} />
        )}
      </button>
      {expanded && !statusConfig.spin && (
        <div className="mt-1.5 ml-3 pl-3 border-l-2 border-border space-y-2">
          {toolCall.arguments_string && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Parameters:</div>
              <pre className="bg-muted rounded-md p-2 text-xs text-foreground whitespace-pre-wrap">
                {(() => { try { return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2); } catch { return toolCall.arguments_string; } })()}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Result:</div>
              <pre className="bg-muted rounded-md p-2 text-xs text-foreground whitespace-pre-wrap max-h-48 overflow-auto">
                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.content && (
          <div className={`rounded-2xl px-4 py-2.5 ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
          }`}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  h1: ({ children }) => <h1 className="text-base font-semibold my-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-semibold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold my-1">{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>,
                  code: ({ inline, children, ...props }) => (
                    inline ? (
                      <code className="px-1 py-0.5 rounded bg-muted text-foreground text-xs">{children}</code>
                    ) : (
                      <pre className="bg-muted rounded-lg p-3 overflow-x-auto my-2 relative">
                        <code {...props}>{children}</code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(String(children));
                            toast.success('Copied');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </pre>
                    )
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1">
            {message.tool_calls.map((tc, idx) => <FunctionDisplay key={idx} toolCall={tc} />)}
          </div>
        )}
      </div>
    </div>
  );
}