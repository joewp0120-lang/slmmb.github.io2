$root = "D:\外贸\WH"
$files = Get-ChildItem -Path $root -Recurse -Filter "index.html"

# 1. Cleanup Preconnects
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Remove specific lines
    $content = $content -replace '<link rel="preconnect" href="https://fonts.googleapis.com">\s*', ''
    $content = $content -replace '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\s*', ''
    $content = $content -replace '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>\s*', ''
    
    if ($content -ne $original) {
        $content | Set-Content $file.FullName -Encoding UTF8
        Write-Host "Cleaned preconnects in $($file.FullName)"
    }
}

# 2. Update Sitemap
$sitemapPath = Join-Path $root "sitemap.xml"
if (Test-Path $sitemapPath) {
    $content = Get-Content $sitemapPath -Raw -Encoding UTF8
    
    # Replace .html with /
    # Exclude .html if it is inside lastmod or something else? No, usually in <loc>
    # <loc>https://slmmb.com/products.html</loc>
    
    $content = $content -replace 'https://slmmb.com/index.html', 'https://slmmb.com/'
    $content = $content -replace 'https://slmmb.com/([a-zA-Z0-9-]+)\.html', 'https://slmmb.com/$1/'
    
    $content | Set-Content $sitemapPath -Encoding UTF8
    Write-Host "Updated sitemap.xml"
}
