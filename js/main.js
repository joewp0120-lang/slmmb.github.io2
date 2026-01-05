document.addEventListener('DOMContentLoaded', function() {
    // Language Switcher Logic
    const langKey = 'slm_lang';
    const defaultLang = 'en';
    
    // Check saved language or default
    let currentLang = localStorage.getItem(langKey) || defaultLang;
    setLanguage(currentLang);

    // Event listeners for switchers
    const langBtns = document.querySelectorAll('.lang-switch');
    langBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
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
