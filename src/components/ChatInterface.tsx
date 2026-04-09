import { useState, useRef, useEffect } from 'react';
import { askDocumentQuestion } from '../lib/gemini';
import { ChatMessage } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  documentText: string;
}

export function ChatInterface({ documentText }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I've analyzed this document. Feel free to ask me anything about its contents, clauses, or risks." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const answer = await askDocumentQuestion(documentText, userMessage, history);
      setMessages(prev => [...prev, { role: 'model', content: answer }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error while processing your question." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  message.role === 'user' ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-500"
                )}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  message.role === 'user' 
                    ? "bg-neutral-900 text-white rounded-tr-none" 
                    : "bg-white border border-neutral-100 shadow-sm rounded-tl-none text-neutral-700"
                )}>
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex gap-3 mr-auto">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-500">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-neutral-100 shadow-sm rounded-2xl rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-top border-neutral-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative"
        >
          <Input 
            placeholder="Ask a question..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="pr-12 h-11 bg-neutral-50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-neutral-200"
            disabled={isLoading}
          />
          <Button 
            type="submit"
            size="icon" 
            className="absolute right-1 top-1 h-9 w-9 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] text-neutral-400 text-center mt-2">
          AI-generated answers may be inaccurate. Verify important details.
        </p>
      </div>
    </div>
  );
}
