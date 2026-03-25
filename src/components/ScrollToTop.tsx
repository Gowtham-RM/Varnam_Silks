import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Skip scroll-to-top when the URL contains a hash anchor (let the browser / component handle it)
        if (hash) return;
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
