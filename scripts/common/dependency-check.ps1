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
    InstallCommand = "npm install -g @fission-ai/openspec@latest"
    AutoInstallable = $true
  }
  "superpowers" = @{
    Name = "Superpowers"
    CheckPath = "writing-plans\SKILL.md"
    InstallHint = "请在 Claude Code 中执行: /plugin install superpowers@claude-plugins-official"
    InstallCommand = "/plugin install superpowers@claude-plugins-official"
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
      InstallCommand = if ($dep) { $dep.InstallCommand } else { $null }
      AutoInstallable = if ($dep) { $dep.AutoInstallable } else { $false }
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
      $icon = if ($_.Available) { "✅" } else { "❌" }
      Write-Host ("- {0} {1} ({2}) [{3}]" -f $icon, $_.DisplayName, $_.Name, $status)
      if (-not $_.Available -and $_.InstallHint) {
        Write-Host ("  ⚠️ install: {0}" -f $_.InstallHint)
      }
    }
    Write-Host ""
  }
}

function Offer-DependencyInstalls {
  param(
    [AllowNull()]
    [array]$DependencyResults
  )

  if (-not $DependencyResults) {
    return
  }

  $missing = @($DependencyResults | Where-Object { -not $_.Available })
  foreach ($dep in $missing) {
    Write-Host ("⚠️ Missing dependency: {0} ({1})" -f $dep.DisplayName, $dep.Name)
    if ($dep.AutoInstallable -and $dep.InstallCommand) {
      $answer = Read-Host ("是否现在执行安装命令：{0} ? (y/N)" -f $dep.InstallCommand)
      if ($answer -in @("y", "Y", "yes", "YES")) {
        try {
          Invoke-Expression $dep.InstallCommand
          Write-Host ("✅ {0} installed." -f $dep.DisplayName)
        } catch {
          Write-Host ("❌ {0} install failed. Please run manually: {1}" -f $dep.DisplayName, $dep.InstallHint)
        }
      } else {
        Write-Host ("⚠️ Skipped {0} install. Please run manually: {1}" -f $dep.DisplayName, $dep.InstallHint)
      }
    } else {
      $answer = Read-Host "是否查看安装指令？(y/N)"
      if ($answer -in @("y", "Y", "yes", "YES")) {
        Write-Host ("⚠️ {0} must be installed from the target tool:" -f $dep.DisplayName)
        Write-Host ("  {0}" -f $dep.InstallHint)
      } else {
        Write-Host ("⚠️ Skipped {0} install. Install command: {1}" -f $dep.DisplayName, $dep.InstallHint)
      }
    }
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
