"use client"
import { Button } from '@/components/button'
import { notifier } from '@/components/notifier'
import { useStateValue } from '@/global/state.provider'
import { cx } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { BsCodeSlash } from "react-icons/bs"
import { FaDatabase } from "react-icons/fa"
import { FiChevronDown, FiChevronUp, FiCopy, FiMaximize } from "react-icons/fi"
import { SiMongodb } from "react-icons/si"

import { ContinueConversation, GetProject } from '@/app/api/services/project.service'
import LoaderFragment from '../loader'

type MessageType = {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    schema?: {
        type: 'sql' | 'nosql';
        data: any // eslint-disable-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any   
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
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const detectCode = (content: string) => {
        const parts: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
        const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
        let lastIndex = 0;
        let match;

        while ((match = codeRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.slice(lastIndex, match.index)
                });
            }

            const language = match[1]?.trim() || 'plaintext';
            const codeContent = match[2]?.trim() || '';

            parts.push({
                type: 'code',
                language,
                content: codeContent
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
    };

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

const processLargeContent = (content: string): NonNullable<MessageType['artifacts']>[0] | null => {
    if (!content || content.length < 500) return null;

    let type: 'text' | 'code' | 'json' | 'sql' | 'nosql' = 'text';
    let language: string | undefined = undefined;
    let title = 'Large Text';

    try {
        const jsonData = JSON.parse(content);
        type = 'json';
        language = 'json';
        title = 'JSON Data';

        if (
            typeof jsonData === 'object' &&
            !Array.isArray(jsonData) &&
            jsonData !== null &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(jsonData).some((val: any) =>
                typeof val === 'object' && (val.type || val.ref)
            )
        ) {
            title = 'Database Schema (JSON)';
        }
    } catch (e) {
        console.error('Invalid JSON:', e);
        if (
            /CREATE\s+TABLE/i.test(content) ||
            /SELECT\s+.*\s+FROM/i.test(content) ||
            /INSERT\s+INTO/i.test(content) ||
            /UPDATE\s+.*\s+SET/i.test(content) ||
            /ALTER\s+TABLE/i.test(content) ||
            content.includes(';') &&
            (content.includes('SELECT') || content.includes('FROM') || content.includes('WHERE'))
        ) {
            type = 'sql';
            language = 'sql';
            title = 'SQL Query';

            if (/CREATE\s+TABLE/i.test(content)) {
                title = 'SQL Schema';
            }
        }
        else if (
            content.includes('function ') ||
            content.includes('class ') ||
            content.includes('import ') ||
            content.includes('const ') ||
            content.includes('let ') ||
            content.includes('var ') ||
            content.includes('def ') ||
            content.includes('public ') ||
            content.includes('private ') ||
            content.includes('return ') ||
            (content.includes('{') && content.includes('}'))
        ) {
            type = 'code';

            if (content.includes('function') || content.includes('const') || content.includes('let') || content.includes('var')) {
                language = 'javascript';
                title = 'JavaScript Code';
            } else if (content.includes('import ') && content.includes('from ')) {
                language = 'typescript';
                title = 'TypeScript Code';
            } else if (content.includes('def ') || content.includes('print(') || content.includes('import ') && !content.includes('from ')) {
                language = 'python';
                title = 'Python Code';
            } else if (content.includes('class ') && (content.includes('public ') || content.includes('private '))) {
                language = 'java';
                title = 'Java Code';
            } else {
                language = 'plaintext';
                title = 'Code Snippet';
            }
        }
    }

    return {
        id: `artifact-${Date.now()}`,
        title,
        content,
        type,
        language,
    };
};

const detectCode = (content: string) => {
    const parts: Array<{ type: 'text' | 'code', content: string, language?: string }> = [];
    const codeRegex = /```(.*?)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        const language = match[1]?.trim() || 'plaintext';
        const codeContent = match[2]?.trim() || '';

        parts.push({
            type: 'code',
            language,
            content: codeContent
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
};

const processAIMessage = (message: MessageType): MessageType => {
    if (message.sender !== 'ai') return message;

    const contentParts = detectCode(message.content);
    let cleanedContent = '';
    const artifacts: NonNullable<MessageType['artifacts']> = message.artifacts || [];

    contentParts.forEach((part, index) => {
        if (part.type === 'text') {
            cleanedContent += part.content;
        } else if (part.type === 'code') {
            const codeContent = part.content;
            const language = part.language || 'plaintext';

            if (language === 'sql' || /CREATE\s+TABLE/i.test(codeContent) || /SELECT\s+.*\s+FROM/i.test(codeContent)) {
                artifacts.push({
                    id: `${message.id}-sql-${index}`,
                    title: 'SQL Query',
                    content: codeContent,
                    type: 'sql',
                    language: 'sql',
                });
                cleanedContent += `\n[SQL Query]\n`;
            }
            else if (language === 'json') {
                try {
                    JSON.parse(codeContent);
                    artifacts.push({
                        id: `${message.id}-json-${index}`,
                        title: 'JSON Data',
                        content: codeContent,
                        type: 'json',
                        language: 'json',
                    });
                    cleanedContent += `\n[JSON Data]\n`;
                } catch (e) {
                    console.error('Invalid JSON:', e);
                    artifacts.push({
                        id: `${message.id}-code-${index}`,
                        title: `${language.charAt(0).toUpperCase() + language.slice(1)} Code`,
                        content: codeContent,
                        type: 'code',
                        language,
                    });
                    cleanedContent += `\n[Code Snippet]\n`;
                }
            }
            else {
                artifacts.push({
                    id: `${message.id}-code-${index}`,
                    title: `${language.charAt(0).toUpperCase() + language.slice(1)} Code`,
                    content: codeContent,
                    type: 'code',
                    language,
                });
                cleanedContent += `\n[Code Snippet]\n`;
            }
        }
    });

    if (artifacts.length === 0 && message.content.length > 500) {
        const processed = processLargeContent(message.content);
        if (processed) {
            artifacts.push(processed);
            cleanedContent = `Here's some content I've processed for you:`;
        }
    }

    return {
        ...message,
        content: cleanedContent.trim(),
        artifacts
    };
};


const TextAreaFragment = () => {
    const { state: { user, currentConversation, currentProject }, dispatch } = useStateValue();
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [schemaType, setSchemaType] = useState<'sql' | 'nosql'>(currentProject?.schemaType || 'sql');
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<Array<{ id: string, title: string, content: string }>>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const token = localStorage.getItem('token') || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapToMessageType = (msg: any): MessageType => {
        const baseMessage: MessageType = {
            id: msg._id || Date.now().toString(),
            content: msg.content || '',
            sender: msg.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(msg.timestamp || Date.now()),
            schema: undefined,
            artifacts: msg.artifacts || [],
        };

        if (baseMessage.sender === 'user') {
            if (baseMessage.content.length > 500) {
                const processed = processLargeContent(baseMessage.content);
                if (processed) {
                    baseMessage.artifacts = [...(baseMessage.artifacts || []), processed];
                    baseMessage.content = "I've shared some content for you to analyze.";
                }
            }
        } else {
            const processedMessage = processAIMessage(baseMessage);
            return processedMessage;
        }

        return baseMessage;
    };

    useEffect(() => {
        if (currentConversation && currentConversation.length > 0) {
            const mappedMessages = currentConversation.map(mapToMessageType);
            setMessages(mappedMessages);
        } else {
            setMessages([]);
        }
    }, [currentConversation]);

    const placeholderTemplates: Array<string> = [
        `What's on your mind, ${user?.firstName || 'there'}?`,
        `What do you want to talk about ${user?.firstName || 'today'}?`,
        `What's the tea today ${user?.firstName || 'friend'}?`,
        `What's the scoop, ${user?.firstName || 'buddy'}?`,
        `What do you wanna build today ${user?.firstName || 'developer'}?`,
    ];

    const randomPlaceholder = placeholderTemplates[Math.floor(Math.random() * placeholderTemplates.length)];
    const [placeholder, setPlaceholder] = useState<string>(randomPlaceholder);

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
                            content: event.target?.result as string ?? '',
                        },
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

        textarea.style.height = 'auto';
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
        const textRows = Math.max(1, Math.ceil(textarea.scrollHeight / lineHeight));
        const visibleRows = Math.min(textRows, 10);
        const newHeight = visibleRows * lineHeight;
        textarea.style.height = `${newHeight}px`;
        textarea.style.overflowY = textRows > 10 ? 'auto' : 'hidden';
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [message, selectedDocuments]);

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
    };

    const handleSubmit = async () => {
        if (!message.trim() && selectedDocuments.length === 0 || !currentProject?._id || !token || isLoading) return;

        setIsLoading(true);

        const userMessage: MessageType = {
            id: Date.now().toString(),
            content: message.trim() || '',
            sender: 'user',
            timestamp: new Date(),
        };

        const artifacts: NonNullable<MessageType['artifacts']> = [];
        if (message.length > 500) {
            const processed = processLargeContent(message);
            if (processed) {
                artifacts.push(processed);
                userMessage.content = message.trim() ? "I've shared some content for you to analyze." : '';
            }
        }
        if (selectedDocuments.length > 0) {
            const documentArtifacts = selectedDocuments.map(doc => {
                const processed = processLargeContent(doc.content) || {
                    id: doc.id,
                    title: doc.title,
                    content: doc.content,
                    type: 'text' as const,
                };
                return processed;
            });
            artifacts.push(...documentArtifacts);
            if (!message.trim()) {
                userMessage.content = `I've shared ${documentArtifacts.length} document${documentArtifacts.length > 1 ? 's' : ''} for your review.`;
            }
        }
        if (artifacts.length > 0) {
            userMessage.artifacts = artifacts;
        }

        setMessages(prev => [...prev, userMessage]);
        dispatch({
            type: 'SET_CURRENT_CONVERSATION',
            payload: [...(currentConversation || []), { role: 'user', content: userMessage.content }],
        });

        try {
            await ContinueConversation(
                currentProject._id,
                { message: userMessage.content, schemaType },
                token,
                setIsLoading,
                (response) => {
                    const updatedProject = response.project;
                    const updatedMessages = updatedProject?.messages || [];
                    const mappedMessages = updatedMessages.map(mapToMessageType);

                    dispatch({
                        type: 'SET_CURRENT_PROJECT',
                        payload: updatedProject || null,
                    });
                    dispatch({
                        type: 'SET_CURRENT_CONVERSATION',
                        payload: updatedMessages,
                    });
                    setMessages(mappedMessages);
                }
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            notifier.error('Failed to continue conversation', error.message);
        } finally {
            setMessage('');
            setSelectedDocuments([]);
            setIsLoading(false);
            adjustTextareaHeight();
        }
    };

    const toggleSchemaType = () => {
        setSchemaType(prev => (prev === 'sql' ? 'nosql' : 'sql'));
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
            <div className="fixed bottom-4 border hover:shadow-sm bg-white border-gray-200 w-full max-w-3xl z-10 left-1/2 transform -translate-x-1/2 rounded-xl mx-auto px-4 py-3">
                <div className="flex flex-col">
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

                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full text-sm border-none resize-none outline-none bg-transparent ring-0 focus:ring-0 focus:border-none focus-within:border-none focus:outline-none focus-within:outline-none p-0 pr-4"
                            placeholder={placeholder}
                            value={message}
                            onChange={handleMessageChange}
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

                    <div className="flex items-center justify-between mt-2 h-8">
                        <div className="text-xs text-gray-500 gap-2 flex">
                            <span className="px-2 py-1 text-xs mono rounded-lg bg-zinc-100 border border-gray-300">Enter + Shift</span>
                            <span className="px-2 py-1 text-xs mono rounded-lg bg-zinc-100 border border-gray-300">Enter</span>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center p-2 border border-dotted rounded-full hover:bg-gray-100 transition-colors"
                                title="Upload file"
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

                            <button
                                onClick={handleSubmit}
                                disabled={(!message.trim() && selectedDocuments.length === 0) || isLoading}
                                className={cx(
                                    "rounded-full flex items-center justify-center",
                                    (message.trim() || selectedDocuments.length > 0) && !isLoading
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
    const { state: { currentProject }, dispatch } = useStateValue();
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('token');
            setToken(storedToken);
        }
    }, []);

    useEffect(() => {
        const fetchProject = async () => {
            if (!currentProject?._id || !token) return;

            setIsLoading(true);
            try {
                await GetProject(
                    currentProject._id,
                    token,
                    setIsLoading,
                    (data) => {
                        if (data && data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
                            const project = data.projects[0];
                            dispatch({
                                type: 'SET_CURRENT_PROJECT',
                                payload: project,
                            });
                            dispatch({
                                type: 'SET_CURRENT_CONVERSATION',
                                payload: project.messages || [],
                            });
                        }
                    }
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error('Failed to fetch project:', error.message);
                dispatch({
                    type: 'SET_ERROR',
                    payload: { name: 'FetchProjectError', message: error.message },
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [currentProject?._id, token, dispatch]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 relative">
            {isLoading && <LoaderFragment />}
            <TextAreaFragment />
        </div>
    );
};

export { ChatRoomFragment, CodeArtifact, DocumentPreview, EntityTable, TextAreaFragment }
