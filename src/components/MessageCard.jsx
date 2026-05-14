import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import * as Icons from 'lucide-react';

const MessageCard = ({ message }) => {
  const isAI = message.role === 'assistant';

  // System message (mode change notification)
  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-low border border-outline text-xs text-on-surface-variant">
          <Icons.RefreshCw size={12} className="text-primary" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full animate-slide-up ${isAI ? 'justify-start' : 'justify-end'}`}>
      {isAI ? (
        /* AI Response */
        <div className="flex gap-3 max-w-[90%] md:max-w-[80%]">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
            <Icons.Bot size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-primary mb-1.5">RadAI</div>
            <div className="glass-panel rounded-2xl rounded-tl-md p-5 md:p-6">
              <div className="prose max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* User Message */
        <div className="max-w-[80%] md:max-w-[70%]">
          <div className="bg-primary text-white px-5 py-3.5 rounded-2xl rounded-tr-md shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCard;
