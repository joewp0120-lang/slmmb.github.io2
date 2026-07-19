(function() {
    var LOCALES = ['ar', 'id', 'es'];
    var DEFAULT_ORIGIN = 'https://www.slmmb.com';

    function normalizePathname(pathname) {
        var path = pathname || '/';
        path = path.replace(/index\.html$/i, '');

        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        if (!path.endsWith('/')) {
            path += '/';
        }

        return path.replace(/\/{2,}/g, '/');
    }

    function getBasePath(pathname) {
        var normalized = normalizePathname(pathname);
        return normalized.replace(/^\/(ar|id|es)(?=\/|$)/i, '') || '/';
    }

    function buildLocaleUrl(origin, basePath, locale) {
        if (!locale) {
            return origin + basePath;
        }

        if (basePath === '/') {
            return origin + '/' + locale + '/';
        }

        return origin + '/' + locale + basePath;
    }

    function appendAlternateLink(hreflang, href) {
        var link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        link.href = href;
        document.head.appendChild(link);
    }

    function init() {
        if (!document.head) {
            return;
        }

        var origin = window.location.origin && window.location.origin !== 'null'
            ? window.location.origin
            : DEFAULT_ORIGIN;
        var basePath = getBasePath(window.location.pathname);

        appendAlternateLink('en', buildLocaleUrl(origin, basePath, ''));
        LOCALES.forEach(function(locale) {
            appendAlternateLink(locale, buildLocaleUrl(origin, basePath, locale));
        });
        appendAlternateLink('x-default', buildLocaleUrl(origin, basePath, ''));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    init();
})();
