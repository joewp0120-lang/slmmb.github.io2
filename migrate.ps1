$root = Get-Location
Write-Host "Root is: $root"
$pages = @("about", "products", "contact", "news", "faq", "quality", "applications", "landing-page", "thank-you")

# Function to perform regex replace with callback
function Regex-Replace-Callback {
    param(
        [string]$InputString,
        [string]$Pattern,
        [scriptblock]$Callback
    )
    
    $re = [regex]::new($Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $evaluator = { param($match) return $Callback.Invoke($match) }
    return $re.Replace($InputString, $evaluator)
}

# 1. Process Pages -> Subfolders
foreach ($page in $pages) {
    $srcPath = Join-Path $root "$page.html"
    Write-Host "Checking $srcPath"
    if (Test-Path $srcPath) {
        $content = Get-Content $srcPath -Raw -Encoding UTF8
        
        # 1. Assets (Prepend ../)
        # Handle src="assets/..." or src='assets/...'
        $content = Regex-Replace-Callback -InputString $content -Pattern '(src|href)=["''](assets|css|js)/' -Callback { 
            param($m) 
            $prefix = $m.Groups[1].Value
            $folder = $m.Groups[2].Value
            return "$prefix=""../$folder/"
        }
        
        # Handle url('assets/...')
        $content = Regex-Replace-Callback -InputString $content -Pattern 'url\([''"]?(assets/)' -Callback {
            param($m)
            return "url('../assets/"
        }
        
        # 2. Nav Links
        # index.html -> ../
        $content = Regex-Replace-Callback -InputString $content -Pattern 'href=["'']index\.html["'']' -Callback { return 'href="../"' }
        
        # Handle blog links: href="blog/..." -> href="../blog/..."
        $content = Regex-Replace-Callback -InputString $content -Pattern 'href=["''](blog/[^"'']+)["'']' -Callback {
            param($m)
            $link = $m.Groups[1].Value
            return "href=""../$link"""
        }

        # Other pages
        foreach ($p in $pages) {
            # href="page.html" -> href="../page/" (from subpage to sibling subpage)
            # href="page.html#anchor" -> href="../page/#anchor"
            
            # Pattern: href=["'](page.html)(#.*)?["']
            $pat = 'href=["'']' + [regex]::Escape("$p.html") + '((?:#[^"'']*)?)["'']'
            
            $content = Regex-Replace-Callback -InputString $content -Pattern $pat -Callback {
                param($m)
                $anchor = $m.Groups[1].Value
                if ($p -eq $page) {
                     # Self link: href="./" or href="#anchor"
                     if ($anchor) { return "href=""$anchor""" }
                     else { return "href=""./""" }
                } else {
                     return "href=""../$p/$anchor"""
                }
            }
        }
        
        # 3. Canonical/OG/JSON-LD URLs
        # https://slmmb.com/page.html -> https://slmmb.com/page/
        foreach ($p in $pages) {
            $pat = 'https://slmmb\.com/' + [regex]::Escape("$p.html")
            $content = Regex-Replace-Callback -InputString $content -Pattern $pat -Callback { return "https://slmmb.com/$p/" }
        }
        
        # Write
        $destDir = Join-Path $root $page
        if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
        $destPath = Join-Path $destDir "index.html"
        $content | Set-Content $destPath -Encoding UTF8
        Write-Host "Migrated $page to $page/index.html"
    } else {
        Write-Host "File not found: $srcPath"
    }
}

# 2. Process Homepage (index.html)
$indexPath = Join-Path $root "index.html"
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw -Encoding UTF8
    
    foreach ($p in $pages) {
        # href="page.html" -> href="page/"
        $pat = 'href=["'']' + [regex]::Escape("$p.html") + '((?:#[^"'']*)?)["'']'
        $content = Regex-Replace-Callback -InputString $content -Pattern $pat -Callback {
            param($m)
            $anchor = $m.Groups[1].Value
            return "href=""$p/$anchor"""
        }
    }
    
    # index.html -> ./
    $content = $content -replace 'href="index.html"', 'href="./"'
    
    # Update canonical if it points to index.html
    $content = $content -replace 'href="https://slmmb.com/index.html"', 'href="https://slmmb.com/"'
    
    # Update absolute URLs for other pages
    foreach ($p in $pages) {
        $pat = 'https://slmmb\.com/' + [regex]::Escape("$p.html")
        $content = Regex-Replace-Callback -InputString $content -Pattern $pat -Callback { return "https://slmmb.com/$p/" }
    }
    
    $content | Set-Content $indexPath -Encoding UTF8
    Write-Host "Updated index.html"
}

# 3. Process Blog Pages
$blogDir = Join-Path $root "blog"
if (Test-Path $blogDir) {
    $blogFiles = Get-ChildItem $blogDir -Filter "*.html"
    foreach ($file in $blogFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # Blog pages are already at depth 1.
        # href="../index.html" -> href="../"
        $content = Regex-Replace-Callback -InputString $content -Pattern 'href=["'']\.\./index\.html["'']' -Callback { return 'href="../"' }
        
        # href="../page.html" -> href="../page/"
        foreach ($p in $pages) {
            $pat = 'href=["'']\.\./' + [regex]::Escape("$p.html") + '((?:#[^"'']*)?)["'']'
            $content = Regex-Replace-Callback -InputString $content -Pattern $pat -Callback {
                param($m)
                $anchor = $m.Groups[1].Value
                return "href=""../$p/$anchor"""
            }
            
            # Absolute URLs
            $pat = 'https://slmmb\.com/' + [regex]::Escape("$p.html")
            $content = Regex-Replace-Callback -InputString $content -Pattern $pat -Callback { return "https://slmmb.com/$p/" }
        }
        
        $content | Set-Content $file.FullName -Encoding UTF8
        Write-Host "Updated blog/$($file.Name)"
    }
}
