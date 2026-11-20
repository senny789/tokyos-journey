Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::new((Resolve-Path "game/assets/treats.png").Path)
$w = $bmp.Width; $h = $bmp.Height

$inTreat = $false
$start = 0
$treatCols = @()
for ($x = 70; $x -le 1310; $x++) {
    $hasCol = $false
    for ($y = 250; $y -le 520; $y++) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            $hasCol = $true
            break
        }
    }
    if ($hasCol -and -not $inTreat) {
        $inTreat = $true
        $start = $x
    } elseif (-not $hasCol -and $inTreat) {
        $inTreat = $false
        $treatCols += @{ Start = $start; End = ($x - 1); Width = ($x - $start) }
    }
}
if ($inTreat) {
    $treatCols += @{ Start = $start; End = 1310; Width = (1311 - $start) }
}

Write-Output "Found $($treatCols.Count) treats horizontally:"
$index = 0
foreach ($t in $treatCols) {
    $minY = 520; $maxY = 250
    for ($x = $t.Start; $x -le $t.End; $x++) {
        for ($y = 250; $y -le 520; $y++) {
            if ($bmp.GetPixel($x, $y).A -gt 100) {
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    Write-Output "Treat ${index}: X=[$($t.Start)..$($t.End)] (W=$($t.Width)), Y=[$minY..$maxY] (H=$(1 + $maxY - $minY))"
    $index++
}

$bmp.Dispose()
