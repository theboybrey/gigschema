"use client"
import Image from "next/image";
import AuthenticatorFragment from "./auth/page";
import { useState } from "react";
import { cx } from "@/lib/utils";
import AssitantFragmeent from "./fragments/ui/assistant";

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
      <AssitantFragmeent />
    </AuthenticatorFragment>
  );
}
