$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repo = "techmk7810/TwinMind-AI"

$milestones = @(
    "v0.2 Authentication",
    "v0.3 Enterprise Workspace",
    "v0.4 Smart Data Engine",
    "v0.5 AI Intelligence",
    "v0.6 Digital Twin",
    "v0.7 Multi-Agent AI",
    "v1.0 Production Release"
)

foreach ($m in $milestones) {
    & $gh api `
        --method POST `
        repos/$repo/milestones `
        -f title="$m"
}