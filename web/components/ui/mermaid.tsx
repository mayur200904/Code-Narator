"use client"

import React, { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { Loader2 } from "lucide-react"

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
})

export function Mermaid({ chart }: { chart: string }) {
    const [svg, setSvg] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

    useEffect(() => {
        if (!chart) return

        setLoading(true)
        setError(false)

        // We must render asynchronously
        mermaid.render(id.current, chart)
            .then((res) => {
                setSvg(res.svg)
                setLoading(false)
            })
            .catch((err) => {
                console.warn("Mermaid rendering failed:", err)
                setError(true) // Fallback to text
                setLoading(false)
            })
    }, [chart])

    if (error) {
        return <pre className="bg-red-900/20 text-red-200 p-4 rounded overflow-auto">{chart}</pre>
    }

    return (
        <div className="my-6 bg-zinc-900/50 p-4 rounded-lg flex justify-center border border-zinc-800 overflow-x-auto">
            {loading && <Loader2 className="animate-spin text-cyan-500 h-6 w-6" />}
            <div
                dangerouslySetInnerHTML={{ __html: svg }}
                className={loading ? "hidden" : "block w-full flex justify-center"}
                style={{ minHeight: "100px" }}
            />
        </div>
    )
}
