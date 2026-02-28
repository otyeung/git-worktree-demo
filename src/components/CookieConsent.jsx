import { useState, useEffect } from 'react';
import { COOKIE_CONSENT } from '../data/cookieConsent';

function CookieConsent() {
    const { message, acceptLabel, rejectLabel, policyLink } = COOKIE_CONSENT;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setVisible(true);
        }
    }, []);

    function handleAccept() {
        localStorage.setItem('cookie-consent', 'accepted');
        setVisible(false);
    }

    function handleReject() {
        localStorage.setItem('cookie-consent', 'rejected');
        setVisible(false);
    }

    if (!visible) {
        return null;
    }

    return (
        <div
            className={`cookie-consent ${visible ? 'cookie-consent--visible' : ''}`}
            role="dialog"
            aria-label="Cookie 同意"
        >
            <div className="container cookie-consent__inner">
                <p className="cookie-consent__message">
                    {message}
                    {' '}
                    <a href={policyLink.href} className="cookie-consent__link">
                        {policyLink.label}
                    </a>
                </p>
                <div className="cookie-consent__actions">
                    <button
                        className="btn btn--outline btn--sm"
                        onClick={handleReject}
                    >
                        {rejectLabel}
                    </button>
                    <button
                        className="btn btn--primary btn--sm"
                        onClick={handleAccept}
                    >
                        {acceptLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CookieConsent;
