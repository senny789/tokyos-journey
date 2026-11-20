$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$csharpCode = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class CelestialArtist {
    // Helper to draw a pixel block (scaled pixel art look)
    private static void Pixel(Graphics g, Brush b, int x, int y, int size = 2) {
        g.FillRectangle(b, x * size, y * size, size, size);
    }

    private static void Circle(Graphics g, Brush b, int cx, int cy, int r, int scale = 2) {
        for (int y = -r; y <= r; y++) {
            for (int x = -r; x <= r; x++) {
                if (x * x + y * y <= r * r) {
                    Pixel(g, b, cx + x, cy + y, scale);
                }
            }
        }
    }

    public static void GenerateSun(string destPath) {
        // 4 sun sprites in a horizontal row: 128x128 each -> 512x128
        using (var bmp = new Bitmap(512, 128, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp)) {
            g.Clear(Color.Transparent);

            // Palette
            var cOut = new SolidBrush(Color.FromArgb(255, 74, 46, 0));       // #4A2E00
            var cDeep = new SolidBrush(Color.FromArgb(255, 216, 130, 0));    // #D88200
            var cGold = new SolidBrush(Color.FromArgb(255, 244, 179, 0));    // #F4B300
            var cYellow = new SolidBrush(Color.FromArgb(255, 255, 222, 56));  // #FFDE38
            var cLight = new SolidBrush(Color.FromArgb(255, 255, 249, 189)); // #FFF9BD
            var cWhite = new SolidBrush(Color.FromArgb(255, 255, 255, 255));
            var cOrange = new SolidBrush(Color.FromArgb(255, 232, 93, 4));

            // --- 1. Radiant Midday Sun (x: 0..127, center: 64, 64)
            int ox1 = 32, oy1 = 32; // In 2x scale (64x64 logical pixels)
            // Rays
            int[] rayLengths = { 26, 22, 26, 22, 26, 22, 26, 22 };
            for (int angle = 0; angle < 16; angle++) {
                double rad = angle * Math.PI / 8.0;
                int len = (angle % 2 == 0) ? 27 : 21;
                for (int d = 16; d <= len; d++) {
                    int rx = ox1 + (int)Math.Round(Math.Cos(rad) * d);
                    int ry = oy1 + (int)Math.Round(Math.Sin(rad) * d);
                    Pixel(g, (d == len) ? cOut : (d > len - 3 ? cDeep : cGold), rx, ry);
                }
            }
            // Sun Body
            Circle(g, cOut, ox1, oy1, 16);
            Circle(g, cDeep, ox1, oy1, 15);
            Circle(g, cGold, ox1, oy1, 14);
            Circle(g, cYellow, ox1 - 1, oy1 - 1, 12);
            Circle(g, cLight, ox1 - 3, oy1 - 3, 7);
            Circle(g, cWhite, ox1 - 5, oy1 - 5, 3);

            // --- 2. Golden Sunset Sun (x: 128..255, center: 192, 64)
            int ox2 = 96, oy2 = 32;
            // Concentric radiating heat rings
            Circle(g, cOut, ox2, oy2, 24);
            Circle(g, cOrange, ox2, oy2, 23);
            Circle(g, cDeep, ox2, oy2, 20);
            Circle(g, cGold, ox2, oy2, 17);
            Circle(g, cYellow, ox2, oy2, 13);
            Circle(g, cLight, ox2, oy2, 8);
            Circle(g, cWhite, ox2, oy2, 3);

            // --- 3. Cheerful Retro Sun (x: 256..383, center: 320, 64)
            int ox3 = 160, oy3 = 32;
            // 8 triangular rays
            for (int a = 0; a < 8; a++) {
                double rad = a * Math.PI / 4.0;
                int rbx = ox3 + (int)Math.Round(Math.Cos(rad) * 20);
                int rby = oy3 + (int)Math.Round(Math.Sin(rad) * 20);
                Circle(g, cOut, rbx, rby, 4);
                Circle(g, cGold, rbx, rby, 3);
                Circle(g, cYellow, rbx, rby, 2);
            }
            Circle(g, cOut, ox3, oy3, 16);
            Circle(g, cGold, ox3, oy3, 15);
            Circle(g, cYellow, ox3, oy3, 13);
            // Cute Face: eyes and happy smile
            Pixel(g, cOut, ox3 - 5, oy3 - 2); Pixel(g, cOut, ox3 - 5, oy3 - 1);
            Pixel(g, cOut, ox3 + 5, oy3 - 2); Pixel(g, cOut, ox3 + 5, oy3 - 1);
            // Rosy cheeks
            Pixel(g, cOrange, ox3 - 8, oy3 + 1); Pixel(g, cOrange, ox3 - 7, oy3 + 1);
            Pixel(g, cOrange, ox3 + 7, oy3 + 1); Pixel(g, cOrange, ox3 + 8, oy3 + 1);
            // Smile arc
            Pixel(g, cOut, ox3 - 4, oy3 + 3);
            Pixel(g, cOut, ox3 - 3, oy3 + 4);
            Pixel(g, cOut, ox3 - 2, oy3 + 5);
            Pixel(g, cOut, ox3 - 1, oy3 + 5);
            Pixel(g, cOut, ox3, oy3 + 5);
            Pixel(g, cOut, ox3 + 1, oy3 + 5);
            Pixel(g, cOut, ox3 + 2, oy3 + 5);
            Pixel(g, cOut, ox3 + 3, oy3 + 4);
            Pixel(g, cOut, ox3 + 4, oy3 + 3);

            // --- 4. Sunburst Flare (x: 384..511, center: 448, 64)
            int ox4 = 224, oy4 = 32;
            // Cross spikes
            for (int l = 5; l < 28; l++) {
                int w = (l < 10) ? 2 : 1;
                for (int s = -w; s <= w; s++) {
                    Pixel(g, cLight, ox4 + l, oy4 + s);
                    Pixel(g, cLight, ox4 - l, oy4 + s);
                    Pixel(g, cLight, ox4 + s, oy4 + l);
                    Pixel(g, cLight, ox4 + s, oy4 - l);
                }
            }
            // Diagonal spikes
            for (int l = 4; l < 18; l++) {
                Pixel(g, cYellow, ox4 + l, oy4 + l);
                Pixel(g, cYellow, ox4 - l, oy4 + l);
                Pixel(g, cYellow, ox4 + l, oy4 - l);
                Pixel(g, cYellow, ox4 - l, oy4 - l);
            }
            Circle(g, cOut, ox4, oy4, 10);
            Circle(g, cDeep, ox4, oy4, 9);
            Circle(g, cGold, ox4, oy4, 8);
            Circle(g, cYellow, ox4, oy4, 6);
            Circle(g, cWhite, ox4, oy4, 3);

            bmp.Save(destPath, ImageFormat.Png);
        }
    }

    public static void GenerateClouds(string destPath) {
        // 6 cloud sprites in 2 rows of 3: cell 192x128 -> total 576x256
        using (var bmp = new Bitmap(576, 256, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp)) {
            g.Clear(Color.Transparent);

            var cOut = new SolidBrush(Color.FromArgb(255, 92, 107, 115));    // Slate outline
            var cDeep = new SolidBrush(Color.FromArgb(255, 141, 153, 174));  // Lavender-slate shadow
            var cMid = new SolidBrush(Color.FromArgb(255, 202, 210, 197));   // Soft body shading
            var cBody = new SolidBrush(Color.FromArgb(255, 237, 242, 244));  // Fluffy off-white
            var cWhite = new SolidBrush(Color.FromArgb(255, 255, 255, 255)); // Bright sunlit top
            var cPeach = new SolidBrush(Color.FromArgb(255, 244, 162, 97));  // Sunset highlight

            Action<int, int, int, int, int, bool> drawPuff = (cx, cy, rx, ry, colIdx, sunset) => {
                // Draws a layered cloud puff
                Circle(g, cOut, cx, cy, rx);
                Circle(g, cDeep, cx, cy, rx - 1);
                Circle(g, cMid, cx, cy - 1, rx - 2);
                Circle(g, sunset ? cPeach : cBody, cx, cy - 2, rx - 3);
                Circle(g, cWhite, cx, cy - 4, rx - 5);
            };

            // Cloud 1: Large puffy cumulus (top-left, cell center 96, 64)
            int[,] c1Puffs = {
                { 70, 72, 18 }, { 96, 56, 24 }, { 124, 68, 20 }, { 82, 74, 16 }, { 110, 74, 17 }
            };
            for (int i = 0; i < 5; i++) drawPuff(c1Puffs[i, 0], c1Puffs[i, 1] / 2, c1Puffs[i, 2] / 2, c1Puffs[i, 2] / 2, 0, false);

            // Cloud 2: Medium drifting cloud (top-mid, cell center 288, 64 -> logical 144, 32)
            int[,] c2Puffs = {
                { 128, 36, 11 }, { 144, 28, 15 }, { 160, 34, 12 }, { 138, 36, 10 }
            };
            for (int i = 0; i < 4; i++) drawPuff(c2Puffs[i, 0], c2Puffs[i, 1], c2Puffs[i, 2], c2Puffs[i, 2], 1, false);

            // Cloud 3: Small cute cloud puff (top-right, cell center 480, 64 -> logical 240, 32)
            int[,] c3Puffs = {
                { 232, 34, 10 }, { 246, 30, 13 }, { 256, 34, 9 }
            };
            for (int i = 0; i < 3; i++) drawPuff(c3Puffs[i, 0], c3Puffs[i, 1], c3Puffs[i, 2], c3Puffs[i, 2], 2, false);

            // Cloud 4: Long wispy stratus cloud (bottom-left, logical 48, 96)
            int[,] c4Puffs = {
                { 24, 98, 8 }, { 38, 94, 10 }, { 54, 92, 12 }, { 70, 94, 11 }, { 86, 98, 8 }
            };
            for (int i = 0; i < 5; i++) drawPuff(c4Puffs[i, 0], c4Puffs[i, 1], c4Puffs[i, 2], c4Puffs[i, 2], 3, false);

            // Cloud 5: Warm sunset-kissed meadow cloud (bottom-mid, logical 144, 96)
            int[,] c5Puffs = {
                { 126, 98, 11 }, { 142, 92, 16 }, { 160, 96, 12 }
            };
            for (int i = 0; i < 3; i++) drawPuff(c5Puffs[i, 0], c5Puffs[i, 1], c5Puffs[i, 2], c5Puffs[i, 2], 4, true);

            // Cloud 6: Flat-bottomed classic platformer cloud (bottom-right, logical 240, 96)
            int[,] c6Puffs = {
                { 224, 94, 11 }, { 238, 88, 15 }, { 252, 90, 13 }, { 264, 96, 9 }
            };
            for (int i = 0; i < 4; i++) drawPuff(c6Puffs[i, 0], c6Puffs[i, 1], c6Puffs[i, 2], c6Puffs[i, 2], 5, false);
            // Flat base trim
            for (int x = 216; x <= 270; x++) {
                Pixel(g, cOut, x, 104);
                Pixel(g, cDeep, x, 103);
            }

            bmp.Save(destPath, ImageFormat.Png);
        }
    }

    public static void GenerateMoon(string destPath) {
        // 4 moon sprites in horizontal row: 128x128 each -> 512x128
        using (var bmp = new Bitmap(512, 128, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp)) {
            g.Clear(Color.Transparent);

            var cOut = new SolidBrush(Color.FromArgb(255, 30, 41, 59));     // Dark slate outline
            var cAura = new SolidBrush(Color.FromArgb(90, 169, 214, 229));  // Translucent lunar glow
            var cDeep = new SolidBrush(Color.FromArgb(255, 100, 116, 139)); // Crater gray
            var cMid = new SolidBrush(Color.FromArgb(255, 203, 213, 225));  // Lunar slate
            var cLight = new SolidBrush(Color.FromArgb(255, 241, 245, 249)); // Bright lunar white
            var cGoldAura = new SolidBrush(Color.FromArgb(255, 254, 240, 138));

            // --- 1. Elegant Crescent Moon (x: 0..127, logical 32, 32)
            int ox1 = 32, oy1 = 32, r1 = 18;
            for (int y = -r1; y <= r1; y++) {
                for (int x = -r1; x <= r1; x++) {
                    int dOuter = x * x + y * y;
                    int xInner = x - 9;
                    int dInner = xInner * xInner + (y - 1) * (y - 1);
                    if (dOuter <= r1 * r1 && dInner >= 14 * 14) {
                        bool edge = (dOuter >= (r1 - 1) * (r1 - 1) || dInner <= 15 * 15);
                        Pixel(g, edge ? cOut : cLight, ox1 + x, oy1 + y);
                    }
                }
            }

            // --- 2. Full Cratered Moon (x: 128..255, logical 96, 32)
            int ox2 = 96, oy2 = 32, r2 = 18;
            Circle(g, cOut, ox2, oy2, r2);
            Circle(g, cMid, ox2, oy2, r2 - 1);
            Circle(g, cLight, ox2, oy2, r2 - 2);
            // Lunar craters (mare)
            Circle(g, cDeep, ox2 - 5, oy2 - 4, 4);
            Circle(g, cMid, ox2 - 5, oy2 - 4, 3);
            Circle(g, cDeep, ox2 + 6, oy2 + 3, 5);
            Circle(g, cMid, ox2 + 6, oy2 + 3, 4);
            Circle(g, cDeep, ox2 - 2, oy2 + 8, 3);
            Circle(g, cDeep, ox2 + 4, oy2 - 8, 3);

            // --- 3. Cozy Sleepy Crescent Moon (x: 256..383, logical 160, 32)
            int ox3 = 160, oy3 = 32, r3 = 18;
            for (int y = -r3; y <= r3; y++) {
                for (int x = -r3; x <= r3; x++) {
                    int dOuter = x * x + y * y;
                    int xInner = x - 8;
                    int dInner = xInner * xInner + y * y;
                    if (dOuter <= r3 * r3 && dInner >= 13 * 13) {
                        bool edge = (dOuter >= (r3 - 1) * (r3 - 1) || dInner <= 14 * 14);
                        Pixel(g, edge ? cOut : cGoldAura, ox3 + x, oy3 + y);
                    }
                }
            }
            // Closed peaceful eye curve
            Pixel(g, cOut, ox3 - 2, oy3 - 1);
            Pixel(g, cOut, ox3 - 1, oy3);
            Pixel(g, cOut, ox3, oy3);
            Pixel(g, cOut, ox3 + 1, oy3 - 1);

            // --- 4. Gibbous Moon (x: 384..511, logical 224, 32)
            int ox4 = 224, oy4 = 32, r4 = 18;
            Circle(g, cOut, ox4, oy4, r4);
            Circle(g, cMid, ox4, oy4, r4 - 1);
            for (int y = -r4; y <= r4; y++) {
                for (int x = -r4; x <= r4; x++) {
                    if (x * x + y * y <= (r4 - 1) * (r4 - 1)) {
                        int xCut = x - 6;
                        if (xCut * xCut / 2 + y * y <= r4 * r4) {
                            Pixel(g, cLight, ox4 + x, oy4 + y);
                        }
                    }
                }
            }
            Circle(g, cDeep, ox4 - 3, oy4 + 2, 4);
            Circle(g, cMid, ox4 - 3, oy4 + 2, 3);

            bmp.Save(destPath, ImageFormat.Png);
        }
    }

    public static void GenerateStars(string destPath) {
        // 6 star sprites in 2 rows of 3: cell 64x64 -> 192x128
        using (var bmp = new Bitmap(192, 128, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(bmp)) {
            g.Clear(Color.Transparent);

            var cOut = new SolidBrush(Color.FromArgb(255, 61, 52, 16));     // Deep dark amber
            var cGold = new SolidBrush(Color.FromArgb(255, 255, 209, 102)); // Gold body
            var cYellow = new SolidBrush(Color.FromArgb(255, 255, 243, 176)); // Bright yellow
            var cWhite = new SolidBrush(Color.FromArgb(255, 255, 255, 255));
            var cCyan = new SolidBrush(Color.FromArgb(255, 128, 255, 219));  // Cyan sparkle

            // --- Star 1: 4-Point Diamond Twinkle (cell 1: 0, 0, logical 16, 16)
            int s1x = 16, s1y = 16;
            for (int d = -8; d <= 8; d++) {
                int w = Math.Max(0, 3 - Math.Abs(d) / 2);
                for (int s = -w; s <= w; s++) {
                    Pixel(g, (Math.Abs(d) >= 7 || Math.Abs(s) == w) ? cGold : cWhite, s1x + d, s1y + s);
                    Pixel(g, (Math.Abs(d) >= 7 || Math.Abs(s) == w) ? cGold : cWhite, s1x + s, s1y + d);
                }
            }
            Pixel(g, cWhite, s1x, s1y);

            // --- Star 2: Large Cross Sparkle (cell 2: 64, 0, logical 48, 16)
            int s2x = 48, s2y = 16;
            for (int d = -11; d <= 11; d++) {
                Pixel(g, Math.Abs(d) <= 4 ? cWhite : (Math.Abs(d) <= 8 ? cCyan : cGold), s2x + d, s2y);
                Pixel(g, Math.Abs(d) <= 4 ? cWhite : (Math.Abs(d) <= 8 ? cCyan : cGold), s2x, s2y + d);
            }
            for (int d = -5; d <= 5; d++) {
                if (d != 0) {
                    Pixel(g, cYellow, s2x + d, s2y + d);
                    Pixel(g, cYellow, s2x + d, s2y - d);
                }
            }

            // --- Star 3: Cluster of Meadow Stars (cell 3: 128, 0, logical 80, 16)
            int[,] cluster = { { 74, 12 }, { 86, 10 }, { 80, 20 }, { 72, 22 }, { 88, 21 } };
            for (int i = 0; i < 5; i++) {
                int cx = cluster[i, 0], cy = cluster[i, 1];
                Pixel(g, cOut, cx, cy - 1); Pixel(g, cOut, cx, cy + 1);
                Pixel(g, cOut, cx - 1, cy); Pixel(g, cOut, cx + 1, cy);
                Pixel(g, (i % 2 == 0) ? cWhite : cCyan, cx, cy);
            }

            // --- Star 4: Shooting Star with Trail (cell 4: 0, 64, logical 16, 48)
            int s4x = 22, s4y = 42;
            // Arc trail
            for (int t = 1; t <= 14; t++) {
                int tx = s4x - t;
                int ty = s4y + (int)(t * 0.8);
                Pixel(g, (t < 5) ? cWhite : (t < 9 ? cYellow : cCyan), tx, ty);
                if (t < 8) Pixel(g, cGold, tx, ty + 1);
            }
            // Head
            Circle(g, cOut, s4x, s4y, 4);
            Circle(g, cGold, s4x, s4y, 3);
            Circle(g, cWhite, s4x, s4y, 2);

            // --- Star 5: 5-Point Classic Retro Star (cell 5: 64, 64, logical 48, 48)
            int s5x = 48, s5y = 48;
            Circle(g, cOut, s5x, s5y, 8);
            Circle(g, cGold, s5x, s5y, 7);
            Circle(g, cYellow, s5x, s5y, 5);
            // 5 tips
            for (int a = 0; a < 5; a++) {
                double rad = a * 2.0 * Math.PI / 5.0 - Math.PI / 2.0;
                int tipX = s5x + (int)Math.Round(Math.Cos(rad) * 11);
                int tipY = s5y + (int)Math.Round(Math.Sin(rad) * 11);
                Pixel(g, cOut, tipX, tipY);
            }
            Pixel(g, cWhite, s5x - 2, s5y - 2);

            // --- Star 6: Cosmic Triple Sparkle (cell 6: 128, 64, logical 80, 48)
            int[,] triple = { { 76, 46 }, { 85, 42 }, { 83, 52 } };
            for (int i = 0; i < 3; i++) {
                int tx = triple[i, 0], ty = triple[i, 1];
                Pixel(g, cOut, tx - 2, ty); Pixel(g, cOut, tx + 2, ty);
                Pixel(g, cOut, tx, ty - 2); Pixel(g, cOut, tx, ty + 2);
                Pixel(g, cGold, tx - 1, ty); Pixel(g, cGold, tx + 1, ty);
                Pixel(g, cGold, tx, ty - 1); Pixel(g, cGold, tx, ty + 1);
                Pixel(g, cWhite, tx, ty);
            }

            bmp.Save(destPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $csharpCode -Language CSharp -ReferencedAssemblies "System.Drawing"

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $projectRoot "game\assets"
$artSourcesDir = Join-Path $projectRoot "design\art\sources"

New-Item -ItemType Directory -Force -Path $assetDir, $artSourcesDir | Out-Null

$sunPng = Join-Path $assetDir "sun.png"
$cloudsPng = Join-Path $assetDir "clouds.png"
$moonPng = Join-Path $assetDir "moon.png"
$starsPng = Join-Path $assetDir "stars.png"

Write-Output "Generating Sun sprites..."
[CelestialArtist]::GenerateSun($sunPng)
Copy-Item -LiteralPath $sunPng -Destination (Join-Path $artSourcesDir "sun-source.png") -Force
Write-Output "Saved $sunPng"

Write-Output "Generating Cloud sprites..."
[CelestialArtist]::GenerateClouds($cloudsPng)
Copy-Item -LiteralPath $cloudsPng -Destination (Join-Path $artSourcesDir "clouds-source.png") -Force
Write-Output "Saved $cloudsPng"

Write-Output "Generating Moon sprites..."
[CelestialArtist]::GenerateMoon($moonPng)
Copy-Item -LiteralPath $moonPng -Destination (Join-Path $artSourcesDir "moon-source.png") -Force
Write-Output "Saved $moonPng"

Write-Output "Generating Star sprites..."
[CelestialArtist]::GenerateStars($starsPng)
Copy-Item -LiteralPath $starsPng -Destination (Join-Path $artSourcesDir "stars-source.png") -Force
Write-Output "Saved $starsPng"

Write-Output "All celestial sprites generated successfully!"
