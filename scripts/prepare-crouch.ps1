$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $projectRoot 'design\art\tokyo-crawl-source.png'
$atlasPath = Join-Path $projectRoot 'game\assets\tokyo.png'
$motionPath = Join-Path $projectRoot 'game\assets\tokyo-crouch.png'
$sourceImage = [System.Drawing.Bitmap]::new($sourcePath)
$motion = [System.Drawing.Bitmap]::new(512,128,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$atlas = [System.Drawing.Bitmap]::new($atlasPath)
try {
    $cw = [int][Math]::Floor($sourceImage.Width / 4)
    $ch = [int][Math]::Floor($sourceImage.Height / 4)
    $bounds = @(); $maxWidth = 0
    for ($i=0; $i -lt 16; $i++) {
        $cx=($i%4)*$cw; $cy=[int][Math]::Floor($i/4)*$ch
        $left=$cw; $right=0; $bottom=0
        for ($y=0; $y -lt $ch; $y++) {
            for ($x=0; $x -lt $cw; $x++) {
                if ($sourceImage.GetPixel($cx+$x,$cy+$y).A -ge 160) {
                    $left=[Math]::Min($left,$x); $right=[Math]::Max($right,$x); $bottom=$y
                }
            }
        }
        $bounds += @{cx=$cx;cy=$cy;left=$left;right=$right;bottom=$bottom}
        $maxWidth=[Math]::Max($maxWidth,$right-$left+1)
    }
    # One scale for every pose; the 58px foot baseline matches the original atlas.
    $scale=56.0/$maxWidth
    for ($i=0; $i -lt 16; $i++) {
        $b=$bounds[$i]; $centerX=($b.left+$b.right)/2.0
        for ($dy=0; $dy -lt 64; $dy++) {
            for ($dx=0; $dx -lt 64; $dx++) {
                $sx=[int][Math]::Floor($centerX+($dx-32+0.5)/$scale)
                $sy=[int][Math]::Floor($b.bottom+($dy-58+0.5)/$scale)
                if ($sx -lt 0 -or $sx -ge $cw -or $sy -lt 0 -or $sy -ge $ch) { continue }
                $pixel=$sourceImage.GetPixel($b.cx+$sx,$b.cy+$sy)
                if ($pixel.A -ge 160) {
                    $motion.SetPixel(($i%8)*64+$dx,[int][Math]::Floor($i/8)*64+$dy,
                        [System.Drawing.Color]::FromArgb(255,$pixel.R,$pixel.G,$pixel.B))
                }
            }
        }
    }
    # The transition's first frame is exactly Tokyo's existing standing frame.
    for ($y=0; $y -lt 64; $y++) {
        for ($x=0; $x -lt 64; $x++) { $motion.SetPixel($x,$y,$atlas.GetPixel($x,$y)) }
    }
    for ($i=0; $i -lt 8; $i++) {
        for ($y=0; $y -lt 64; $y++) {
            for ($x=0; $x -lt 64; $x++) { $atlas.SetPixel($i*64+$x,256+$y,$motion.GetPixel($i*64+$x,64+$y)) }
        }
    }
    $motion.Save($motionPath,[System.Drawing.Imaging.ImageFormat]::Png)
    # Save to a sibling first: the bitmap reader still holds the original file.
    $atlas.Save(($atlasPath+'.next.png'),[System.Drawing.Imaging.ImageFormat]::Png)
}
finally { $sourceImage.Dispose(); $motion.Dispose(); $atlas.Dispose() }
Move-Item -LiteralPath ($atlasPath+'.next.png') -Destination $atlasPath -Force
Write-Output 'Prepared Tokyo crouch: 8 posture frames + 8 crawl frames, identical standing entry, shared scale and baseline.'
