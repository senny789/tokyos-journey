$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
public static class ParkAtlas {
    public static int[][] Make(string source, string dest, int cellW, int cellH, int[][] cells) {
        var sizes = new int[cells.Length][];
        using (var src = new Bitmap(source))
        using (var dst = new Bitmap(cellW * cells.Length, cellH, PixelFormat.Format32bppArgb))
        using (var g = Graphics.FromImage(dst)) {
            // The dormant arch's enclosed white background was not keyed by the original edge flood fill.
            if (source.EndsWith("portal.png")) {
                for (int y=210;y<535;y++) for (int x=100;x<260;x++) {
                    var pixel=src.GetPixel(x,y);
                    if(pixel.R>235 && pixel.G>235 && pixel.B>235) src.SetPixel(x,y,Color.Transparent);
                }
            }
            g.InterpolationMode = InterpolationMode.NearestNeighbor;
            g.PixelOffsetMode = PixelOffsetMode.Half;
            for (int i=0; i<cells.Length; i++) {
                var c=cells[i]; int left=c[0]+c[2], right=c[0], top=c[1]+c[3], bottom=c[1];
                for(int y=c[1];y<c[1]+c[3];y++) for(int x=c[0];x<c[0]+c[2];x++) {
                    if(src.GetPixel(x,y).A<100) continue;
                    left=Math.Min(left,x);right=Math.Max(right,x);top=Math.Min(top,y);bottom=Math.Max(bottom,y);
                }
                int w=right-left+1,h=bottom-top+1;
                double scale=Math.Min((cellW-4.0)/w,(cellH-4.0)/h);
                int dw=(int)Math.Round(w*scale),dh=(int)Math.Round(h*scale);
                sizes[i] = new int[]{cellW,cellH,dw,dh};
                g.DrawImage(src,new Rectangle(i*cellW+(cellW-dw)/2,cellH-2-dh,dw,dh),new Rectangle(left,top,w,h),GraphicsUnit.Pixel);
            }
            dst.Save(dest,ImageFormat.Png);
        }
        return sizes;
    }
}
'@ -ReferencedAssemblies System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$metrics = @{}
function Make-Atlas($name, $w, $h, [int[][]]$cells) {
    $metrics[$name] = [ParkAtlas]::Make((Join-Path $root "game/assets/$name.png"), (Join-Path $root "game/assets/park-$name.png"), $w, $h, $cells)
}
Make-Atlas houses 256 240 @(@(0,0,427,768),@(427,0,320,768),@(747,0,275,768),@(1022,0,354,768))
Make-Atlas people 96 160 @(@(0,0,350,768),@(350,0,345,768),@(695,0,300,768),@(995,0,381,768))
Make-Atlas beds 128 96 @(@(0,0,345,768),@(345,0,355,768),@(700,0,390,768),@(1090,0,286,768))
Make-Atlas boxes 96 96 @(@(0,0,459,384),@(459,0,458,384),@(917,0,459,384),@(0,384,459,384),@(459,384,458,384),@(917,384,459,384))
Make-Atlas food 64 64 @(@(0,0,459,384),@(459,0,458,384),@(917,0,459,384),@(0,384,459,384),@(459,384,458,384),@(917,384,459,384))
Make-Atlas insects 40 40 @(@(0,0,459,430),@(459,0,430,430),@(889,0,487,430),@(0,430,430,338),@(430,430,459,338),@(889,430,487,338))
Make-Atlas sticks 64 64 @(@(0,0,400,448),@(400,0,400,448),@(800,0,400,448),@(0,448,400,448),@(400,448,400,448),@(800,448,400,448))
Make-Atlas bushes 128 112 @(@(0,0,255,768),@(255,0,305,768),@(560,0,150,768),@(710,0,230,768),@(940,0,188,768),@(1128,0,248,768))
Make-Atlas rocks 160 112 @(@(0,0,690,550),@(700,0,676,330),@(700,330,310,220),@(1010,330,366,220),@(0,550,690,218),@(700,550,310,218),@(1020,550,356,218))
Make-Atlas portal 192 240 @(@(0,0,345,768),@(345,0,340,768),@(685,0,338,768),@(1023,0,353,768))
Make-Atlas villain-dogs 112 112 @(@(0,0,365,414),@(365,0,330,414),@(695,0,309,414),@(1004,0,372,414),@(0,414,365,354),@(365,414,330,354),@(695,414,309,354),@(1004,414,372,354))
Make-Atlas treats 48 48 @(@(0,0,360,768),@(360,0,340,768),@(700,0,310,768),@(1010,0,366,768))
Make-Atlas clouds 192 128 @(@(110,0,250,128),@(110,0,250,128),@(400,0,176,128),@(0,128,210,128),@(210,128,180,128),@(390,128,186,128))
$metrics | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $root 'game/park-art.json') -Encoding UTF8
Write-Output 'Prepared 13 trimmed playground atlases from the existing sprite sheets.'
