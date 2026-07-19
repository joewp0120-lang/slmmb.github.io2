const fs = require('fs');
const path = require('path');

const SITE_URL = (process.env.SITE_URL || 'https://www.slmmb.com').replace(/\/+$/, '');
const ROOT_DIR = __dirname;
const LOCALES = ['en', 'ar', 'id', 'es'];
const OUTPUT_FILES = {
  index: path.join(ROOT_DIR, 'sitemap.xml'),
  en: path.join(ROOT_DIR, 'sitemap-en.xml'),
  ar: path.join(ROOT_DIR, 'sitemap-ar.xml'),
  id: path.join(ROOT_DIR, 'sitemap-id.xml'),
  es: path.join(ROOT_DIR, 'sitemap-es.xml'),
};

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

function getLocaleAndBasePath(urlPath) {
  const match = urlPath.match(/^\/(ar|id|es)(\/.*|\/?)$/i);
  if (!match) {
    return { locale: 'en', basePath: urlPath };
  }

  const locale = match[1].toLowerCase();
  const suffix = match[2] || '/';
  const basePath = suffix === '/' ? '/' : suffix;
  return { locale, basePath };
}

function compareByUrlPath(a, b) {
  if (a.urlPath === '/' && b.urlPath !== '/') return -1;
  if (a.urlPath !== '/' && b.urlPath === '/') return 1;
  return a.urlPath.localeCompare(b.urlPath);
}

function buildUrlTag(page, alternates) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(encodeURI(page.loc))}</loc>`,
    `    <lastmod>${escapeXml(page.lastmod)}</lastmod>`,
  ];

  if (alternates && alternates.length > 0) {
    alternates.forEach((alternate) => {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(encodeURI(alternate.href))}" />`
      );
    });
  }

  lines.push('  </url>');
  return lines.join('\n');
}

function buildAlternatesMap(allPages) {
  const byBasePath = new Map();

  allPages.forEach((page) => {
    if (!LOCALES.includes(page.locale)) return;
    if (!byBasePath.has(page.basePath)) {
      byBasePath.set(page.basePath, new Map());
    }
    byBasePath.get(page.basePath).set(page.locale, page);
  });

  const alternateMap = new Map();

  byBasePath.forEach((localeMap, basePath) => {
    const englishPage = localeMap.get('en');
    if (!englishPage) return;

    const alternates = [];
    LOCALES.forEach((locale) => {
      const page = localeMap.get(locale);
      if (!page) return;
      alternates.push({ hreflang: locale, href: page.loc });
    });
    alternates.push({ hreflang: 'x-default', href: englishPage.loc });

    localeMap.forEach((page) => {
      alternateMap.set(page.loc, alternates);
    });
  });

  return alternateMap;
}

function buildLocaleSitemap(locale, pages, alternateMap) {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    pages
      .sort(compareByUrlPath)
      .map((page) => buildUrlTag(page, alternateMap.get(page.loc) || []))
      .join('\n') +
    `\n</urlset>\n`;

  fs.writeFileSync(OUTPUT_FILES[locale], xml, 'utf8');
}

function buildSitemapIndex(localePagesMap) {
  const localeEntries = LOCALES.map((locale) => {
    const pages = localePagesMap.get(locale) || [];
    const lastmod = pages.reduce((latest, page) => (page.lastmod > latest ? page.lastmod : latest), '1970-01-01');
    return {
      loc: `${SITE_URL}/${path.basename(OUTPUT_FILES[locale])}`,
      lastmod,
    };
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    localeEntries
      .map((entry) => {
        return (
          `  <sitemap>\n` +
          `    <loc>${escapeXml(encodeURI(entry.loc))}</loc>\n` +
          `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n` +
          `  </sitemap>`
        );
      })
      .join('\n') +
    `\n</sitemapindex>\n`;

  fs.writeFileSync(OUTPUT_FILES.index, xml, 'utf8');
}

function main() {
  const files = [];
  walkHtmlFiles(ROOT_DIR, files);

  const allPages = files
    .map((filePath) => {
      const stat = fs.statSync(filePath);
      const urlPath = filePathToUrlPath(filePath);
      const { locale, basePath } = getLocaleAndBasePath(urlPath);
      return {
        filePath,
        locale,
        basePath,
        urlPath,
        loc: `${SITE_URL}${urlPath}`,
        lastmod: toIsoDate(stat.mtime),
      };
    })
    .sort(compareByUrlPath);

  const localePagesMap = new Map();
  LOCALES.forEach((locale) => localePagesMap.set(locale, []));
  allPages.forEach((page) => {
    if (localePagesMap.has(page.locale)) {
      localePagesMap.get(page.locale).push(page);
    }
  });

  const alternateMap = buildAlternatesMap(allPages);

  LOCALES.forEach((locale) => {
    buildLocaleSitemap(locale, localePagesMap.get(locale) || [], alternateMap);
  });

  buildSitemapIndex(localePagesMap);

  console.log(`[generate-sitemap] Base URL: ${SITE_URL}`);
  console.log(`[generate-sitemap] HTML files found: ${files.length}`);
  LOCALES.forEach((locale) => {
    console.log(`[generate-sitemap] ${path.basename(OUTPUT_FILES[locale])}: ${(localePagesMap.get(locale) || []).length} URLs`);
  });
  console.log(`[generate-sitemap] sitemap index written: ${OUTPUT_FILES.index}`);
}

main();
