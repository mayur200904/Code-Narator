"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { generateText } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface RepoFormProps {
    onJobStarted: (jobId: string, repoUrl: string) => void
}

export function RepoForm({ onJobStarted }: RepoFormProps) {
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const data = await generateText(url, true)
            onJobStarted(data.job_id, url)
        } catch (err) {
            setError("Failed to start job. Ensure the backend is running.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto bg-black/40 border-zinc-800 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                    Codebase Knowledge Builder
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Enter a GitHub URL to generate a full tutorial suite (Text & Video).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="https://github.com/username/repo"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button
                        type="submit"
                        disabled={loading || !url}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Generation"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
