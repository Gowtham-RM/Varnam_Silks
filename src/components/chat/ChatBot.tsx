import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '@/lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! Welcome to Varnam Silks. I'm your AI shopping assistant. How can I help you find the perfect outfit today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Hide chatbot on admin routes - check AFTER all hooks are declared
    const isAdminRoute = location.pathname.startsWith('/admin');

    useEffect(() => {
        if (scrollRef.current) {
            // Need a slight timeout to ensure DOM has updated with the new message Bubble
            setTimeout(() => {
                const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollElement) {
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                }
            }, 50);
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await api.post('/chat', { messages: newMessages });
            console.log('Chat API response:', response.status, response.data);
            if (!response.data?.message) {
                throw new Error('No message in response');
            }
            setMessages([...newMessages, { role: 'assistant', content: response.data.message }]);
        } catch (error: any) {
            console.error('Chat API Error Details:', {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                config: error?.config?.url,
                error: error
            });
            setMessages([
                ...newMessages,
                { 
                    role: 'assistant', 
                    content: error?.response?.status === 503
                        ? 'The AI service is not configured. Please check that GEMINI_API_KEY is set on the server.'
                        : error?.response?.status === 429
                        ? 'Too many requests. Please wait a moment and try again.'
                        : 'Oops! Something went wrong. Please try again later.' 
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    // Don't render chatbot on admin routes
    if (isAdminRoute) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
                {!isOpen && (
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                    >
                        <MessageCircle className="h-6 w-6 text-primary-foreground" />
                    </Button>
                )}

                {isOpen && (
                    <div className="bg-background border rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-[400px] h-[70vh] sm:h-[550px] max-h-[800px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-20 duration-300">
                        {/* Header */}
                        <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-foreground/20 p-2 rounded-full">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">AI Assistant</h3>
                                    <p className="text-xs text-primary-foreground/80">Varnam Silks Support</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full h-8 w-8"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            <div className="space-y-4 pb-4 flex flex-col">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                : 'bg-muted/60 text-foreground rounded-tl-sm'
                                                }`}
                                        >
                                            <div className="text-[15px] leading-relaxed whitespace-pre-wrap format-markdown">
                                                <ReactMarkdown
                                                    components={{
                                                        a: ({ node, ...props }) => (
                                                            <Link
                                                                to={props.href || "#"}
                                                                className={`underline font-medium transition-colors ${msg.role === 'user'
                                                                    ? 'text-primary-foreground hover:text-primary-foreground/80'
                                                                    : 'text-primary hover:text-primary/80'
                                                                    }`}
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                {props.children}
                                                            </Link>
                                                        )
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted/60 rounded-2xl rounded-tl-sm p-4 w-16 flex justify-center items-center shadow-sm">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-background border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-muted/50 rounded-full px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 border-transparent transition-all"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    size="icon"
                                    className="rounded-full h-11 w-11 shrink-0"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
