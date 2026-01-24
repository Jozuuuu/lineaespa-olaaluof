import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    const bgRef = useRef(null);
    const clients = ["FORD", "GM", "KIA", "CFE", "ULSA", "CROWNE PLAZA"];

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (bgRef.current) {
                        const scrolled = window.scrollY;
                        // Use translate3d for hardware acceleration
                        bgRef.current.style.transform = `translate3d(0, ${scrolled * 0.4}px, 0)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section id="inicio" className="hero">
            <div className="hero-bg-wrapper" ref={bgRef}></div>
            <div className="hero-grid-pattern"></div>
            <div className="hero-overlay"></div>

            <div className="container hero-container">
                <div className="hero-content">
                    <div className="reveal-box">
                        <span className="hero-subtitle">MÁS DE 25 AÑOS DE EXCELENCIA</span>
                    </div>

                    <h1 className="hero-title">
                        Ingeniería en <span className="accent-text">Aluminio</span> <br />
                        y Vidrio de Alto Nivel
                    </h1>

                    <p className="hero-description">
                        Transformamos la arquitectura con soluciones de alta gama en vidrio templado,
                        panel de aluminio y cancelería estructural para proyectos industriales y residenciales.
                    </p>

                    <div className="hero-actions">
                        <a href="#contacto" className="btn btn-primary btn-premium">
                            INICIAR PROYECTO <ArrowRight size={18} />
                        </a>
                        <a href="#portafolio" className="btn btn-outline-white">PORTAFOLIO</a>
                    </div>
                </div>
            </div>

            <div className="hero-trust-bar">
                <div className="container">
                    <div className="trust-content">
                        <span className="trust-label">CONFIANZA DE LÍDERES:</span>
                        <div className="client-ticker">
                            {clients.map((client, i) => (
                                <span key={i} className="client-tag">{client}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="hero-stats-premium glass">
                <div className="stat-item">
                    <span className="stat-number">25+</span>
                    <span className="stat-label">Años</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Obras</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
