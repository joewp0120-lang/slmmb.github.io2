document.addEventListener('DOMContentLoaded', function() {
    // Security: Anti-Clickjacking (Frame Buster)
    // Prevents the site from being embedded in an iframe (e.g., for clickjacking or cloning)
    try {
        if (window.self !== window.top) {
            window.top.location = window.self.location;
        }
    } catch (e) { console.warn('Frame protection triggered'); }

    // Security: Basic Content Protection
    // Prevent image dragging to discourage easy copying
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // Language Switcher Logic
    const langKey = 'slm_lang';
    const defaultLang = 'en';
    
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,zh-CN,fr,es,id,ar,pt,ru,ja,de,hi,bn',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };

    function loadGoogleTranslateScript() {
        if (window.googleTranslateScriptLoaded) return;
        window.googleTranslateScriptLoaded = true;
        var googleTranslateScript = document.createElement('script');
        googleTranslateScript.type = 'text/javascript';
        googleTranslateScript.async = true;
        googleTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(googleTranslateScript);
    }

    // Helper to set Google Translate Cookie
    function setGoogleTranslateCookie(lang) {
        // Construct the cookie value: /source/target
        // We assume source is always 'en' for auto-translation
        const cookieValue = '/en/' + lang;
        document.cookie = 'googtrans=' + cookieValue + '; path=/; domain=' + window.location.hostname;
        document.cookie = 'googtrans=' + cookieValue + '; path=/;'; // Fallback for localhost
    }

    // Helper to clear Google Translate Cookie
    function clearGoogleTranslateCookie() {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    let currentLang = localStorage.getItem(langKey) || defaultLang;
    
    const cookies = document.cookie.split(';');
    let isGoogleTranslateActive = false;
    for(let cookie of cookies) {
        if(cookie.trim().startsWith('googtrans=')) {
            if (cookie.includes('/en/en') || cookie.includes('/auto/en')) {
            } else {
                isGoogleTranslateActive = true;
            }
        }
    }

    if (!isGoogleTranslateActive) {
        setLanguage(currentLang);
    } else {
        setLanguage('en');
        loadGoogleTranslateScript();
    }

    // Event listeners for switchers
    // Use delegation or re-query since we might change HTML
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('lang-switch')) {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            const type = e.target.getAttribute('data-type'); // 'manual' or 'auto'

            if (type === 'manual') {
                clearGoogleTranslateCookie();
                setLanguage(lang);
                if (isGoogleTranslateActive) {
                    window.location.reload();
                } else {
                }
            } else if (type === 'auto') {
                setLanguage('en');
                setGoogleTranslateCookie(lang);
                loadGoogleTranslateScript();
                window.location.reload();
            }
        }
    });

    function setLanguage(lang) {
        // Set body class
        document.body.classList.remove('lang-en', 'lang-cn');
        document.body.classList.add('lang-' + lang);
        
        // Save to local storage
        localStorage.setItem(langKey, lang);
        
        // Update button text active state if needed
        // console.log("Language switched to: " + lang);
    }

    const currentLocation = location.href;
    const menuItem = document.querySelectorAll('.nav-link');
    const menuLength = menuItem.length;
    for (let i = 0; i < menuLength; i++) {
        if (menuItem[i].href === currentLocation) {
            menuItem[i].classList.add("active");
        }
    }

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-item:not(.dropdown) .nav-link');
    const navbarCollapse = document.getElementById('navbarNav');
    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {toggle: false});
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                bsCollapse.hide();
            }
        });
    });

    (function() {
        if (document.getElementById('floating-cta')) return;

        var wrapper = document.createElement('div');
        wrapper.id = 'floating-cta';
        wrapper.className = 'floating-cta';

        var whatsappLink = document.createElement('a');
        whatsappLink.href = 'https://wa.me/8618027593021';
        whatsappLink.className = 'whatsapp-float';
        whatsappLink.target = '_blank';
        whatsappLink.rel = 'noopener';
        whatsappLink.setAttribute('aria-label', 'Chat on WhatsApp');
        whatsappLink.innerHTML = '<i class="fab fa-whatsapp whatsapp-icon"></i>';

        var sampleLink = document.createElement('a');
        sampleLink.href = '/contact/?intent=sample';
        sampleLink.className = 'sample-float';
        sampleLink.setAttribute('aria-label', 'Get Free Sample');
        sampleLink.innerHTML = '<i class="fas fa-gift me-2"></i><span class="sample-float-text">Get Free Sample</span>';

        wrapper.appendChild(whatsappLink);
        wrapper.appendChild(sampleLink);
        document.body.appendChild(wrapper);
    })();

    (function() {
        var path = window.location.pathname || '';
        var isProductsArea = path.indexOf('/products/') !== -1;
        var isListingPage = /\/products\/($|index\.html$)/.test(path);
        if (!isProductsArea || isListingPage) return;

        if (document.getElementById('product-inquiry')) return;

        var section = document.createElement('section');
        section.className = 'section-padding bg-light';
        section.id = 'product-inquiry';

        var currentUrl = window.location.href;
        var productName = '';
        var h1 = document.querySelector('h1');
        if (h1) {
            productName = (h1.textContent || '').trim().replace(/\s+/g, ' ');
        }

        section.innerHTML =
            '<div class="container">' +
                '<div class="row justify-content-center">' +
                    '<div class="col-lg-8">' +
                        '<div class="bg-white p-4 p-md-5 rounded shadow-sm">' +
                            '<h3 class="mb-3">' +
                                '<span class="lang-en">Request a Quote or Free Sample</span>' +
                                '<span class="lang-cn">获取报价或免费样品</span>' +
                            '</h3>' +
                            '<p class="text-muted mb-4">' +
                                '<span class="lang-en">Tell us your process and target application. Our team will reply with pricing, lead time, and recommendations.</span>' +
                                '<span class="lang-cn">请告知工艺与目标应用，我们将回复报价、交期与建议方案。</span>' +
                            '</p>' +
                            '<form class="inquiry-form" method="POST" action="https://formsubmit.co/salesl.dorothy@gmail.com">' +
                                '<input type="hidden" name="_captcha" value="false">' +
                                '<input type="hidden" name="_next" value="https://www.slmmb.com/thank-you/">' +
                                '<input type="hidden" name="Page" value="' + encodeURIComponent(currentUrl) + '">' +
                                (productName ? '<input type="hidden" name="Product" value="' + productName.replace(/"/g, '&quot;') + '">' : '') +
                                '<div class="d-none">' +
                                    '<label>Leave this field empty</label>' +
                                    '<input type="text" name="company_website" autocomplete="off" tabindex="-1">' +
                                '</div>' +
                                '<div class="row">' +
                                    '<div class="col-md-6 mb-3">' +
                                        '<label class="form-label"><span class="lang-en">Name</span><span class="lang-cn">姓名</span></label>' +
                                        '<input type="text" class="form-control" name="Name" required>' +
                                    '</div>' +
                                    '<div class="col-md-6 mb-3">' +
                                        '<label class="form-label"><span class="lang-en">Email</span><span class="lang-cn">邮箱</span></label>' +
                                        '<input type="email" class="form-control" name="Email" required>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="mb-3">' +
                                    '<label class="form-label"><span class="lang-en">Country</span><span class="lang-cn">国家</span></label>' +
                                    '<input type="text" class="form-control" name="Country" placeholder="e.g., Mexico">' +
                                '</div>' +
                                '<div class="mb-3">' +
                                    '<label class="form-label"><span class="lang-en">Message</span><span class="lang-cn">留言</span></label>' +
                                    '<textarea class="form-control" rows="5" name="Message" required></textarea>' +
                                '</div>' +
                                '<button type="submit" class="btn btn-quote btn-lg w-100">' +
                                    '<span class="lang-en">Send Inquiry</span>' +
                                    '<span class="lang-cn">发送询盘</span>' +
                                '</button>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        var footer = document.querySelector('footer');
        if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(section, footer);
        } else {
            document.body.appendChild(section);
        }

        var inquiryForms = document.querySelectorAll('form.inquiry-form');
        inquiryForms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                var honeypot = form.querySelector('input[name="company_website"]');
                if (honeypot && honeypot.value) {
                    e.preventDefault();
                }
            });
        });
    })();

    var heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        var lazyBgItems = heroCarousel.querySelectorAll('.carousel-item[data-bg]');
        lazyBgItems.forEach(function(item) {
            if (item.classList.contains('active')) {
                var bg = item.getAttribute('data-bg');
                if (bg) {
                    item.style.backgroundImage = "url('" + bg + "')";
                }
            }
        });
        heroCarousel.addEventListener('slide.bs.carousel', function(e) {
            var target = e.relatedTarget;
            if (!target) return;
            var bg = target.getAttribute('data-bg');
            if (bg && !target.style.backgroundImage) {
                target.style.backgroundImage = "url('" + bg + "')";
            }
        });
    }

    // Contact Form Anti-Spam (Honeypot + reCAPTCHA presence check)
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            var honeypot = contactForm.querySelector('input[name="company_website"]');
            if (honeypot && honeypot.value) {
                e.preventDefault();
                return;
            }
            // reCAPTCHA check removed by request
        });
    }
});
