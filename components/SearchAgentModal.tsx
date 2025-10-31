// FIX: Removed invalid text from the start and end of the file that was causing parsing errors.
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Chat } from "@google/genai";
import { AppContext } from '../context/AppContext';
import { ChatMessage, Analysis } from '../types';
import { XIcon, WandSparklesIcon } from './icons';
import { startResearchChat, askResearchAgent } from '../services/geminiService';

interface SearchAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: Analysis | null;
}

export const SearchAgentModal: React.FC<SearchAgentModalProps> = ({ isOpen, onClose, analysis }) => {
  const { setToast } = useContext(AppContext);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatRef.current = startResearchChat(analysis);
      const initialMessage = analysis
        ? `Hello! I am your AI Research Assistant. I have the full analysis for **${analysis.companyName}**. Ask me anything about the report, or ask for the latest market information.`
        : 'Hello! I am your AI Research Assistant. I can search the web in real-time to answer your questions. What would you like to know?';
      
      setMessages([
        { role: 'model', text: initialMessage }
      ]);
    } else {
      chatRef.current = null;
      setMessages([]);
      setInput('');
      setIsLoading(false);
    }
  }, [isOpen, analysis]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askResearchAgent(chatRef.current, input);
      const modelMessage: ChatMessage = { role: 'model', text: response.text, sources: response.sources };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to get response.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMessageContent = (text: string) => {
    // Renders basic markdown (bold, italic) to avoid showing raw tags.
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return { __html: html };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <WandSparklesIcon className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {analysis ? `Research for ${analysis.companyName}` : 'AI Research Assistant'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={renderMessageContent(msg.text)}
                />
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                    <h4 className="text-xs font-semibold mb-1">Sources:</h4>
                    <ul className="space-y-1">
                      {msg.sources.map((source, i) => (
                        <li key={i}>
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className={`text-xs hover:underline ${msg.role === 'user' ? 'text-blue-200' : 'text-brand-primary'}`}>
                            {source.title || source.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>
        
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSend} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:border-brand-primary focus:ring-brand-primary text-slate-900 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary/90 disabled:bg-brand-primary/50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
