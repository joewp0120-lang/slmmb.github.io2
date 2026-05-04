const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SITE_URL = (process.env.SITE_URL || 'https://www.slmmb.com').replace(/\/+$/, '');
const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, 'data', 'products.json');
const PRODUCTS_DIR = path.join(ROOT_DIR, 'products');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function escapeHtml(input) {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(input) {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function categoryToFolder(categoryRaw) {
  const c = String(categoryRaw ?? '').toLowerCase();

  if (c.includes('black')) return 'black-masterbatch';
  if (c.includes('white')) return 'white-masterbatch';
  if (c.includes('petg') || c.includes('apet')) return 'petg-color-masterbatch';
  if (c.includes('flow') || c.includes('marble') || c.includes('wood')) return 'flow-masterbatch';
  if (c.includes('defoaming') || c.includes('desiccant')) return 'defoaming-masterbatch';
  if (c.includes('filler') || c.includes('caco3') || c.includes('calcium')) return 'filler-masterbatch';
  if (c.includes('functional') || c.includes('additive')) return 'functional-masterbatch';
  if (c.includes('color')) return 'color-masterbatch';

  const slug = slugify(categoryRaw);
  return slug || 'other';
}

function productCodeToFilename(productCode) {
  const base = slugify(productCode);
  return (base || 'unknown') + '.html';
}

function buildMetaDescription(product) {
  const englishName = String(product.english_name ?? '').trim();
  const code = String(product.product_code ?? '').trim();
  const category = String(product.category ?? '').trim();
  const materials = String(product.materials ?? '').trim();

  const parts = [];
  if (englishName || code) parts.push(`${englishName || 'Masterbatch'} ${code}`.trim());
  if (category) parts.push(category);
  if (materials) parts.push(`Compatible with ${materials}`);
  parts.push('FDA, NOM, INMETRO certified, supply to Mexico, Brazil, Indonesia');
  parts.push('Custom color matching, stable dispersion, factory-direct B2B export');

  return parts.join('. ') + '.';
}

function buildKeywords(product, folderSlug) {
  const englishName = String(product.english_name ?? '').trim();
  const code = String(product.product_code ?? '').trim();
  const materials = String(product.materials ?? '').trim();

  const family =
    folderSlug === 'black-masterbatch' ? 'black masterbatch' :
    folderSlug === 'white-masterbatch' ? 'white masterbatch' :
    folderSlug === 'color-masterbatch' ? 'color masterbatch' :
    folderSlug === 'petg-color-masterbatch' ? 'PETG color masterbatch' :
    folderSlug === 'flow-masterbatch' ? 'flow masterbatch' :
    folderSlug === 'filler-masterbatch' ? 'filler masterbatch' :
    folderSlug === 'defoaming-masterbatch' ? 'defoaming masterbatch' :
    folderSlug === 'functional-masterbatch' ? 'functional masterbatch' :
    'masterbatch';

  const candidates = [
    `${family} ${code}`.trim(),
    `${englishName}`.trim(),
    `${englishName} supplier`.trim(),
    `${family} manufacturer`.trim(),
    `custom ${family}`.trim(),
    `${family} for ${materials}`.trim(),
    `FDA compliant ${family}`.trim(),
    `NOM INMETRO certified ${family}`.trim(),
    `${family} supplier Mexico`.trim(),
    `${family} supplier Brazil`.trim(),
    `${family} supplier Indonesia`.trim(),
    `SLMMB ${family}`.trim(),
  ];

  const unique = [];
  const seen = new Set();
  for (const item of candidates) {
    const normalized = item.replace(/\s+/g, ' ').trim();
    if (!normalized) continue;
    if (seen.has(normalized.toLowerCase())) continue;
    seen.add(normalized.toLowerCase());
    unique.push(normalized);
  }

  return unique.slice(0, 12).join(', ');
}

function buildInquiryToken(productCode) {
  return crypto.createHash('sha1').update(String(productCode ?? '')).digest('hex').slice(0, 10);
}

function renderProductPage({ product, folderSlug, filename }) {
  const englishName = String(product.english_name ?? '').trim() || 'Masterbatch Product';
  const chineseName = String(product.chinese_name ?? '').trim();
  const productCode = String(product.product_code ?? '').trim();
  const category = String(product.category ?? '').trim();
  const materials = String(product.materials ?? '').trim();
  const packaging = String(product.packaging ?? '').trim();
  const moq = String(product.moq ?? '').trim();
  const origin = String(product.origin ?? '').trim();
  const hsCode = String(product.hs_code ?? '').trim();
  const grade = String(product.grade ?? '').trim();

  const title = `${englishName} ${productCode} | Custom Masterbatch Manufacturer | SLMMB`.replace(/\s+/g, ' ').trim();
  const description = buildMetaDescription(product);
  const keywords = buildKeywords(product, folderSlug);

  const inquiryToken = buildInquiryToken(productCode);
  const nextUrl = `${SITE_URL}/thank-you/`;

  const formSubject = `INQ-${inquiryToken}-${productCode}`.replace(/\s+/g, ' ').trim();
  const canonicalPath = `/products/${folderSlug}/${filename}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
</head>
<body>
  <main>
    <h1>${escapeHtml(englishName)} ${escapeHtml(productCode)}</h1>

    <section>
      <p><strong>Product code:</strong> ${escapeHtml(productCode)}</p>
      ${category ? `<p><strong>Category:</strong> ${escapeHtml(category)}</p>` : ''}
      ${chineseName ? `<p><strong>Chinese name:</strong> ${escapeHtml(chineseName)}</p>` : ''}
      ${materials ? `<p><strong>Applicable materials:</strong> ${escapeHtml(materials)}</p>` : ''}
      ${grade ? `<p><strong>Grade:</strong> ${escapeHtml(grade)}</p>` : ''}
      ${origin ? `<p><strong>Origin:</strong> ${escapeHtml(origin)}</p>` : ''}
      ${packaging ? `<p><strong>Packaging:</strong> ${escapeHtml(packaging)}</p>` : ''}
      ${moq ? `<p><strong>MOQ:</strong> ${escapeHtml(moq)}</p>` : ''}
      ${hsCode ? `<p><strong>HS code:</strong> ${escapeHtml(hsCode)}</p>` : ''}
      <p><strong>Target markets:</strong> Mexico, Brazil, Indonesia</p>
      <p><strong>Certifications:</strong> FDA, NOM, INMETRO</p>
      <p><strong>Official URL:</strong> <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a></p>
    </section>

    <section>
      <h2>Request a Quote</h2>
      <form method="POST" action="https://formsubmit.co/salesl.dorothy@gmail.com">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_next" value="${escapeHtml(nextUrl)}">
        <input type="hidden" name="_subject" value="${escapeHtml(formSubject)}">
        <input type="hidden" name="ProductCode" value="${escapeHtml(productCode)}">
        <input type="hidden" name="ProductName" value="${escapeHtml(englishName)}">
        <input type="hidden" name="Canonical" value="${escapeHtml(canonicalUrl)}">
        <div style="display:none">
          <label>Leave this field empty</label>
          <input type="text" name="company_website" autocomplete="off" tabindex="-1">
        </div>
        <p>
          <label>Name<br><input name="Name" required></label>
        </p>
        <p>
          <label>Email<br><input type="email" name="Email" required></label>
        </p>
        <p>
          <label>Country<br><input name="Country"></label>
        </p>
        <p>
          <label>Message<br><textarea name="Message" rows="6" required></textarea></label>
        </p>
        <button type="submit">Send Inquiry</button>
      </form>
    </section>
  </main>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Missing data file: ${DATA_FILE}`);
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('products.json must be a JSON array');
  }

  ensureDirSync(PRODUCTS_DIR);

  let written = 0;
  for (const product of data) {
    const productCode = String(product?.product_code ?? '').trim();
    if (!productCode) continue;

    const folderSlug = categoryToFolder(product.category);
    const outDir = path.join(PRODUCTS_DIR, folderSlug);
    ensureDirSync(outDir);

    const filename = productCodeToFilename(productCode);
    const outPath = path.join(outDir, filename);

    const html = renderProductPage({ product, folderSlug, filename });
    fs.writeFileSync(outPath, html, 'utf8');
    written += 1;
  }

  console.log(`[generate-pages] Products processed: ${data.length}`);
  console.log(`[generate-pages] Pages generated: ${written}`);
  console.log(`[generate-pages] Output root: ${PRODUCTS_DIR}`);
}

main();

