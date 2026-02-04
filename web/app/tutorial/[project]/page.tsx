"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getArtifacts, API_BASE } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Loader2, FileText, ChevronLeft, Menu } from "lucide-react"
import Link from "next/link"
import { Mermaid } from "@/components/ui/mermaid"

export default function TutorialViewer() {
    // params might be a Promise in newer Next.js server components, but this is a Client Component utilizing useParams
    const params = useParams()
    const projectName = params.project as string

    const [files, setFiles] = useState<string[]>([])
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [content, setContent] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [contentLoading, setContentLoading] = useState(false)

    // Fetch file list
    useEffect(() => {
        if (!projectName) return

        getArtifacts(projectName).then((data) => {
            if (data && data.files) {
                // Sort files: index.md first, then by name
                const sorted = data.files.sort((a: string, b: string) => {
                    if (a === "index.md") return -1
                    if (b === "index.md") return 1
                    return a.localeCompare(b)
                })
                setFiles(sorted)
                if (sorted.length > 0) setSelectedFile(sorted[0])
            }
            setLoading(false)
        })
    }, [projectName])

    // Fetch content
    useEffect(() => {
        if (!projectName || !selectedFile) return

        setContentLoading(true)
        fetch(`${API_BASE}/output/${projectName}/${selectedFile}`)
            .then(res => res.text())
            .then(text => {
                setContent(text)
                setContentLoading(false)
            })
            .catch(err => {
                setContent("Error loading file.")
                setContentLoading(false)
            })
    }, [projectName, selectedFile])

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin h-8 w-8 text-cyan-500" /></div>
    }

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
                <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                    <Link href="/" className="hover:bg-zinc-800 p-2 rounded-full transition-colors">
                        <ChevronLeft className="h-5 w-5 text-zinc-400" />
                    </Link>
                    <div>
                        <h2 className="font-semibold text-sm text-zinc-200">Documentation</h2>
                        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 mt-1">{projectName}</Badge>
                    </div>
                </div>
                <ScrollArea className="flex-1 overflow-hidden">
                    <div className="p-2 space-y-1">
                        {files.map(file => (
                            <Button
                                key={file}
                                variant={selectedFile === file ? "secondary" : "ghost"}
                                className={`w-full justify-start text-sm font-normal truncate ${selectedFile === file ? 'bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/30' : 'text-zinc-400 hover:text-zinc-200'}`}
                                onClick={() => setSelectedFile(file)}
                            >
                                <FileText className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <span className="truncate">{file.replace(/_/g, " ").replace(".md", "")}</span>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-black">
                <div className="h-16 border-b border-zinc-800 flex items-center px-8 shrink-0">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate">
                        {selectedFile?.replace(/_/g, " ").replace(".md", "") || "Select a chapter"}
                    </h1>
                </div>
                <ScrollArea className="flex-1 p-8 overflow-hidden">
                    {contentLoading ? (
                        <div className="flex items-center justify-center h-40 text-zinc-500">Loading content...</div>
                    ) : (
                        <article className="prose prose-invert prose-zinc max-w-4xl mx-auto pb-20">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || "")
                                        const isMermaid = match && match[1] === "mermaid"

                                        if (!inline && isMermaid) {
                                            return <Mermaid chart={String(children).replace(/\n$/, "")} />
                                        }

                                        return (
                                            <code className={`${className} bg-zinc-800/80 rounded px-1 py-0.5 text-red-200 font-mono text-sm`} {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    pre({ node, children, ...props }: any) {
                                        return (
                                            <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto my-4" {...props}>
                                                {children}
                                            </pre>
                                        )
                                    },
                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-white" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-cyan-400 border-b border-zinc-800 pb-2" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-6 mb-3 text-purple-400" {...props} />,
                                    p: ({ node, ...props }) => <p className="leading-7 mb-4 text-zinc-300" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-zinc-300" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-zinc-300" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-zinc-400 my-4 bg-zinc-900/30 py-2 pr-2 rounded-r" {...props} />,
                                    a: ({ node, ...props }) => <a className="text-cyan-400 hover:underline hover:text-cyan-300 transition-colors" {...props} />,
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </article>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
