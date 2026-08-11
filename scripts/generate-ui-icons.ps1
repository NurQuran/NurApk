param([Parameter(Mandatory=$true)][string]$OutputDirectory)

Add-Type -AssemblyName System.Drawing
$resolved = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($resolved) | Out-Null

function New-Canvas([string]$Name, [scriptblock]$Draw) {
  $bitmap = New-Object System.Drawing.Bitmap 96, 96, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 12, 24, 20)), 7
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  & $Draw $graphics $pen
  $bitmap.Save((Join-Path $resolved "$Name.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

New-Canvas "settings" { param($g,$p)
  $g.DrawLine($p,18,29,78,29); $g.DrawLine($p,18,67,78,67)
  $brush=New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,12,24,20))
  $g.FillEllipse($brush,30,19,20,20); $g.FillEllipse($brush,52,57,20,20); $brush.Dispose()
}
New-Canvas "sun" { param($g,$p)
  $g.DrawEllipse($p,31,31,34,34)
  foreach($line in @(@(48,9,48,20),@(48,76,48,87),@(9,48,20,48),@(76,48,87,48),@(20,20,28,28),@(68,68,76,76),@(68,28,76,20),@(20,76,28,68))){$g.DrawLine($p,$line[0],$line[1],$line[2],$line[3])}
}
New-Canvas "moon" { param($g,$p)
  $path=New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(20,13,62,70,75,210);$path.AddArc(36,6,55,66,278,-190);$path.CloseFigure();$g.DrawPath($p,$path);$path.Dispose()
}
New-Canvas "play" { param($g,$p)
  $path=New-Object System.Drawing.Drawing2D.GraphicsPath;$path.AddPolygon([System.Drawing.Point[]]@((New-Object System.Drawing.Point 35,23),(New-Object System.Drawing.Point 73,48),(New-Object System.Drawing.Point 35,73)));$g.DrawPath($p,$path);$path.Dispose()
}
New-Canvas "pause" { param($g,$p) $g.DrawLine($p,35,23,35,73);$g.DrawLine($p,61,23,61,73) }
New-Canvas "search" { param($g,$p) $g.DrawEllipse($p,19,17,48,48);$g.DrawLine($p,61,61,79,79) }
New-Canvas "heart" { param($g,$p)
  $path=New-Object System.Drawing.Drawing2D.GraphicsPath;$path.AddBezier(48,79,14,57,16,26,33,22);$path.AddBezier(33,22,43,20,48,31,48,31);$path.AddBezier(48,31,53,20,63,22,63,22);$path.AddBezier(63,22,80,26,82,57,48,79);$g.DrawPath($p,$path);$path.Dispose()
}
New-Canvas "close" { param($g,$p) $g.DrawLine($p,25,25,71,71);$g.DrawLine($p,71,25,25,71) }
New-Canvas "download" { param($g,$p) $g.DrawLine($p,48,15,48,61);$g.DrawLine($p,30,45,48,63);$g.DrawLine($p,66,45,48,63);$g.DrawLine($p,21,79,75,79) }
