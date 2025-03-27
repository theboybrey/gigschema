"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Send,
  FileText,
  Paperclip,
  Clock,
  MessageSquare,
  Plus,
  Copy,
  ChevronDown
} from "lucide-react";
import { useStateValue } from "@/global/state.provider";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Types remain the same as in your original code
interface Attachment {
  id: string;
  type: 'text' | 'code' | 'file';
  content: string;
  name?: string;
}

interface Message {
  id: string;
  content: string;
  attachments?: Attachment[];
  sender: 'user' | 'ai';
  timestamp: number;
}

const KeyMapChat: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state: { user }, dispatch } = useStateValue();

  // Auto-expand textarea (same as before)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // Enhanced message submission with better attachment detection
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = inputText.trim();
    if (trimmedText) {
      const attachments: Attachment[] = [];

      // Improved code block detection with language support
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let codeMatch;
      while ((codeMatch = codeBlockRegex.exec(trimmedText)) !== null) {
        attachments.push({
          id: `code-${Date.now()}-${attachments.length}`,
          type: 'code',
          content: codeMatch[2],
          name: codeMatch[1] || 'Unknown'
        });
      }

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content: trimmedText.replace(codeBlockRegex, '').trim(),
        sender: 'user',
        timestamp: Date.now(),
        attachments: attachments.length ? attachments : undefined
      };

      setMessages(prev => [...prev, newMessage]);

      // Simulated AI response with more dynamic handling
      setTimeout(() => {
        const aiResponse: Message = {
          id: `msg-${Date.now() + 1}`,
          content: "I'm processing your request. Here's a detailed response...",
          sender: 'ai',
          timestamp: Date.now(),
          attachments: attachments.length ? [{
            id: `code-response-${Date.now()}`,
            type: 'code',
            content: '// Sample AI-generated code\nfunction exampleResponse() {\n  return "Hello, World!";\n}',
            name: 'TypeScript'
          }] : undefined
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);

      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const ChatHistoryModal = () => {
    const recentChats = [
      { id: '1', title: 'React Component Design', lastMessage: 'How can we improve...', timestamp: Date.now() - 3600000 },
      { id: '2', title: 'AI Integration', lastMessage: 'Let\'s discuss the architecture...', timestamp: Date.now() - 7200000 }
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={() => setShowChatHistory(false)}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white dark:bg-gray-900 rounded-xl w-[95%] max-w-md max-h-[80%] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Chat History</h2>
              <button
                className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full"
                onClick={() => setShowChatHistory(false)}
              >
                <Plus size={20} />
              </button>
            </div>

            {recentChats.map(chat => (
              <motion.div
                key={chat.id}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{chat.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(chat.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    
    // Shift + Enter for new line
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setInputText(prev => prev + "\n");
    }
  };

  // Enhanced attachment rendering with syntax highlighting
  const renderAttachments = (attachments: Attachment[]) => {
    return attachments.map(attachment => {
      switch (attachment.type) {
        case 'code':
          return (
            <motion.div
              key={attachment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden mt-2"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  <FileText size={16} />
                  <span className="text-sm">{attachment.name} Code Block</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(attachment.content)}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded"
                >
                  <Copy size={16} />
                </button>
              </div>
              <SyntaxHighlighter
                language={attachment.name?.toLowerCase() || 'typescript'}
                style={materialDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  background: 'transparent',
                  fontSize: '0.875rem',
                  padding: '1rem'
                }}
              >
                {attachment.content}
              </SyntaxHighlighter>
            </motion.div>
          );
        default:
          return null;
      }
    });
  };

  // Expanded message view similar to Grok's interface
  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessageId(prev => prev === messageId ? null : messageId);
  };

  // Rest of the component remains similar to your original implementation
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Header (same as before) */}
      <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="text-lg font-syne font-semibold dark:text-white">KeyMap</div>
        <div
          className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center cursor-pointer"
          onClick={() => setShowChatHistory(true)}
        >
          <span className="text-sm dark:text-white">{user?.firstName?.[0]}</span>
        </div>
      </header>

      {/* Main Content with Expandable Messages */}
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <h1 className="text-3xl font-medium font-syne mb-4 dark:text-white">
              Welcome, {user?.firstName}.
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-schibsted">
              What are we building today?
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-2xl mx-auto group ${message.sender === 'user'
                  ? 'text-right'
                  : 'text-left'
                }`}
            >
              <div
                className={`inline-block p-4 rounded-2xl max-w-full relative ${message.sender === 'user'
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                  } ${message.content.length > 200 ? 'cursor-pointer' : ''}`}
                onClick={() => message.content.length > 200 && toggleMessageExpand(message.id)}
              >
                {message.content.length > 200 && expandedMessageId !== message.id
                  ? `${message.content.slice(0, 200)}...`
                  : message.content}

                {message.content.length > 200 && (
                  <div
                    className={`absolute bottom-1 right-1 text-gray-500 dark:text-gray-400 
                      ${expandedMessageId === message.id ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown size={16} />
                  </div>
                )}

                {message.attachments && renderAttachments(message.attachments)}
              </div>
            </motion.div>
          ))
        )}
      </main>

      {/* Input Area (similar to before) */}
      <div className="p-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 sticky bottom-0">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (Shift+Enter for new line)"
            className="w-full p-4 pr-16 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-blue-500 resize-none overflow-hidden min-h-[48px] max-h-[200px] text-base dark:bg-gray-900 dark:text-white"
            rows={1}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Paperclip size={20} />
            </button>
            {inputText.trim() && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                type="submit"
                className="bg-black dark:bg-white text-white dark:text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                <Send size={20} />
              </motion.button>
            )}
          </div>
        </form>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          Shift+Enter for new line • Enter to send
        </div>
      </div>

      {/* Chat History Modal (similar to before) */}
      <AnimatePresence>
        {showChatHistory && <ChatHistoryModal />}
      </AnimatePresence>
    </div>
  );
};

export default KeyMapChat;