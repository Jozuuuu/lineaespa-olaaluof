import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Products.css';

const IconVidrio = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="#001B3A" strokeWidth="1.5" />
        <path d="M7 3V21M17 3V21M3 7H21M3 17H21" stroke="#001B3A" strokeWidth="0.5" strokeOpacity="0.2" />
        <path d="M19 5L20 4" stroke="#001B3A" strokeWidth="1" />
        <path d="M18 6L19 5" stroke="#001B3A" strokeWidth="1" strokeOpacity="0.5" />
    </svg>
);

const IconPanel = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="1" stroke="#001B3A" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M2 12H22M12 2V22" stroke="#001B3A" strokeWidth="1.5" />
        <circle cx="7" cy="7" r="1" fill="#001B3A" />
        <circle cx="17" cy="7" r="1" fill="#001B3A" />
        <circle cx="7" cy="17" r="1" fill="#001B3A" />
        <circle cx="17" cy="17" r="1" fill="#001B3A" />
    </svg>
);

const IconFachada = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5L12 3L21 5V19L12 21L3 19V5Z" stroke="#001B3A" strokeWidth="1.5" />
        <path d="M12 3V21M3 12H21" stroke="#001B3A" strokeWidth="0.8" />
        <path d="M7.5 4V20M16.5 4V20" stroke="#001B3A" strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
);

const IconCanceleria = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="0.5" stroke="#001B3A" strokeWidth="2" />
        <path d="M12 3V21M3 12H12" stroke="#001B3A" strokeWidth="1" />
        <path d="M14 11V13" stroke="#001B3A" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="21" y2="12" stroke="#001B3A" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
);

const IconLouver = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" stroke="#001B3A" strokeWidth="1.5" />
        <path d="M6 7H18M6 10H18M6 13H18M6 16H18" stroke="#001B3A" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 6V18" stroke="#001B3A" strokeWidth="3" strokeOpacity="0.1" />
    </svg>
);

const IconRolado = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 21V10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10V21H4Z" stroke="#001B3A" strokeWidth="1.5" />
        <path d="M4 10H20M4 16H20M12 2V21" stroke="#001B3A" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M8 3.5C8 3.5 10 2.5 12 2.5C14 2.5 16 3.5 16 3.5" stroke="#001B3A" strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
);

const IconLamina = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" stroke="#001B3A" strokeWidth="1" strokeOpacity="0.2" />
        <path d="M3 12L7 8L12 12L17 8L21 12L17 16L12 12L7 16L3 12Z" stroke="#001B3A" strokeWidth="1.2" />
        <path d="M7 4V20M17 4V20" stroke="#001B3A" strokeWidth="0.5" strokeOpacity="0.1" />
    </svg>
);

const IconMuroVerde = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#10B981" fillOpacity="0.05" />
        <path d="M12 21V10M12 10C12 10 13 7 16 7M12 10C12 10 11 7 8 7M12 15C12 15 15 13 17 14M12 18C12 18 9 16 7 17" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="10" r="1" fill="#10B981" />
    </svg>
);

const products = [
    {
        title: "Vidrio Templado",
        description: "Vidrio de seguridad procesado térmicamente para resistir impactos y cambios de temperatura elevados.",
        details: "Ideal para fachadas, barandales y puertas.",
        icon: <IconVidrio />
    },
    {
        title: "Panel de Aluminio",
        description: "Sistema compuesto (ACM) para revestimiento de fachadas, ofreciendo ligereza y durabilidad extrema.",
        details: "Variedad de colores y acabados metálicos.",
        icon: <IconPanel />
    },
    {
        title: "Fachadas Integrales",
        description: "Soluciones envolventes de gran escala que integran cristal y perfiles de aluminio estructural.",
        details: "Diseño vanguardista para edificios modernos.",
        icon: <IconFachada />
    },
    {
        title: "Cancelería de Aluminio",
        description: "Sistemas de ventanas y puertas residenciales e industriales con sellado hermético.",
        details: "Aislamiento acústico y térmico superior.",
        icon: <IconCanceleria />
    },
    {
        title: "Louvers",
        description: "Sistemas de rejillas para ventilación controlada y protección solar estética.",
        details: "Control lumínico y flujo de aire eficiente.",
        icon: <IconLouver />
    },
    {
        title: "Estructuras y Perfiles",
        description: "Fabricación de estructuras de soporte y perfiles especiales para proyectos complejos.",
        details: "Ingeniería aplicada a la construcción.",
        icon: <IconRolado />
    },
    {
        title: "Lámina Desplegada",
        description: "Mallas metálicas expandidas para elementos decorativos, filtros o seguridad.",
        details: "Diseños geométricos y alta resistencia.",
        icon: <IconLamina />
    },
    {
        title: "Muro Verde Sintético",
        description: "Recubrimientos verticales de apariencia natural para ambientación de espacios.",
        details: "Bajo mantenimiento y alta durabilidad.",
        icon: <IconMuroVerde />
    },
    {
        title: "Servicio de Rolado",
        description: "Transformación técnica de perfiles de aluminio para diseños con curvaturas especiales.",
        details: "Precisión milimétrica en arcos y círculos.",
        icon: <IconRolado />
    }
];

const Products = () => {
    return (
        <section id="productos" className="section-padding products-section reveal">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">NUESTROS PRODUCTOS</span>
                    <h2 className="section-title">Soluciones <span className="accent-text">Arquitectónicas</span></h2>
                    <p className="section-desc">
                        Variedad de productos, calidad y personal altamente calificado para transformar sus espacios.
                    </p>
                </div>

                <div className="products-grid">
                    {products.map((product, index) => (
                        <div key={index} className="product-card">
                            <div className="product-icon">{product.icon}</div>
                            <h3 className="product-title">{product.title}</h3>
                            <p className="product-text">{product.description}</p>
                            <span className="product-details">{product.details}</span>
                            <div className="product-footer">
                                <a href="#contacto" className="product-link">
                                    COTIZAR PRODUCTO <ArrowRight size={16} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Products;
