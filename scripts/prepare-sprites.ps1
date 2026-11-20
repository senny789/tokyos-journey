param(
    [string]$Source = '',
    [string]$CrouchSource = ''
)

# Import the generated sheet into the runtime's fixed 64px animation grid.
# Alpha thresholding and nearest sampling keep the exported pixels crisp.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$artDir = Join-Path $projectRoot 'design\art'
$assetDir = Join-Path $projectRoot 'game\assets'
New-Item -ItemType Directory -Force -Path $artDir, $assetDir | Out-Null
if (-not $Source) { $Source = Join-Path $artDir 'tokyo-source.png' }
if (-not $CrouchSource) { $CrouchSource = Join-Path $artDir 'tokyo-crouch-source.png' }
if ([System.IO.Path]::GetFullPath($Source) -ne [System.IO.Path]::GetFullPath((Join-Path $artDir 'tokyo-source.png'))) {
    Copy-Item -LiteralPath $Source -Destination (Join-Path $artDir 'tokyo-source.png')
}
$sourceImage = [System.Drawing.Bitmap]::new($Source)
$sheet = [System.Drawing.Bitmap]::new(512,384,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
try {
    $cellW = $sourceImage.Width / 8
    $cellH = $sourceImage.Height / 6
    for ($row=0; $row -lt 6; $row++) {
        for ($col=0; $col -lt 8; $col++) {
            $bottom = 0
            for ($sy=0; $sy -lt $cellH; $sy++) {
                for ($sx=0; $sx -lt $cellW; $sx++) {
                    if ($sourceImage.GetPixel($col*$cellW+$sx,$row*$cellH+$sy).A -ge 160) { $bottom = $sy }
                }
            }
            # Same scale and a shared foot baseline, including seated poses.
            for ($dy=0; $dy -lt 64; $dy++) {
                for ($dx=0; $dx -lt 64; $dx++) {
                    $sx = [int][Math]::Floor(($dx + 0.5) * $cellW / 64)
                    $sy = [int][Math]::Floor($bottom + ($dy - 58 + 0.5) * $cellH / 64)
                    if ($sy -lt 0 -or $sy -ge $cellH) { continue }
                    $pixel = $sourceImage.GetPixel($col*$cellW+$sx,$row*$cellH+$sy)
                    if ($pixel.A -ge 160) {
                        $sheet.SetPixel($col*64+$dx,$row*64+$dy,[System.Drawing.Color]::FromArgb(255,$pixel.R,$pixel.G,$pixel.B))
                    }
                }
            }
        }
    }
    if (Test-Path -LiteralPath $CrouchSource) {
        $crouchImage = [System.Drawing.Bitmap]::new($CrouchSource)
        try {
            $cw = [int][Math]::Floor($crouchImage.Width / 4)
            $ch = [int][Math]::Floor($crouchImage.Height / 2)
            $bounds = @()
            $maxWidth = 0
            for ($i=0; $i -lt 8; $i++) {
                $cx = ($i % 4) * $cw
                $cy = [int][Math]::Floor($i / 4) * $ch
                $left = $cw; $right = 0; $bottom = 0
                for ($y=0; $y -lt $ch; $y++) {
                    for ($x=0; $x -lt $cw; $x++) {
                        if ($crouchImage.GetPixel($cx+$x,$cy+$y).A -ge 160) {
                            $left = [Math]::Min($left,$x); $right = [Math]::Max($right,$x); $bottom = $y
                        }
                    }
                }
                $bounds += @{cx=$cx; cy=$cy; left=$left; right=$right; bottom=$bottom}
                $maxWidth = [Math]::Max($maxWidth,$right-$left+1)
            }
            $scale = 56.0 / $maxWidth
            for ($i=0; $i -lt 8; $i++) {
                $b = $bounds[$i]
                $centerX = ($b.left + $b.right) / 2.0
                for ($dy=0; $dy -lt 64; $dy++) {
                    for ($dx=0; $dx -lt 64; $dx++) {
                        $sheet.SetPixel($i*64+$dx,256+$dy,[System.Drawing.Color]::FromArgb(0,0,0,0))
                        $sx = [int][Math]::Floor($centerX + ($dx-32+0.5) / $scale)
                        $sy = [int][Math]::Floor($b.bottom + ($dy-58+0.5) / $scale)
                        if ($sx -lt 0 -or $sx -ge $cw -or $sy -lt 0 -or $sy -ge $ch) { continue }
                        $pixel = $crouchImage.GetPixel($b.cx+$sx,$b.cy+$sy)
                        if ($pixel.A -ge 160) {
                            $sheet.SetPixel($i*64+$dx,256+$dy,[System.Drawing.Color]::FromArgb(255,$pixel.R,$pixel.G,$pixel.B))
                        }
                    }
                }
            }
        }
        finally { $crouchImage.Dispose() }
    }
    $sheet.Save((Join-Path $assetDir 'tokyo.png'),[System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output 'Prepared game/assets/tokyo.png: 48 frames, 64x64 each, binary alpha, shared foot baseline.'
}
finally { $sourceImage.Dispose(); $sheet.Dispose() }
if (Test-Path -LiteralPath (Join-Path $artDir 'tokyo-crawl-source.png')) {
    & (Join-Path $PSScriptRoot 'prepare-crouch.ps1')
}
