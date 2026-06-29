$gh = "C:\Program Files\GitHub CLI\gh.exe"
$repo = "techmk7810/TwinMind-AI"

$labels = @(
    @{name="backend"; color="1D76DB"; description="Backend development"},
    @{name="frontend"; color="5319E7"; description="Frontend development"},
    @{name="database"; color="0E8A16"; description="Database related"},
    @{name="authentication"; color="B60205"; description="Authentication & security"},
    @{name="ai"; color="FBCA04"; description="Artificial Intelligence"},
    @{name="digital-twin"; color="C2E0C6"; description="Digital Twin module"},
    @{name="documentation"; color="0075CA"; description="Documentation"},
    @{name="testing"; color="7057FF"; description="Testing"},
    @{name="deployment"; color="0052CC"; description="Deployment"},
    @{name="bug"; color="D73A4A"; description="Bug fix"},
    @{name="enhancement"; color="A2EEEF"; description="Feature improvement"},
    @{name="high-priority"; color="B60205"; description="High priority"},
    @{name="medium-priority"; color="FBCA04"; description="Medium priority"},
    @{name="low-priority"; color="0E8A16"; description="Low priority"},
    @{name="research"; color="5319E7"; description="Research paper"}
)

foreach ($label in $labels) {
    & $gh label create $label.name `
        --repo $repo `
        --color $label.color `
        --description $label.description `
        --force
}