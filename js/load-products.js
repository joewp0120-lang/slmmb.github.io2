/**
 * load-products.js
 * Dynamically loads, filters, and renders product catalog from data/products.json
 */

let allProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.getElementById('product-list-container');
    if (!productContainer) return;

    const categoryFilter = document.getElementById('category-filter');
    const materialFilter = document.getElementById('material-filter');
    const resetBtn = document.getElementById('reset-filters');

    // Determine path to products.json based on current location
    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '';
    const jsonPath = `${origin}/data/products.json`;
    const contactPath = `${origin}/contact/`;
    const tcoPath = `${origin}/tco-calculator/`;

    fetch(jsonPath, { cache: 'no-store' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to load products data');
            return response.json();
        })
        .then(products => {
            allProducts = products;
            renderProducts(allProducts, productContainer, contactPath, tcoPath);

            // Add Filter Event Listeners
            if (categoryFilter) {
                categoryFilter.addEventListener('change', () => filterAndRender(productContainer, contactPath, tcoPath));
            }
            if (materialFilter) {
                materialFilter.addEventListener('change', () => filterAndRender(productContainer, contactPath, tcoPath));
            }
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    categoryFilter.value = 'all';
                    materialFilter.value = 'all';
                    renderProducts(allProducts, productContainer, contactPath, tcoPath);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            productContainer.innerHTML = `<div class="col-12 text-center text-danger">Error loading product catalog. Please contact us directly. <a href="${contactPath}" class="text-danger text-decoration-underline">Contact us</a></div>`;
        });
});

function filterAndRender(container, contactPath, tcoPath) {
    const categoryVal = document.getElementById('category-filter').value;
    const materialVal = document.getElementById('material-filter').value;

    let filtered = allProducts.filter(product => {
        const matchCategory = categoryVal === 'all' || product.category === categoryVal;
        
        // Material matching is partial (e.g., "PE/PP" matches "PE")
        const matchMaterial = materialVal === 'all' || 
                             (product.materials && product.materials.toUpperCase().includes(materialVal.toUpperCase()));
        
        return matchCategory && matchMaterial;
    });

    renderProducts(filtered, container, contactPath, tcoPath);
}

function renderProducts(products, container, contactPath, tcoPath) {
    if (products.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">No products match your current filters.</p></div>`;
        return;
    }

    let html = '';
    products.forEach(product => {
        html += `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 border-0 shadow-sm product-catalog-card">
                    <div class="card-body p-4">
                        <div class="category-badge mb-2 text-uppercase small fw-bold text-primary">${product.category}</div>
                        <h4 class="h5 card-title mb-1">${product.english_name}</h4>
                        <h5 class="h6 text-muted mb-3">${product.chinese_name}</h5>
                        
                        <div class="product-meta-info mb-4">
                            <div class="mb-2">
                                <span class="fw-bold small text-dark">Code:</span>
                                <code class="ms-1 text-secondary">${product.product_code}</code>
                            </div>
                            <div class="mb-2">
                                <span class="fw-bold small text-dark">Materials:</span>
                                <span class="ms-1 small">${product.materials || 'Multiple'}</span>
                            </div>
                            <div>
                                <span class="fw-bold small text-dark">Packaging:</span>
                                <span class="ms-1 small">${product.packaging}</span>
                            </div>
                        </div>
                        
                        <a href="${contactPath}?product=${encodeURIComponent(product.product_code)}" class="btn btn-outline-primary w-100 rounded-pill py-2 fw-bold mb-3">
                            <span class="lang-en">Request a Quote</span>
                            <span class="lang-cn">获取报价</span>
                        </a>
                        
                        <div class="text-center">
                            <a href="${tcoPath}" class="text-decoration-none small text-muted tco-hint-link">
                                <i class="fas fa-calculator me-1"></i>
                                <span class="lang-en">Calculate TCO for this material</span>
                                <span class="lang-cn">计算该材质的综合成本(TCO)</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
