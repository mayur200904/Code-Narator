"use client"

import { useEffect, useState } from "react"
import { getJobStatus, generateVideo, getArtifacts } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TerminalLogs } from "./terminal-logs"
import { PlayCircle, FileText, CheckCircle2, Loader2, Video as VideoIcon } from "lucide-react"

interface StatusTrackerProps {
    jobId: string
    repoUrl: string
    onReset: () => void
}

export function StatusTracker({ jobId, repoUrl, onReset }: StatusTrackerProps) {
    const [status, setStatus] = useState("queued")
    const [videoJobId, setVideoJobId] = useState<string | null>(null)
    const [videoStatus, setVideoStatus] = useState<string | null>(null)
    const [projectName, setProjectName] = useState<string | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)

    // Poll for Text Job Status
    useEffect(() => {
        if (!jobId || status === "completed" || status === "failed") return

        const interval = setInterval(async () => {
            try {
                const data = await getJobStatus(jobId)
                setStatus(data.status)
                if (data.status === "completed" && data.result) {
                    setProjectName(data.result.project_name)
                }
            } catch (e) { console.error(e) }
        }, 2000)
        return () => clearInterval(interval)
    }, [jobId, status])

    // Poll for Video Job Status
    useEffect(() => {
        if (!videoJobId || videoStatus === "completed" || videoStatus === "failed") return

        const interval = setInterval(async () => {
            try {
                const data = await getJobStatus(videoJobId)
                setVideoStatus(data.status)
                if (data.status === "completed" && projectName) {
                    setVideoUrl(`http://localhost:8000/output/${projectName}/tutorial.mp4`)
                }
            } catch (e) { console.error(e) }
        }, 2000)
        return () => clearInterval(interval)
    }, [videoJobId, videoStatus, projectName])

    const handleGenerateVideo = async () => {
        try {
            const data = await generateVideo(repoUrl, { voice: "en-US-GuyNeural", style: "cyberpunk" })
            setVideoJobId(data.job_id)
            setVideoStatus("queued")
        } catch (e) {
            alert("Failed to start video generation")
        }
    }

    // Calculate Progress for UI
    const getProgress = () => {
        if (status === "queued") return 10
        if (status === "processing") return 45
        if (status === "completed") return 100
        return 0
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <Card className="bg-zinc-900/80 border-zinc-800 text-white shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        {status === "processing" && <Loader2 className="animate-spin text-cyan-400" />}
                        {status === "completed" && <CheckCircle2 className="text-green-400" />}
                        Generation Status
                    </CardTitle>
                    <Badge variant={status === "completed" ? "default" : "secondary"} className={status === "completed" ? "bg-green-600" : "bg-zinc-700"}>
                        {status.toUpperCase()}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Phase 1: Text Generation */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Text Tutorial Generation</span>
                            <span>{getProgress()}%</span>
                        </div>
                        <Progress value={getProgress()} className="h-2 bg-zinc-800" indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-600" />
                    </div>

                    <TerminalLogs status={status} />

                    {/* Actions & Artifacts */}
                    {status === "completed" && (
                        <div className="grid grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Link to new Tutorial Viewer */}
                            <div onClick={() => window.open(`http://localhost:3000/tutorial/${projectName}`, '_blank')}>
                                <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                                    <FileText className="mr-2 h-4 w-4 text-blue-400" />
                                    Read Docs
                                </Button>
                            </div>

                            {!videoJobId ? (
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20" onClick={handleGenerateVideo}>
                                    <VideoIcon className="mr-2 h-4 w-4" />
                                    Generate AI Video
                                </Button>
                            ) : (
                                <div className="col-span-1 flex flex-col justify-center items-center p-2 bg-zinc-800/50 rounded border border-zinc-700">
                                    <span className="text-xs text-zinc-400 mb-2">Video: {videoStatus}</span>
                                    {videoStatus === "processing" && <Loader2 className="h-4 w-4 animate-spin text-purple-400" />}
                                    {videoStatus === "completed" && videoUrl && (
                                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-500" onClick={() => window.open(videoUrl, '_blank')}>
                                            <PlayCircle className="mr-2 h-4 w-4" /> Watch Video
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 border-t border-zinc-800 flex justify-center">
                        <button onClick={onReset} className="text-xs text-zinc-500 hover:text-white underline">Start New Project</button>
                    </div>
                </CardContent>
            </Card>

            {videoStatus === "completed" && videoUrl && (
                <Card className="bg-black border-zinc-800 overflow-hidden">
                    <video controls className="w-full aspect-video" src={videoUrl} />
                </Card>
            )}
        </div>
    )
}
