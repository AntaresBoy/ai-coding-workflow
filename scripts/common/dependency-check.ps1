function Read-BundleManifest {
  param(
    [Parameter(Mandatory = $true)]
    [string]$BundleRoot
  )

  $manifestPath = Join-Path $BundleRoot "manifest.json"
  if (-not (Test-Path $manifestPath)) {
    throw "Bundle manifest not found: $manifestPath"
  }

  return Get-Content $manifestPath -Raw | ConvertFrom-Json
}

$Script:Deps = @{
  "openspec-cli" = @{
    Name = "OpenSpec"
    CliCmd = "openspec"
    NpmPkg = "@fission-ai/openspec"
    InstallHint = "npm install -g @fission-ai/openspec@latest"
    AutoInstallable = $true
  }
  "superpowers" = @{
    Name = "Superpowers"
    CheckPath = "writing-plans\SKILL.md"
    InstallHint = "请在 Claude Code 中执行: /plugin install superpowers@claude-plugins-official"
    AutoInstallable = $false
  }
}

function Test-SuperpowersInstalled {
  $candidatePaths = @(
    (Join-Path $HOME ".claude\skills\$($Script:Deps["superpowers"].CheckPath)"),
    (Join-Path $HOME ".agents\skills\$($Script:Deps["superpowers"].CheckPath)")
  )
  foreach ($path in $candidatePaths) {
    if (Test-Path $path) {
      return $true
    }
  }
  return $false
}

function Test-RuntimeDependency {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Requirement
  )

  switch ($Requirement) {
    "openspec-cli" {
      return $null -ne (Get-Command $Script:Deps["openspec-cli"].CliCmd -ErrorAction SilentlyContinue)
    }
    "superpowers" {
      return Test-SuperpowersInstalled
    }
    default {
      return $false
    }
  }
}

function Get-DependencyResults {
  param(
    [Parameter(Mandatory = $true)]
    $Manifest
  )

  $results = @()
  if (-not $Manifest.runtimeRequirements) {
    return $results
  }
  foreach ($req in $Manifest.runtimeRequirements) {
    $dep = if ($Script:Deps.ContainsKey($req)) { $Script:Deps[$req] } else { $null }
    $results += [PSCustomObject]@{
      Name = $req
      DisplayName = if ($dep) { $dep.Name } else { $req }
      InstallHint = if ($dep) { $dep.InstallHint } else { $null }
      Available = (Test-RuntimeDependency $req)
    }
  }
  return ,$results
}

function Show-DependencyResults {
  param(
    [AllowNull()]
    [array]$DependencyResults
  )

  if (-not $DependencyResults) {
    return
  }

  if ($DependencyResults.Count -gt 0) {
    Write-Host "Runtime dependency check:"
    $DependencyResults | ForEach-Object {
      $status = if ($_.Available) { "ok" } else { "missing" }
      Write-Host ("- {0} ({1}) [{2}]" -f $_.DisplayName, $_.Name, $status)
      if (-not $_.Available -and $_.InstallHint) {
        Write-Host ("  install: {0}" -f $_.InstallHint)
      }
    }
    Write-Host ""
  }
}

function Get-MissingDependencies {
  param(
    [AllowNull()]
    [array]$DependencyResults
  )

  if (-not $DependencyResults) {
    return @()
  }

  $results = @($DependencyResults | Where-Object { -not $_.Available })
  return ,$results
}
