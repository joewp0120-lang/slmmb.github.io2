document.addEventListener('DOMContentLoaded', function() {
    // Language Switcher Logic
    const langKey = 'slm_lang';
    const defaultLang = 'en';
    
    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,zh-CN,fr,es,id,ar,pt,ru,ja,de',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    };

    // Load Google Translate Script
    (function() {
        var googleTranslateScript = document.createElement('script');
        googleTranslateScript.type = 'text/javascript';
        googleTranslateScript.async = true;
        googleTranslateScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(googleTranslateScript);
    })();

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

    // Check saved language or default
    let currentLang = localStorage.getItem(langKey) || defaultLang;
    
    // Check if Google Translate is active via cookie
    const cookies = document.cookie.split(';');
    let isGoogleTranslateActive = false;
    for(let cookie of cookies) {
        if(cookie.trim().startsWith('googtrans=')) {
            // If googtrans exists and is not /en/en, it is active
            if (cookie.includes('/en/en') || cookie.includes('/auto/en')) {
                 // effectively english
            } else {
                isGoogleTranslateActive = true;
            }
        }
    }

    // If Google Translate is NOT active, apply our manual language
    if (!isGoogleTranslateActive) {
        setLanguage(currentLang);
    } else {
        // Ensure underlying text is English so translation works best
        setLanguage('en');
    }

    // Event listeners for switchers
    // Use delegation or re-query since we might change HTML
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('lang-switch')) {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            const type = e.target.getAttribute('data-type'); // 'manual' or 'auto'

            if (type === 'manual') {
                // Clear Google Translate
                clearGoogleTranslateCookie();
                
                // Set Manual Language
                setLanguage(lang);
                
                // If Google Translate was active, we need to reload to remove the widget's DOM changes
                if (isGoogleTranslateActive) {
                    window.location.reload();
                } else {
                    // Just update content if we were already in manual mode
                    // (setLanguage already did it, but let's be sure)
                }
            } else if (type === 'auto') {
                // Set underlying to English
                setLanguage('en');
                
                // Set Cookie
                setGoogleTranslateCookie(lang);
                
                // Reload to apply
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

    // Active Navbar Link Logic
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
});
