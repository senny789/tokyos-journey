$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class SpriteProcessor {
    public static void MakeTransparent(string srcPath, string destPath, int threshold) {
        using (var bmp = new Bitmap(srcPath)) {
            int w = bmp.Width;
            int h = bmp.Height;
            using (var dest = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                var rect = new Rectangle(0, 0, w, h);
                var srcData = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                var destData = dest.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                
                int stride = srcData.Stride;
                int bytes = Math.Abs(stride) * h;
                byte[] rgbValues = new byte[bytes];
                byte[] outValues = new byte[bytes];
                
                Marshal.Copy(srcData.Scan0, rgbValues, 0, bytes);
                
                bool[,] isBg = new bool[w, h];
                Queue<Point> q = new Queue<Point>();
                
                Func<int, int, bool> isWhite = (x, y) => {
                    int idx = y * stride + x * 4;
                    byte b = rgbValues[idx];
                    byte g = rgbValues[idx + 1];
                    byte r = rgbValues[idx + 2];
                    return (r >= threshold && g >= threshold && b >= threshold);
                };
                
                for (int x = 0; x < w; x++) {
                    if (isWhite(x, 0)) { isBg[x, 0] = true; q.Enqueue(new Point(x, 0)); }
                    if (isWhite(x, h - 1)) { isBg[x, h - 1] = true; q.Enqueue(new Point(x, h - 1)); }
                }
                for (int y = 0; y < h; y++) {
                    if (isWhite(0, y) && !isBg[0, y]) { isBg[0, y] = true; q.Enqueue(new Point(0, y)); }
                    if (isWhite(w - 1, y) && !isBg[w - 1, y]) { isBg[w - 1, y] = true; q.Enqueue(new Point(w - 1, y)); }
                }
                
                int[] dx = { 1, -1, 0, 0 };
                int[] dy = { 0, 0, 1, -1 };
                
                while (q.Count > 0) {
                    Point pt = q.Dequeue();
                    for (int i = 0; i < 4; i++) {
                        int nx = pt.X + dx[i];
                        int ny = pt.Y + dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h && !isBg[nx, ny]) {
                            if (isWhite(nx, ny)) {
                                isBg[nx, ny] = true;
                                q.Enqueue(new Point(nx, ny));
                            }
                        }
                    }
                }
                
                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int idx = y * stride + x * 4;
                        if (isBg[x, y]) {
                            outValues[idx] = 0;
                            outValues[idx + 1] = 0;
                            outValues[idx + 2] = 0;
                            outValues[idx + 3] = 0;
                        } else {
                            outValues[idx] = rgbValues[idx];
                            outValues[idx + 1] = rgbValues[idx + 1];
                            outValues[idx + 2] = rgbValues[idx + 2];
                            outValues[idx + 3] = 255;
                        }
                    }
                }
                
                Marshal.Copy(outValues, 0, destData.Scan0, bytes);
                bmp.UnlockBits(srcData);
                dest.UnlockBits(destData);
                dest.Save(destPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -Language CSharp -ReferencedAssemblies "System.Drawing"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = "C:\Users\INNXT-PC-30\.gemini\antigravity\brain\e4518d58-97fe-4a31-adbd-c8a4441ddcd1"
$artSourcesDir = Join-Path $projectRoot "design\art\sources"
$assetDir = Join-Path $projectRoot "game\assets"

New-Item -ItemType Directory -Force -Path $artSourcesDir, $assetDir | Out-Null

$mappings = @(
    @{ Src = "tokyo_hovering_treats_spritesheet_1795171165825.jpg"; Name = "treats" },
    @{ Src = "portal_spritesheet_1795171278420.jpg"; Name = "portal" },
    @{ Src = "villain_dogs_spritesheet_1795171291342.jpg"; Name = "villain-dogs" },
    @{ Src = "snes_pixel_art_houses_spritesheet_1795171312801.jpg"; Name = "houses" },
    @{ Src = "boxes_and_crates_spritesheet_1795171358903.jpg"; Name = "boxes" },
    @{ Src = "tokyo_beds_spritesheet_1795171361093.jpg"; Name = "beds" },
    @{ Src = "rocks_boulders_spritesheet_1795171358157.jpg"; Name = "rocks" },
    @{ Src = "tokyo_food_items_spritesheet_1795171385232.jpg"; Name = "food" },
    @{ Src = "tokyo_npcs_spritesheet_clean_1795171451148.jpg"; Name = "people" },
    @{ Src = "bushes_shrubbery_spritesheet_1795171433295.jpg"; Name = "bushes" },
    @{ Src = "meadow_insects_spritesheet_1795171458771.jpg"; Name = "insects" },
    @{ Src = "snes_sticks_branches_spritesheet_1795171504666.jpg"; Name = "sticks" }
)

foreach ($item in $mappings) {
    $srcPath = Join-Path $sourceDir $item.Src
    $sourceDest = Join-Path $artSourcesDir "$($item.Name)-source.jpg"
    Copy-Item -LiteralPath $srcPath -Destination $sourceDest -Force
    
    $outPng = Join-Path $assetDir "$($item.Name).png"
    Write-Output "Processing $($item.Name)..."
    [SpriteProcessor]::MakeTransparent($srcPath, $outPng, 240)
    Write-Output "Saved transparent sprite to $outPng"
}

Write-Output "All 12 sprite sets processed successfully!"
