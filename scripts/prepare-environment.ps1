$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$artDir = Join-Path $projectRoot 'design\art\environment'
$assetDir = Join-Path $projectRoot 'game\assets'

function Get-SpriteBounds($image, [int]$cx, [int]$cy, [int]$w, [int]$h) {
    $left=$w; $right=0; $top=$h; $bottom=0
    for ($y=0; $y -lt $h; $y++) {
        for ($x=0; $x -lt $w; $x++) {
            if ($image.GetPixel($cx+$x,$cy+$y).A -ge 160) {
                $left=[Math]::Min($left,$x); $right=[Math]::Max($right,$x)
                $top=[Math]::Min($top,$y); $bottom=$y
            }
        }
    }
    return @{cx=$cx;cy=$cy;left=$left;right=$right;top=$top;bottom=$bottom}
}

function Export-Atlas([string]$name, [int]$cols, [int]$rows, [int]$size, [int]$baseline) {
    $src=[System.Drawing.Bitmap]::new((Join-Path $artDir "$name-source.png"))
    $dest=[System.Drawing.Bitmap]::new($cols*$size,$rows*$size,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $cw=[int][Math]::Floor($src.Width/$cols); $ch=[int][Math]::Floor($src.Height/$rows)
        $bounds=@(); $maxW=0; $maxH=0
        for ($i=0; $i -lt $cols*$rows; $i++) {
            $b=Get-SpriteBounds $src (($i%$cols)*$cw) ([int][Math]::Floor($i/$cols)*$ch) $cw $ch
            $bounds+=$b
            $maxW=[Math]::Max($maxW,$b.right-$b.left+1); $maxH=[Math]::Max($maxH,$b.bottom-$b.top+1)
        }
        $scale=[Math]::Min(($size-8.0)/$maxW,($baseline-4.0)/$maxH)
        for ($i=0; $i -lt $cols*$rows; $i++) {
            $b=$bounds[$i]; $centerX=($b.left+$b.right)/2.0
            for ($dy=0; $dy -lt $size; $dy++) {
                for ($dx=0; $dx -lt $size; $dx++) {
                    $sx=[int][Math]::Floor($centerX+($dx-$size/2+0.5)/$scale)
                    $sy=[int][Math]::Floor($b.bottom+($dy-$baseline+0.5)/$scale)
                    if ($sx -lt 0 -or $sx -ge $cw -or $sy -lt 0 -or $sy -ge $ch) { continue }
                    $p=$src.GetPixel($b.cx+$sx,$b.cy+$sy)
                    if ($p.A -ge 160) {
                        $dest.SetPixel(($i%$cols)*$size+$dx,[int][Math]::Floor($i/$cols)*$size+$dy,[System.Drawing.Color]::FromArgb(255,$p.R,$p.G,$p.B))
                    }
                }
            }
        }
        $dest.Save((Join-Path $assetDir "$name.png"),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $src.Dispose(); $dest.Dispose() }
    Write-Output "Prepared $name atlas."
}

function Export-Layer([string]$name, [int]$width, [int]$height, [bool]$opaque=$false) {
    $src=[System.Drawing.Bitmap]::new((Join-Path $artDir "$name-source.png"))
    $dest=[System.Drawing.Bitmap]::new($width,$height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $b=Get-SpriteBounds $src 0 0 $src.Width $src.Height
        if ($opaque) { $b.top=[int]($src.Height*0.025); $b.left=0; $b.right=$src.Width-1; $b.bottom=$src.Height-1 }
        for ($y=0; $y -lt $height; $y++) {
            for ($x=0; $x -lt $width; $x++) {
                $sx=$b.left+[int][Math]::Floor(($x+0.5)*($b.right-$b.left+1)/$width)
                $sy=$b.top+[int][Math]::Floor(($y+0.5)*($b.bottom-$b.top+1)/$height)
                $p=$src.GetPixel($sx,$sy)
                if ($opaque -or $p.A -ge 160) { $dest.SetPixel($x,$y,[System.Drawing.Color]::FromArgb(255,$p.R,$p.G,$p.B)) }
            }
        }
        $dest.Save((Join-Path $assetDir "$name.png"),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $src.Dispose(); $dest.Dispose() }
    Write-Output "Prepared $name layer."
}

Export-Layer 'grassland' 128 128 $true
Export-Atlas 'trees' 2 2 128 120
Export-Layer 'hills' 512 96
Export-Layer 'mountains' 512 160
Export-Atlas 'flowers' 4 2 32 29
