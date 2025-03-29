"use client"
import { useStateValue } from '@/global/state.provider'
import { cx } from '@/lib/utils'
import React, { useEffect, useRef } from 'react'
import { FaDatabase } from "react-icons/fa"
import { SiMongodb } from "react-icons/si"

type Props = {}

const TextAreaFragment = (props: Props) => {
    const { state: { user }, dispatch } = useStateValue()
    const [message, setMessage] = React.useState<string>('')
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [schemaType, setSchemaType] = React.useState<'sql' | 'nosql'>('sql')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const placeholderTemplates: Array<string> = [
        'What\'s on your mind, ' + user?.firstName + '?',
        'What do you want to talk about ' + user?.firstName + '?',
        'What\'s the tea today ' + user?.firstName + '?',
        'What\'s the scoop, ' + user?.firstName + '?',
        'What do you wanna build today ' + user?.firstName + '?',
    ]

    const randomPlaceholder = placeholderTemplates[Math.floor(Math.random() * placeholderTemplates.length)]
    const [placeholder, setPlaceholder] = React.useState<string>(randomPlaceholder)

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        const scrollPos = textarea.scrollTop

        textarea.style.height = 'auto'

        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20

        const textRows = Math.max(1, Math.ceil(textarea.scrollHeight / lineHeight))

        const visibleRows = Math.min(textRows, 10)

        const newHeight = visibleRows * lineHeight
        textarea.style.height = `${newHeight}px`

        textarea.style.overflowY = textRows > 10 ? 'auto' : 'hidden'

        textarea.scrollTop = scrollPos
    }

    useEffect(() => {
        adjustTextareaHeight()
    }, [message])

    useEffect(() => {
        adjustTextareaHeight()

        window.addEventListener('resize', adjustTextareaHeight)
        return () => window.removeEventListener('resize', adjustTextareaHeight)
    }, [])

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const handleSubmit = () => {
        if (message.trim() && !isLoading) {
            setIsLoading(true)
            console.log(`Sending message with schema type: ${schemaType}`, message)

            setTimeout(() => {
                setMessage('')
                setIsLoading(false)

                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto'
                        adjustTextareaHeight()
                    }
                }, 10)
            }, 1000)
        }
    }

    const toggleSchemaType = () => {
        setSchemaType(prev => prev === 'sql' ? 'nosql' : 'sql')
    }

    return (
        <div
            className="fixed bottom-4 border hover:shadow-sm backdrop-blur-sm border-gray-200 w-full max-w-3xl z-10 left-1/2 transform -translate-x-1/2 rounded-xl mx-auto px-4 py-3"
        >
            <div className="flex flex-col">
                {/* Textarea with fixed layout to prevent distortion */}
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
                                e.preventDefault()
                                handleSubmit()
                            }
                        }}
                    />
                </div>

                {/* Fixed-height footer to prevent distortion */}
                <div className="flex items-center justify-between mt-2 h-8">
                    <div className="text-xs text-gray-500 gap-2 flex ">

                        <span className={'px-2 py-1 text-xs mono rounded-lg bg-zinc-100'}> Enter + Shift</span>
                        <span className={'px-2 py-1 text-xs mono rounded-lg bg-zinc-100'}> Enter</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Browser Option Button */}
                        <button
                            onClick={() => setPlaceholder(randomPlaceholder)}
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
    )
}

const ChatRoomFragment = (props: Props) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4">
            {/* Message Thread */}
            <div className="">
                Messages
            </div>

            {/* Textarea */}
            <TextAreaFragment />

        </div>
    )
}

export { ChatRoomFragment, TextAreaFragment }