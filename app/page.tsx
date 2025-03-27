"use client"
import Image from "next/image";
import AuthenticatorFragment from "./auth/page";
import { useState } from "react";
import { cx } from "@/lib/utils";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isDark, setIsDark] = useState(false)

  const handleSubmit = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const newMessage = { role: "user", content: input }
      setMessages([...messages, newMessage])
      setInput("")
      // Simulate bot response (replace with your logic)
      setTimeout(() => {
        setMessages((prev: any) => [
          ...prev,
          { role: "bot", content: `Schema response: ${input}` },
        ])
      }, 500)
    }
  }

  return (
    <AuthenticatorFragment>
      <div className={cx("flex flex-col h-screen", isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800")}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-medium font-syne">Gigschema</h1>
          <div className="flex gap-2">
            <button onClick={() => setIsDark(!isDark)} className="p-2">
              {isDark ? "☀️" : "🌙"}
            </button>
            <button className="p-2">?</button>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cx(
                "mb-4 p-3 rounded-lg max-w-[80%]",
                msg.role === "user" ? "ml-auto bg-gray-100" : "bg-white shadow"
              )}
            >
              {msg.content.includes("schema") ? (
                <pre className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {msg.content}
                </pre>
              ) : (
                msg.content
              )}
            </div>
          ))}
        </main>

        {/* Input */}
        <footer className="p-4 border-t">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Ask about schemas..."
            className={cx(
              "w-full p-3 rounded-lg resize-none focus:outline-none",
              isDark ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-800"
            )}
            rows={3}
          />
        </footer>
      </div>
    </AuthenticatorFragment>
  );
}
