// Use environment variable for API URL, fallback to localhost for dev
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generateText(repoUrl: string, clean: boolean = false) {
    const res = await fetch(`${API_BASE}/api/generate/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, clean }),
    });
    if (!res.ok) throw new Error("Failed to start text generation");
    return res.json();
}

export async function generateVideo(repoUrl: string, options: { voice?: string, style?: string } = {}) {
    const res = await fetch(`${API_BASE}/api/generate/video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl, ...options }),
    });
    if (!res.ok) throw new Error("Failed to start video generation");
    return res.json();
}

export async function getJobStatus(jobId: string) {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
    if (!res.ok) throw new Error("Failed to fetch status");
    return res.json();
}

export async function getArtifacts(projectName: string) {
    const res = await fetch(`${API_BASE}/api/projects/${projectName}/artifacts`);
    if (!res.ok) return null; // Logic to handle 404 cleanly
    return res.json();
}
