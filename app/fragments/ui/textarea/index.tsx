"use client"
import { useStateValue } from '@/global/state.provider'
import { cx } from '@/lib/utils'
import React, { useEffect, useRef, useState } from 'react'
import { FaDatabase } from "react-icons/fa"
import { SiMongodb } from "react-icons/si"
import { BsCodeSlash } from "react-icons/bs"
import { FiChevronDown, FiChevronUp, FiCopy, FiMaximize } from "react-icons/fi"
import { AnimatePresence, motion } from 'framer-motion'
import { notifier } from '@/components/notifier'
import { Button } from '@/components/button'

type MessageType = {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    schema?: {
        type: 'sql' | 'nosql';
        data: any;
    }
    artifacts?: Array<{
        id: string
        title: string
        content: string
        type: 'text' | 'code' | 'json' | 'sql' | 'nosql'
        language?: string
    }>
}

const ArtifactModal = ({
    artifact,
    isOpen,
    onClose,
    onSave
}: {
    artifact: NonNullable<MessageType['artifacts']>[0],
    isOpen: boolean,
    onClose: () => void,
    onSave: (id: string, content: string) => void
}) => {
    const [editableContent, setEditableContent] = useState(artifact.content);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEditableContent(artifact.content);
    }, [artifact.content]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSave = () => {
        onSave(artifact.id, editableContent);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        ref={modalRef}
                        className="bg-white rounded-lg shadow-xl mono font-mono  max-w-4xl w-full max-h-[90vh] flex flex-col"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center">
                                {artifact.type === 'code' && <BsCodeSlash className="mr-2 text-gray-700" />}
                                {artifact.type === 'json' && <FaDatabase className="mr-2 text-purple-500" />}
                                {artifact.type === 'text' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                                <h3 className="font-normal text-gray-600">{artifact.title}</h3>
                                {artifact.language && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full capitalize">
                                        {artifact.language}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-grow overflow-auto p-4">
                            <textarea
                                value={editableContent}
                                onChange={(e) => setEditableContent(e.target.value)}
                                className="w-full h-full min-h-[400px] font-mono mono text-sm text-gray-600 p-4 resize-none bg-zinc-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-transparent"
                                spellCheck={false}
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex gap-2 justify-between items-center">
                            <p className='w-full'>
                                <span className="text-xs text-gray-500 font-syne">Press <span className="font-semibold mono p-1 rounded-lg border border-gray-300 bg-gray-100">Ctrl</span> + <span className="font-semibold mono p-1 rounded-lg border border-gray-300 bg-gray-100">Enter</span> to save changes</span>
                            </p>

                            <div className="w-full items-center flex justify-end gap-2">
                                <Button
                                    variant='destructive'
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded-lg font-normal text-sm font-sans hover:bg-opacity-95"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-500 text-sm text-white rounded-md hover:bg-blue-600 font-syne"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


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


const Artifact = ({
    artifact,
    onView
}: {
    artifact: NonNullable<MessageType['artifacts']>[0],
    onView: (artifact: NonNullable<MessageType['artifacts']>[0]) => void
}) => {
    const getIcon = () => {
        switch (artifact.type) {
            case 'code':
                return <BsCodeSlash className="text-gray-600 font-medium" />;
            case 'json':
                return <FaDatabase className="text-green-500 font-medium" />;
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(artifact.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden my-3 shadow-sm"
        >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                    {getIcon()}
                    <h3 className="font-medium text-xs capitalize ml-2 text-gray-700">{artifact.title}</h3>
                    {artifact.language && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full text-gray-600">
                            {artifact.language}
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={copyToClipboard}
                        className="text-gray-500 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200 transition-colors flex items-center text-xs"
                    >
                        <FiCopy size={14} className="mr-1" />
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                        onClick={() => onView(artifact)}
                        className="text-gray-500 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title="View/Edit content"
                    >
                        <FiMaximize size={16} />
                    </button>
                </div>
            </div>
            <div className="p-4 max-h-20 overflow-hidden relative bg-gray-50">
                <div className="text-xs mono font-mono text-gray-600 whitespace-pre-wrap line-clamp-3">
                    {artifact.content.slice(0, 150)}
                    {artifact.content.length > 150 && '...'}
                </div>
                {artifact.content.length > 150 && (
                    <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
                )}
            </div>
        </motion.div>
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
                    <span className="text-xs font-medium capitalize text-gray-700">{language || 'Code'}</span>
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
    const [selectedArtifact, setSelectedArtifact] = useState<NonNullable<MessageType['artifacts']>[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleViewArtifact(artifact: NonNullable<MessageType['artifacts']>[0]) {
        setSelectedArtifact(artifact);
        setIsModalOpen(true);
    }

    function handleSaveArtifact(id: string, content: string) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            notifier.progress(`Uploading ${selectedArtifact?.title}...`, progress);

            if (progress >= 100) {
                clearInterval(interval);
                notifier.success(`${selectedArtifact?.title} successfuly saved.`, "Successfully uploaded");
            }
        }, 150);

        if (selectedArtifact) {
            setSelectedArtifact(prev => prev ? { ...prev, content } : null);
        }
    }

    function detectCode(content: string) {
        const parts = []
        const codeRegex = /```(.*?)\n([\s\S]*?)```/g
        let lastIndex = 0
        let match

        while ((match = codeRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.slice(lastIndex, match.index)
                });
            }

            parts.push({
                type: 'code',
                language: match[1] || 'plaintext',
                content: match[2]
            });

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex)
            });
        }

        return parts;
    }

    const contentParts = detectCode(message.content);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cx(
                    "py-4 px-4",
                    message.sender === 'user' ? "bg-white" : "bg-white"
                )}
            >
                <div className="max-w-3xl mx-auto">
                    <div className={cx(
                        "flex",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                    )}>
                        <div className={cx(
                            "max-w-[80%]",
                            message.sender === 'user' ? "order-1" : "order-2"
                        )}>
                            <div className={cx(
                                "rounded-2xl p-4 mb-1 relative",
                                message.sender === 'user'
                                    ? "bg-[#E8E8E8] text-[#212a20]/90 text-sm rounded-br-none"
                                    : "bg-white border border-[#212a20]/10 text-sm rounded-bl-none"
                            )}>
                                <div className="prose prose-sm max-w-none">
                                    {contentParts.map((part, index) => {
                                        if (part.type === 'text') {
                                            return <p key={index} className="m-0">{part.content}</p>;
                                        } else {

                                            return null;
                                        }
                                    })}
                                </div>
                            </div>

                            {/* Render code artifacts below the message bubble */}
                            {contentParts.some(part => part.type === 'code') && (
                                <div className="mt-2 space-y-2">
                                    {contentParts
                                        .filter(part => part.type === 'code')
                                        .map((part, index) => (
                                            <CodeArtifact
                                                key={index}
                                                code={part.content}
                                                language={part.language ?? 'plaintext'}
                                            />
                                        ))
                                    }
                                </div>
                            )}

                            {message.schema && (
                                <div className="my-2">
                                    <EntityTable data={message.schema.data} schemaType={message.schema.type} />
                                </div>
                            )}

                            {message.artifacts && message.artifacts.length > 0 && (
                                <div className="my-2">
                                    {message.artifacts.map((artifact) => (
                                        <Artifact
                                            key={artifact.id}
                                            artifact={artifact}
                                            onView={handleViewArtifact}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className={cx(
                                "flex items-center text-xs text-gray-500 mt-1",
                                message.sender === 'user' ? "justify-end" : "justify-start"
                            )}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        <div className={cx(
                            "w-8 h-8 rounded-full flex items-center justify-center self-end mb-1",
                            message.sender === 'user'
                                ? "order-2 ml-2 bg-[#212a20]"
                                : "order-1 mr-2 bg-slate-100"
                        )}>
                            {message.sender === 'user' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#e8e8e8]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#212a20]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
            {selectedArtifact && (
                <ArtifactModal
                    artifact={selectedArtifact}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveArtifact}
                />
            )}
        </>
    );
};
const generateAIResponse = (message: string, schemaType: 'sql' | 'nosql'): MessageType => {
    const lowerMessage = message.toLowerCase();
    let aiContent = "I'm not sure how to respond to that.";
    let schemaData = null;
    let artifacts = null;

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
    } else if (lowerMessage.includes('paste') && lowerMessage.length > 500) {
        aiContent = "I've analyzed your pasted content:";
        artifacts = [
            {
                id: Date.now().toString(),
                title: "Pasted Content",
                content: message,
                type: 'text'
            }
        ];
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
        } : undefined,
        artifacts: artifacts?.map(artifact => ({
            ...artifact,
            type: artifact.type as 'text' | 'code' | 'json'
        })) || undefined
    };
};

const processLargeContent = (content: string): NonNullable<MessageType['artifacts']>[0] | null => {
    if (!content || content.length < 500) return null;

    let type: 'text' | 'code' | 'json' = 'text';
    let language: string | undefined = undefined;


    try {
        JSON.parse(content);
        type = 'json';
    } catch (e) {

        if (content.includes('function') || content.includes('class') || content.includes('import ') ||
            content.includes('const ') || content.includes('let ') || content.includes('var ')) {
            type = 'code';


            if (content.includes('function') || content.includes('const') || content.includes('let')) {
                language = 'javascript';
            } else if (content.includes('import ') && content.includes('from ')) {
                language = 'typescript';
            } else if (content.includes('def ') || content.includes('import ') && content.includes('print(')) {
                language = 'python';
            }
        }
    }

    return {
        id: Date.now().toString(),
        title: type === 'json' ? 'JSON Data' : (type === 'code' ? `${language || 'Code'} Snippet` : 'Text Content'),
        content: content,
        type: type,
        language: language
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedDocuments, setSelectedDocuments] = useState<Array<{ id: string, title: string, content: string }>>([]);

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setSelectedDocuments(prev => [
                        ...prev,
                        {
                            id: Date.now().toString() + file.name,
                            title: file.name,
                            content: event.target?.result as string
                        }
                    ]);
                }
            };
            reader.readAsText(file);
        });


        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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

    const removeDocument = (id: string) => {
        setSelectedDocuments(prev => prev.filter(doc => doc.id !== id));
    }

    const handleSubmit = () => {
        if (message.trim() && !isLoading) {
            setIsLoading(true);

            const userMessage: MessageType = {
                id: Date.now().toString(),
                content: message,
                sender: 'user',
                timestamp: new Date(),
            };

            if (message.length > 500) {
                const artifact = processLargeContent(message);
                if (artifact) {
                    userMessage.content = "I've shared some content for you to analyze.";
                    userMessage.artifacts = [artifact];
                }
            }


            if (selectedDocuments.length > 0) {
                const documentArtifacts = selectedDocuments.map(doc => {

                    const processed = processLargeContent(doc.content);
                    return {
                        id: doc.id,
                        title: doc.title,
                        content: doc.content,
                        type: processed?.type || 'text',
                        language: processed?.language
                    };
                });

                if (documentArtifacts.length > 0) {
                    if (!userMessage.artifacts) {
                        userMessage.artifacts = [];
                    }
                    userMessage.artifacts = [...userMessage.artifacts, ...documentArtifacts];


                    if (!message.trim()) {
                        userMessage.content = `I've shared ${documentArtifacts.length} document${documentArtifacts.length > 1 ? 's' : ''} for your review.`;
                    }
                }
            }

            setMessages(prev => [...prev, userMessage]);


            setTimeout(() => {
                const aiResponse = generateAIResponse(message, schemaType);
                setMessages(prev => [...prev, aiResponse]);

                setMessage('');
                setIsLoading(false);
                setPastedContent(null);
                setSelectedDocuments([]);

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
                className="fixed bottom-4 border hover:shadow-sm bg-white border-gray-200 w-full max-w-3xl z-10 left-1/2 transform -translate-x-1/2 rounded-xl mx-auto px-4 py-3"
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

                    {selectedDocuments.length > 0 && (
                        <div className="mb-2 space-y-2">
                            {selectedDocuments.map((doc) => (
                                <DocumentPreview
                                    key={doc.id}
                                    content={doc.content}
                                    title={doc.title}
                                    onRemove={() => removeDocument(doc.id)}
                                />
                            ))}
                        </div>
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
                            <span className={'px-2 py-1 text-xs mono rounded-lg bg-zinc-100 border border-gray-00'}> Enter + Shift</span>
                            <span className={'px-2 py-1 text-xs mono rounded-lg bg-zinc-100 border border-gray-300'}> Enter</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center p-2 border border-dotted rounded-full hover:bg-gray-100 transition-colors"
                                title="Change placeholder"
                                style={{ flexShrink: 0, width: '32px', height: '32px' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                </svg>
                            </button>
                            <input
                                type="file"
                                accept=".txt,.json,.csv,.js,.ts,.py,.java"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />

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