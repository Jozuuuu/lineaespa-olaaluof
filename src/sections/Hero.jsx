import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    const clients = ["FORD", "GM", "KIA", "CFE", "ULSA", "CROWNE PLAZA"];
    const heroRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const scrolled = window.scrollY;
                heroRef.current.style.backgroundPositionY = `${scrolled * 0.5}px`;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section id="inicio" className="hero" ref={heroRef}>
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
