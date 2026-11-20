Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::new((Resolve-Path "game/assets/treats.png").Path)
$size = 48
$cols = 4
$dest = [System.Drawing.Bitmap]::new($cols * $size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$boxes = @(
    @{ X = 74; Y = 254; W = 253; H = 260 },
    @{ X = 400; Y = 254; W = 254; H = 260 },
    @{ X = 727; Y = 266; W = 243; H = 236 },
    @{ X = 1060; Y = 254; W = 242; H = 260 }
)

for ($i = 0; $i -lt 4; $i++) {
    $b = $boxes[$i]
    $destX = $i * $size + 4
    $destY = 4
    $destW = $size - 8
    $destH = $size - 8
    $srcRect = [System.Drawing.Rectangle]::new($b.X, $b.Y, $b.W, $b.H)
    $destRect = [System.Drawing.Rectangle]::new($destX, $destY, $destW, $destH)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$destPath = (Resolve-Path "game/assets").Path + "\treat-atlas.png"
$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$dest.Dispose()
$bmp.Dispose()
Write-Output "Saved treat-atlas.png: 4x48x48"
