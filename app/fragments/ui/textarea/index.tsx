"use client"
import { useStateValue } from '@/global/state.provider'
import { cx } from '@/lib/utils'
import React, { useEffect, useRef, useState } from 'react'
import { FaDatabase } from "react-icons/fa"
import { SiMongodb } from "react-icons/si"
import { BsCodeSlash } from "react-icons/bs"
import { FiChevronDown, FiChevronUp, FiCopy } from "react-icons/fi"

type MessageType = {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    schema?: {
        type: 'sql' | 'nosql';
        data: any;
    }
}

const EntityTable = ({ data, schemaType }: { data: any, schemaType: 'sql' | 'nosql' }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return null;
    }

    const isArray = Array.isArray(data);
    const sampleItem = isArray ? data[0] : data;
    const keys = Object.keys(sampleItem || {});

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mt-2 mb-4 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                    {schemaType === 'sql' ? (
                        <FaDatabase size={16} className="text-blue-500 mr-2" />
                    ) : (
                        <SiMongodb size={16} className="text-green-500 mr-2" />
                    )}
                    <h3 className="font-medium text-sm">
                        {schemaType === 'sql' ? 'SQL Schema' : 'NoSQL Document'}
                        {isArray && ` (${data.length} items)`}
                    </h3>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded hover:bg-gray-200"
                    >
                        {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {keys.map((key) => (
                                    <th
                                        key={key}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isArray ? (
                                data.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {keys.map((key) => (
                                            <td key={`${idx}-${key}`} className="px-4 py-2 text-sm text-gray-900">
                                                {typeof item[key] === 'object'
                                                    ? JSON.stringify(item[key]).slice(0, 50) + (JSON.stringify(item[key]).length > 50 ? '...' : '')
                                                    : String(item[key] || '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr className="hover:bg-gray-50">
                                    {keys.map((key) => (
                                        <td key={key} className="px-4 py-2 text-sm text-gray-900">
                                            {typeof data[key] === 'object'
                                                ? JSON.stringify(data[key]).slice(0, 50) + (JSON.stringify(data[key]).length > 50 ? '...' : '')
                                                : String(data[key] || '')}
                                        </td>
                                    ))}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const CodeArtifact = ({ code, language }: { code: string, language: string }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-50 rounded-lg overflow-hidden my-3 border border-gray-200">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center">
                    <BsCodeSlash className="mr-2 text-gray-700" />
                    <span className="text-xs font-medium text-gray-700">{language || 'Code'}</span>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors flex items-center text-xs"
                >
                    <FiCopy size={14} className="mr-1" />
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto bg-gray-50 text-sm">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const DocumentPreview = ({ content, title, onRemove }: { content: string, title: string, onRemove: () => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const previewContent = isExpanded ? content : content.slice(0, 300) + (content.length > 300 ? '...' : '');

    return (
        <div className="bg-gray-50 rounded-lg overflow-hidden my-3 border border-gray-200">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">{title || 'Document'}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={onRemove}
                        className="text-gray-500 hover:text-red-500 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        title="Remove document"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                </div>
            </div>
            <div className={cx(
                "p-4 text-xs whitespace-pre-wrap mono font-mono text-gray-800",
                isExpanded ? "max-h-96 overflow-y-auto" : ""
            )}>
                {previewContent}
                {content.length > 300 && !isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                        Show more
                    </button>
                )}
            </div>
        </div>
    );
};

const MessageComponent = ({ message }: { message: MessageType }) => {
    return (
        <div className={cx(
            "py-6 flex flex-col",
            message.sender === 'user' ? "bg-white" : "bg-gray-50"
        )}>
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6">
                <div className="flex items-start">
                    <div className={cx(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1",
                        message.sender === 'user' ? "bg-gray-200" : "bg-emerald-100"
                    )}>
                        {message.sender === 'user' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                            </svg>
                        )}
                    </div>

                    <div className="flex-grow">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                            {message.sender === 'user' ? 'You' : 'AI Assistant'}
                        </div>

                        {message.schema && (
                            <div className="mb-4">
                                <EntityTable data={message.schema.data} schemaType={message.schema.type} />
                            </div>
                        )}

                        <div className="prose prose-sm max-w-none">
                            {message.content.split('```').map((part, index) => {
                                if (index % 2 === 0) {
                                    return <p key={index}>{part}</p>;
                                } else {
                                    const [language, ...codeParts] = part.split('\n');
                                    const code = codeParts.join('\n');
                                    return <CodeArtifact key={index} code={code} language={language} />;
                                }
                            })}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const generateAIResponse = (message: string, schemaType: 'sql' | 'nosql'): MessageType => {
    const lowerMessage = message.toLowerCase();
    let aiContent = "I'm not sure how to respond to that.";
    let schemaData = null;

    if (lowerMessage.includes('select') && lowerMessage.includes('from')) {
        aiContent = "I've executed your SQL query and here are the results:";
        schemaData = [
            { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
            { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
            { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" }
        ];
    }
    else if (lowerMessage.includes('find(') || lowerMessage.includes('aggregate(')) {
        aiContent = "Here are the results from your MongoDB query:";
        schemaData = [
            { _id: "61fcae3db2d3a72d8c0b83f1", name: "John Doe", email: "john@example.com", tags: ["admin", "manager"] },
            { _id: "61fcae3db2d3a72d8c0b83f2", name: "Jane Smith", email: "jane@example.com", tags: ["user"] },
        ];
    }
    else if (lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('javascript')) {
        aiContent = "Here's a simple JavaScript function that might help:\n\n```javascript\nfunction processData(data) {\n  return data.map(item => {\n    return {\n      ...item,\n      processed: true,\n      timestamp: new Date()\n    };\n  });\n}\n```\n\nYou can use this function to process your data arrays.";
    }
    else {
        const responses = [
            "I understand you're working on a chat interface. What specific functionality would you like help with?",
            "Your UI design is coming along nicely. Would you like suggestions on improving the user experience?",
            "That's an interesting approach. Have you considered implementing typing indicators to make the chat feel more dynamic?",
            "I'd be happy to help with that. Could you provide more specific requirements?"
        ];
        aiContent = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
        id: Date.now().toString(),
        content: aiContent,
        sender: 'ai',
        timestamp: new Date(),
        schema: schemaData ? {
            type: schemaType,
            data: schemaData
        } : undefined
    };
};

const TextAreaFragment = () => {
    const { state: { user }, dispatch } = useStateValue();
    const [message, setMessage] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [schemaType, setSchemaType] = React.useState<'sql' | 'nosql'>('sql');
    const [messages, setMessages] = React.useState<MessageType[]>([]);
    const [pastedContent, setPastedContent] = React.useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const placeholderTemplates: Array<string> = [
        'What\'s on your mind, ' + (user?.firstName || 'there') + '?',
        'What do you want to talk about ' + (user?.firstName || 'today') + '?',
        'What\'s the tea today ' + (user?.firstName || 'friend') + '?',
        'What\'s the scoop, ' + (user?.firstName || 'buddy') + '?',
        'What do you wanna build today ' + (user?.firstName || 'developer') + '?',
    ];

    const randomPlaceholder = placeholderTemplates[Math.floor(Math.random() * placeholderTemplates.length)];
    const [placeholder, setPlaceholder] = React.useState<string>(randomPlaceholder);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const scrollPos = textarea.scrollTop;

        textarea.style.height = 'auto';

        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;

        const textRows = Math.max(1, Math.ceil(textarea.scrollHeight / lineHeight));

        const visibleRows = Math.min(textRows, 10);

        const newHeight = visibleRows * lineHeight;
        textarea.style.height = `${newHeight}px`;

        textarea.style.overflowY = textRows > 10 ? 'auto' : 'hidden';

        textarea.scrollTop = scrollPos;
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [message]);

    useEffect(() => {
        adjustTextareaHeight();

        window.addEventListener('resize', adjustTextareaHeight);
        return () => window.removeEventListener('resize', adjustTextareaHeight);
    }, []);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    const handleSubmit = () => {
        if (message.trim() && !isLoading) {
            setIsLoading(true);

            const userMessage: MessageType = {
                id: Date.now().toString(),
                content: message,
                sender: 'user',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, userMessage]);

            setTimeout(() => {
                const aiResponse = generateAIResponse(message, schemaType);
                setMessages(prev => [...prev, aiResponse]);

                setMessage('');
                setIsLoading(false);
                setPastedContent(null);

                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                        adjustTextareaHeight();
                    }
                }, 10);
            }, 1500);
        }
    };

    const toggleSchemaType = () => {
        setSchemaType(prev => prev === 'sql' ? 'nosql' : 'sql');
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (pastedText.length > 100) {
            setPastedContent(pastedText);
        }
    };

    const removePastedContent = () => {
        setPastedContent(null);
    };

    return (
        <>
            {/* Message Thread */}
            <div className="pb-32">
                {messages.length === 0 ? (
                    <div className="h-[70vh] flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                            <p className="text-lg font-medium">No messages yet</p>
                            <p className="text-sm mt-1">Start a conversation by typing a message below</p>
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <MessageComponent key={msg.id} message={msg} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed at Bottom */}
            <div
                className="fixed bottom-4 border hover:shadow-sm backdrop-blur-sm border-gray-200 w-full max-w-3xl z-10 left-1/2 transform -translate-x-1/2 rounded-xl mx-auto px-4 py-3"
            >
                <div className="flex flex-col">
                    {/* Pasted Content Preview */}
                    {pastedContent && (
                        <DocumentPreview
                            content={pastedContent}
                            title="Pasted Content"
                            onRemove={removePastedContent}
                        />
                    )}

                    {/* Textarea */}
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full text-sm border-none resize-none outline-none bg-transparent ring-0 focus:ring-0 focus:border-none focus-within:border-none focus:outline-none focus-within:outline-none p-0 pr-4"
                            placeholder={placeholder}
                            value={message}
                            onChange={handleMessageChange}
                            onPaste={handlePaste}
                            rows={1}
                            spellCheck={false}
                            style={{
                                outline: 'none',
                                boxShadow: 'none',
                                minHeight: '24px',
                                maxHeight: '200px',
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-2 h-8">
                        <div className="text-xs text-gray-500 gap-2 flex ">
                            <span className={'px-2 py-1 text-xs mono rounded-lg bg-zinc-100'}> Enter + Shift</span>
                            <span className={'px-2 py-1 text-xs mono rounded-lg bg-zinc-100'}> Enter</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Change Placeholder Button */}
                            <button
                                onClick={() => setPlaceholder(placeholderTemplates[Math.floor(Math.random() * placeholderTemplates.length)])}
                                className="flex items-center justify-center p-2 border border-dotted rounded-full hover:bg-gray-100 transition-colors"
                                title="Change placeholder"
                                style={{ flexShrink: 0, width: '32px', height: '32px' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                                </svg>
                            </button>

                            {/* Schema Type Toggle Button */}
                            <button
                                onClick={toggleSchemaType}
                                className="flex items-center justify-center p-2 border border-dotted rounded-full hover:bg-gray-100 transition-colors"
                                title={`Current schema: ${schemaType}`}
                                style={{ flexShrink: 0, width: '32px', height: '32px' }}
                            >
                                {schemaType === 'sql' ? (
                                    <FaDatabase size={18} className="text-blue-500" />
                                ) : (
                                    <SiMongodb size={18} className="text-green-500" />
                                )}
                            </button>

                            {/* Send Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!message.trim() || isLoading}
                                className={cx(
                                    "rounded-full flex items-center justify-center",
                                    message.trim() && !isLoading
                                        ? "bg-[#212a20] text-white hover:bg-opacity-80 transition-colors"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                )}
                                style={{ flexShrink: 0, width: '32px', height: '32px' }}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 2L11 13"></path>
                                        <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const ChatRoomFragment = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 relative">
            <TextAreaFragment />
        </div>
    );
};

export { ChatRoomFragment, TextAreaFragment, EntityTable, DocumentPreview, CodeArtifact };