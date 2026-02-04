$root = "D:\外贸\WH"
$pages = @("about", "products", "contact", "news", "faq", "quality", "applications", "landing-page", "thank-you")

foreach ($page in $pages) {
    $srcPath = Join-Path $root "$page.html"
    if (Test-Path $srcPath) {
        $content = Get-Content $srcPath -Raw -Encoding UTF8
        
        # 1. Assets
        $content = $content -replace '(src|href)="(assets|css|js)/', '$1="../$2/'
        $content = $content -replace '(src|href)="favicon', '$1="../favicon'
        
        # 2. Nav Links
        # index.html -> ../
        $content = $content -replace 'href="index.html"', 'href="../"'
        
        # Other pages
        foreach ($p in $pages) {
            if ($p -eq $page) {
                # Self ref: href="products.html#black" -> href="#black"
                # Use regex to capture hash if present
                $content = $content -replace "href=""$p\.html(#.*?)""", 'href="$1"'
                $content = $content -replace "href=""$p\.html""", 'href="./"'
            } else {
                # External ref: href="products.html#black" -> href="../products/#black"
                $content = $content -replace "href=""$p\.html(#.*?)""", "href=""../$p/`$1"""
                $content = $content -replace "href=""$p\.html""", "href=""../$p/"""
            }
        }
        
        # 3. Canonical/OG/JSON-LD
        # Replace https://slmmb.com/page.html with https://slmmb.com/page/
        $content = $content -replace 'https://slmmb.com/([a-zA-Z0-9-]+)\.html', 'https://slmmb.com/$1/'

        # Write
        $destDir = Join-Path $root $page
        if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
        $destPath = Join-Path $destDir "index.html"
        $content | Set-Content $destPath -Encoding UTF8
        Write-Host "Migrated $page"
    }
}

# Homepage
$indexPath = Join-Path $root "index.html"
$content = Get-Content $indexPath -Raw -Encoding UTF8
foreach ($p in $pages) {
    $content = $content -replace "href=""$p\.html(#.*?)""", "href=""$p/`$1"""
    $content = $content -replace "href=""$p\.html""", "href=""$p/"""
}
# Canonical
$content = $content -replace 'https://slmmb.com/([a-zA-Z0-9-]+)\.html', 'https://slmmb.com/$1/'
$content | Set-Content $indexPath -Encoding UTF8
Write-Host "Updated index.html"

# Sitemap
$sitemapPath = Join-Path $root "sitemap.xml"
if (Test-Path $sitemapPath) {
    $content = Get-Content $sitemapPath -Raw -Encoding UTF8
    $content = $content -replace 'https://slmmb.com/([a-zA-Z0-9-]+)\.html', 'https://slmmb.com/$1/'
    $content = $content -replace 'https://slmmb.com/index.html', 'https://slmmb.com/'
    $content | Set-Content $sitemapPath -Encoding UTF8
    Write-Host "Updated sitemap.xml"
}
