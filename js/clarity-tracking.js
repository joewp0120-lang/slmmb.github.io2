(function() {
    var STORAGE_KEY = 'slm_clarity_user_id';

    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }

        callback();
    }

    function normalizeUserId(value) {
        if (typeof value !== 'string') {
            return '';
        }

        var trimmedValue = value.trim();
        if (!trimmedValue) {
            return '';
        }

        if (trimmedValue.indexOf('@') !== -1) {
            return trimmedValue.toLowerCase();
        }

        return trimmedValue.replace(/[^\d+]/g, '');
    }

    function persistUserId(userId) {
        try {
            localStorage.setItem(STORAGE_KEY, userId);
        } catch (error) {
            return;
        }
    }

    function getStoredUserId() {
        try {
            return normalizeUserId(localStorage.getItem(STORAGE_KEY) || '');
        } catch (error) {
            return '';
        }
    }

    function setClarityUserId(value) {
        var userId = normalizeUserId(value);
        if (!userId) {
            return '';
        }

        persistUserId(userId);

        if (typeof window.clarity === 'function') {
            try {
                window.clarity('set', 'userId', userId);
            } catch (error) {
                return userId;
            }
        }

        return userId;
    }

    function getFieldList(form) {
        if (!form) {
            return [];
        }

        return Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'));
    }

    function getFieldValue(form, matcher) {
        var fields = getFieldList(form);

        for (var i = 0; i < fields.length; i += 1) {
            var field = fields[i];
            if (!field || !field.value) {
                continue;
            }

            if (matcher(field)) {
                return field.value;
            }
        }

        return '';
    }

    function isEmailField(field) {
        var fieldType = (field.type || '').toLowerCase();
        var fieldName = (field.name || '').toLowerCase();

        return fieldType === 'email' || fieldName.indexOf('email') !== -1;
    }

    function isPhoneField(field) {
        var fieldType = (field.type || '').toLowerCase();
        var fieldName = (field.name || '').toLowerCase();

        return fieldType === 'tel' ||
            fieldName.indexOf('phone') !== -1 ||
            fieldName.indexOf('whatsapp') !== -1 ||
            fieldName.indexOf('mobile') !== -1 ||
            fieldName.indexOf('tel') !== -1;
    }

    function getUserIdFromForm(form) {
        var emailValue = normalizeUserId(getFieldValue(form, isEmailField));
        if (emailValue) {
            return emailValue;
        }

        return normalizeUserId(getFieldValue(form, isPhoneField));
    }

    function getUserIdFromPage() {
        var forms = document.querySelectorAll('form');

        for (var i = 0; i < forms.length; i += 1) {
            var userId = getUserIdFromForm(forms[i]);
            if (userId) {
                return userId;
            }
        }

        return '';
    }

    function isTrackedForm(form) {
        var action = (form.getAttribute('action') || '').toLowerCase();
        return action.indexOf('formsubmit.co') !== -1;
    }

    function hasFilledHoneypot(form) {
        var honeypot = form.querySelector('input[name="company_website"]');
        return !!(honeypot && honeypot.value && honeypot.value.trim());
    }

    function bindFormTracking(form) {
        if (!form || form.dataset.clarityTrackingBound === 'true' || !isTrackedForm(form)) {
            return;
        }

        form.dataset.clarityTrackingBound = 'true';
        form.addEventListener('submit', function() {
            if (hasFilledHoneypot(form)) {
                return;
            }

            setClarityUserId(getUserIdFromForm(form));
        });
    }

    function bindWhatsAppTracking(link) {
        if (!link || link.dataset.clarityTrackingBound === 'true') {
            return;
        }

        link.dataset.clarityTrackingBound = 'true';
        link.addEventListener('click', function() {
            setClarityUserId(getUserIdFromPage() || getStoredUserId());
        });
    }

    function init() {
        var forms = document.querySelectorAll('form');
        for (var i = 0; i < forms.length; i += 1) {
            bindFormTracking(forms[i]);
        }

        var whatsappLinks = document.querySelectorAll('#floating-cta a[href*="wa.me/"], a.whatsapp-float[href*="wa.me/"]');
        for (var j = 0; j < whatsappLinks.length; j += 1) {
            bindWhatsAppTracking(whatsappLinks[j]);
        }
    }

    onReady(init);
})();
