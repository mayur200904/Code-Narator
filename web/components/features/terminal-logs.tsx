"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react"

const LOG_MESSAGES = [
    "Cloning repository...",
    "Analyzing file structure...",
    "Parsing dependencies...",
    "Identifying core abstractions...",
    "Generating flow diagrams...",
    "Writing chapter content...",
    "Compiling artifacts...",
    "Optimizing output...",
]

export function TerminalLogs({ status }: { status: string }) {
    const [logs, setLogs] = useState<string[]>(["> Initializing system..."])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (status !== "processing") return

        let i = 0
        const interval = setInterval(() => {
            if (i < LOG_MESSAGES.length) {
                setLogs(prev => [...prev, `> ${LOG_MESSAGES[i]}`])
                i++
            } else {
                // Rotate a "processing" indicator instead of adding lines
                setLogs(prev => {
                    const last = prev[prev.length - 1]
                    if (last.startsWith("> Processing complex nodes")) {
                        if (last.endsWith("...")) return [...prev.slice(0, -1), "> Processing complex nodes"]
                        return [...prev.slice(0, -1), last + "."]
                    }
                    return [...prev, "> Processing complex nodes..."]
                })
            }

            // Auto-scroll
            if (scrollRef.current) {
                const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
                if (scrollElement) scrollElement.scrollTop = scrollElement.scrollHeight
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [status])

    useEffect(() => {
        if (status === "completed") {
            setLogs(prev => [...prev, "> Process Completed Successfully.", "> Artifacts Ready."])
        }
    }, [status])

    return (
        <div className="w-full bg-black border border-zinc-800 rounded-lg p-2 font-mono text-xs text-green-400 h-48 flex flex-col shadow-inner">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-600 ml-2">TERMINAL</span>
            </div>
            <ScrollArea className="flex-1 px-2" viewportRef={scrollRef}>
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                    {status === "processing" && (
                        <div className="animate-pulse">_</div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
