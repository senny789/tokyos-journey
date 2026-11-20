$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
# Trim transparent margins and resize with nearest-neighbor sampling for game use.
foreach ($spec in @(@('cloud',192,88), @('star',24,40), @('sun',112,112), @('moon',88,104))) {
    $name, $width, $height = $spec
    $source = [System.Drawing.Bitmap]::new((Join-Path $root "design/sky-sprites/$name-source.png"))
    $left = $source.Width; $top = $source.Height; $right = 0; $bottom = 0
    for ($y = 0; $y -lt $source.Height; $y++) {
        for ($x = 0; $x -lt $source.Width; $x++) {
            if ($source.GetPixel($x,$y).A -lt 128) { continue }
            $left = [Math]::Min($left,$x); $right = [Math]::Max($right,$x)
            $top = [Math]::Min($top,$y); $bottom = [Math]::Max($bottom,$y)
        }
    }
    $cropWidth = $right - $left + 1; $cropHeight = $bottom - $top + 1
    $scale = [Math]::Min(($width - 4) / $cropWidth, ($height - 4) / $cropHeight)
    $drawWidth = [int][Math]::Round($cropWidth * $scale)
    $drawHeight = [int][Math]::Round($cropHeight * $scale)
    $output = [System.Drawing.Bitmap]::new($width,$height,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($output)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $dest = [System.Drawing.Rectangle]::new([int](($width-$drawWidth)/2),[int](($height-$drawHeight)/2),$drawWidth,$drawHeight)
    $crop = [System.Drawing.Rectangle]::new($left,$top,$cropWidth,$cropHeight)
    $graphics.DrawImage($source,$dest,$crop,[System.Drawing.GraphicsUnit]::Pixel)
    $output.Save((Join-Path $root "game/assets/sky-$name.png"),[System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose(); $output.Dispose(); $source.Dispose()
    Write-Output "Prepared sky-$name.png ($width x $height)"
}
