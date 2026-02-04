"use client"

import { useState } from "react"
import { RepoForm } from "@/components/features/repo-form"
import { StatusTracker } from "@/components/features/status-tracker"

export default function Home() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [repoUrl, setRepoUrl] = useState<string>("")

  const handleJobStarted = (jobId: string, url: string) => {
    setCurrentJobId(jobId)
    setRepoUrl(url)
  }

  const handleReset = () => {
    setCurrentJobId(null)
    setRepoUrl("")
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-4xl space-y-8">
        {!currentJobId ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-5xl font-extrabold tracking-tighter bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Code-Narrator AI
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                Transform any GitHub repository into a comprehensive video tutorial and technical documentation suite in minutes.
              </p>
            </div>
            <RepoForm onJobStarted={handleJobStarted} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            <StatusTracker jobId={currentJobId} repoUrl={repoUrl} onReset={handleReset} />
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-xs text-zinc-600 z-10">
        Powered by Code-Narrator Team
      </div>
    </main>
  )
}
