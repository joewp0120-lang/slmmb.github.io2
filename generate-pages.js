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

function splitMaterials(materialsRaw) {
  return String(materialsRaw ?? '')
    .split(/[,\|;]+|\/+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferCarrierResin(materialsRaw, folderSlug) {
  const materials = splitMaterials(materialsRaw).map((m) => m.toUpperCase());

  if (folderSlug === 'petg-color-masterbatch') return 'PETG / APET';

  const has = (token) => materials.some((m) => m.includes(token));
  const hits = [];

  if (has('ABS')) hits.push('ABS');
  if (has('PC')) hits.push('PC');
  if (has('PETG')) hits.push('PETG');
  if (has('PET')) hits.push('PET');
  if (has('PA')) hits.push('PA');
  if (has('POM')) hits.push('POM');
  if (has('PBT')) hits.push('PBT');
  if (has('PP')) hits.push('PP');
  if (has('PE') || has('HDPE') || has('LDPE') || has('LLDPE')) hits.push('PE');

  const unique = Array.from(new Set(hits));
  if (unique.length >= 2) return `${unique.slice(0, 2).join(' / ')} (customizable)`;
  if (unique.length === 1) return unique[0];

  if (folderSlug === 'black-masterbatch' || folderSlug === 'white-masterbatch' || folderSlug === 'color-masterbatch') {
    return 'PE / PP (customizable)';
  }

  return 'Customizable';
}

function inferDosage(folderSlug) {
  if (folderSlug === 'black-masterbatch') return '1% - 3%';
  if (folderSlug === 'white-masterbatch') return '2% - 5%';
  if (folderSlug === 'color-masterbatch') return '2% - 6%';
  if (folderSlug === 'petg-color-masterbatch') return '2% - 6%';
  if (folderSlug === 'flow-masterbatch') return '1% - 3%';
  if (folderSlug === 'defoaming-masterbatch') return '1% - 3%';
  if (folderSlug === 'functional-masterbatch') return '1% - 4%';
  if (folderSlug === 'filler-masterbatch') return '10% - 40%';
  return '2% - 5%';
}

function inferHeatResistance(materialsRaw, folderSlug) {
  const materials = splitMaterials(materialsRaw).map((m) => m.toUpperCase());
  const hasHighTemp = materials.some((m) => m.includes('PC') || m.includes('PA') || m.includes('PBT') || m.includes('POM') || m.includes('PET'));
  if (folderSlug === 'petg-color-masterbatch') return '220°C - 280°C';
  if (hasHighTemp) return '240°C - 300°C';
  return '200°C - 280°C';
}

function inferApplications(product, folderSlug) {
  const text = `${product?.english_name ?? ''} ${product?.chinese_name ?? ''} ${product?.category ?? ''}`.toLowerCase();
  const candidates = [];

  const includeIf = (cond, value) => {
    if (cond) candidates.push(value);
  };

  includeIf(text.includes('injection') || text.includes('注塑'), 'Injection Molding');
  includeIf(text.includes('blow') || text.includes('吹膜') || text.includes('吹塑'), 'Blow Film');
  includeIf(text.includes('extrusion') || text.includes('挤出'), 'Extrusion');
  includeIf(text.includes('pipe') || text.includes('管道'), 'Pipe Extrusion');
  includeIf(text.includes('film') || text.includes('薄膜'), 'Film');

  const unique = Array.from(new Set(candidates));
  if (unique.length) return unique.slice(0, 3).join(', ');

  if (folderSlug === 'black-masterbatch' || folderSlug === 'white-masterbatch' || folderSlug === 'color-masterbatch') {
    return 'Injection Molding, Blow Film, Extrusion';
  }

  if (folderSlug === 'filler-masterbatch') return 'Injection Molding, Extrusion';
  if (folderSlug === 'defoaming-masterbatch') return 'Blow Film, Extrusion';
  if (folderSlug === 'petg-color-masterbatch') return 'Injection Molding, Extrusion';
  return 'Injection Molding, Extrusion';
}

function inferCompliance(product) {
  const raw = String(product?.certifications ?? product?.certification ?? '').trim();
  if (raw) return raw;
  return 'FDA, RoHS, REACH, NOM';
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

  const carrierResin = inferCarrierResin(materials, folderSlug);
  const dosage = inferDosage(folderSlug);
  const heatResistance = inferHeatResistance(materials, folderSlug);
  const application = inferApplications(product, folderSlug);
  const compliance = inferCompliance(product);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <link rel="stylesheet" href="../../css/bootstrap.min.css">
  <link rel="stylesheet" href="../../css/style.css">
</head>
<body class="lang-en">
  <main class="container py-5">
    <h1 class="mb-4">${escapeHtml(englishName)} ${escapeHtml(productCode)}</h1>

    <section class="mb-4">
      <h2 class="h4 mb-3">Product Overview</h2>
      <div class="geo-spec-table-wrap">
        <table class="geo-spec-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Product Code</th><td>${escapeHtml(productCode)}</td></tr>
            ${category ? `<tr><th scope="row">Category</th><td>${escapeHtml(category)}</td></tr>` : ''}
            ${chineseName ? `<tr><th scope="row">Chinese Name</th><td>${escapeHtml(chineseName)}</td></tr>` : ''}
            ${materials ? `<tr><th scope="row">Applicable Materials</th><td>${escapeHtml(materials)}</td></tr>` : ''}
            ${grade ? `<tr><th scope="row">Grade</th><td>${escapeHtml(grade)}</td></tr>` : ''}
            ${origin ? `<tr><th scope="row">Origin</th><td>${escapeHtml(origin)}</td></tr>` : ''}
            ${packaging ? `<tr><th scope="row">Packaging</th><td>${escapeHtml(packaging)}</td></tr>` : ''}
            ${moq ? `<tr><th scope="row">MOQ</th><td>${escapeHtml(moq)}</td></tr>` : ''}
            ${hsCode ? `<tr><th scope="row">HS Code</th><td>${escapeHtml(hsCode)}</td></tr>` : ''}
            <tr><th scope="row">Official URL</th><td><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a></td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mb-4">
      <h2 class="h4 mb-3">Technical Specifications</h2>
      <div class="geo-spec-table-wrap">
        <table class="geo-spec-table">
          <thead>
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Carrier Resin</th><td>${escapeHtml(carrierResin)}</td></tr>
            <tr><th scope="row">Addition Rate / Dosage</th><td>${escapeHtml(dosage)}</td></tr>
            <tr><th scope="row">Heat Resistance</th><td>${escapeHtml(heatResistance)}</td></tr>
            <tr><th scope="row">Application</th><td>${escapeHtml(application)}</td></tr>
            <tr><th scope="row">Compliance</th><td>${escapeHtml(compliance)}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 class="h4 mb-3">Request a Quote</h2>
      <form method="POST" action="https://formsubmit.co/salesl.dorothy@gmail.com" class="geo-inquiry-form">
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
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input class="form-control" name="Name" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input class="form-control" type="email" name="Email" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Country</label>
          <input class="form-control" name="Country">
        </div>
        <div class="mb-3">
          <label class="form-label">Message</label>
          <textarea class="form-control" name="Message" rows="6" required></textarea>
        </div>
        <button class="btn btn-primary" type="submit">Send Inquiry</button>
      </form>
    </section>
  </main>
  <script src="/js/clarity-tracking.js?v=1.0"></script>
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
