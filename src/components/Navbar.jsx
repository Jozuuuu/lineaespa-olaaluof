import React, { useState, useEffect } from 'react';
import './Navbar.css';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <div className="logo">
                    <img src={logo} alt="Aluoferta Logo" className="logo-img" />
                </div>

                <ul className="nav-links">
                    <li><a href="#inicio">INICIO</a></li>
                    <li><a href="#productos">PRODUCTOS</a></li>
                    <li><a href="#portafolio">PORTAFOLIO</a></li>
                    <li><a href="#nosotros">NOSOTROS</a></li>
                    <li><a href="#contacto" className="btn btn-primary nav-cta">CONTACTO</a></li>
                </ul>

                <div className="mobile-menu-btn">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
