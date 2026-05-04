const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://slmmb.com').replace(/\/+$/, '');
const ROOT_DIR = __dirname;
const OUTPUT_FILE = path.join(ROOT_DIR, 'sitemap.xml');

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
]);

function toIsoDate(date) {
  const d = new Date(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function escapeXml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isHtmlFileName(fileName) {
  return /\.html?$/i.test(fileName);
}

function walkHtmlFiles(dirPath, results) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walkHtmlFiles(fullPath, results);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!isHtmlFileName(entry.name)) continue;
    results.push(fullPath);
  }
}

function filePathToUrlPath(fullPath) {
  const rel = path.relative(ROOT_DIR, fullPath);
  const relPosix = rel.split(path.sep).join('/');

  if (relPosix.toLowerCase() === 'index.html') return '/';
  if (relPosix.toLowerCase().endsWith('/index.html')) {
    return '/' + relPosix.slice(0, -'/index.html'.length) + '/';
  }
  return '/' + relPosix;
}

function main() {
  const files = [];
  walkHtmlFiles(ROOT_DIR, files);

  const urls = files
    .map((filePath) => {
      const stat = fs.statSync(filePath);
      const urlPath = filePathToUrlPath(filePath);
      const loc = `${SITE_URL}${urlPath}`;
      const lastmod = toIsoDate(stat.mtime);
      return { loc, lastmod, urlPath };
    })
    .sort((a, b) => {
      if (a.urlPath === '/' && b.urlPath !== '/') return -1;
      if (a.urlPath !== '/' && b.urlPath === '/') return 1;
      return a.urlPath.localeCompare(b.urlPath);
    });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => {
        const loc = escapeXml(encodeURI(u.loc));
        return (
          `  <url>\n` +
          `    <loc>${loc}</loc>\n` +
          `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n` +
          `  </url>`
        );
      })
      .join('\n') +
    `\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

  console.log(`[generate-sitemap] Base URL: ${SITE_URL}`);
  console.log(`[generate-sitemap] HTML files found: ${files.length}`);
  console.log(`[generate-sitemap] sitemap.xml written: ${OUTPUT_FILE}`);
}

main();

