import React, { useState, useEffect, useRef, memo } from 'react';

const LazyImage = memo(({ src, alt, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.01, rootMargin: '100px' } // Reduced margin for better concurrency
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            if (imgRef.current) observer.unobserve(imgRef.current);
        };
    }, []);

    return (
        <div ref={imgRef} className={`project-img-wrapper ${isLoaded ? 'shimmer-off' : ''}`}>
            {isInView && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${isLoaded ? 'loaded' : ''}`}
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
});

export default LazyImage;
