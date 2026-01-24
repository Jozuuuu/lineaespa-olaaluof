import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Clock,
  UserCheck
} from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Products from './sections/Products';
import ProjectModal from './components/ProjectModal';
import LazyImage from './components/LazyImage';
import GoogleMap from './components/GoogleMap';
import logo from './assets/logo.png';
import './App.css';

// Project data with static paths
const projectsData = [
  { "name": "ASHIMORI", "client": "Ashimori", "product": "Louver", "date": "---", "description": "Louver en fachada de planta industrial. Obra ejecutada con precisión técnica para optimizar la ventilación y estética de la nave.", "img": "projects/ashimori.jpg" },
  { "name": "CFE", "client": "CFE", "product": "Vidrio templado, Panel de aluminio", "date": "---", "description": "Fachada integral combinando vidrio templado de alta resistencia y panel de aluminio para un acabado institucional moderno y duradero.", "img": "projects/cfe.jpg" },
  { "name": "CROWNE PLAZA", "client": "Crowne Plaza", "product": "Vidrio templado", "date": "---", "description": "Instalación de vidrio templado en áreas comunes y fachadas, priorizando la seguridad y la elegancia arquitectónica del hotel.", "img": "projects/crowne_plaza.jpg" },
  { "name": "GONVILL", "client": "Gonvill", "product": "Panel de aluminio", "date": "---", "description": "Revestimiento de fachada con panel de aluminio. Aporta una imagen renovada y protección climática superior al edificio comercial.", "img": "projects/gonvill.jpg" },
  { "name": "EMPACADORA ALEMANA", "client": "Empacadora Alemana", "product": "Panel de aluminio", "date": "---", "description": "Instalación de paneles de aluminio en fachadas industriales, garantizando hermeticidad y un acabado profesional de larga duración.", "img": "projects/empacadora_alemana.jpg" },
  { "name": "ULSA FACHADAS", "client": "ULSA", "product": "Panel de aluminio", "date": "---", "description": "Proyecto educativo integral utilizando paneles de aluminio para crear una identidad visual moderna y funcional en el campus.", "img": "projects/ulsa_fachadas.jpg" },
  { "name": "TORRE DEPARTAMENTAL 2", "client": "Torre Departamental", "product": "Panel de aluminio", "date": "---", "description": "Aplicación de panel de aluminio en torre residencial, elevando el valor estético y la eficiencia térmica de la estructura.", "img": "projects/torre_departamental_2.jpg" },
  { "name": "TORRE DEPARTAMENTAL 3", "client": "Torre Departamental", "product": "Panel de aluminio", "date": "---", "description": "Combinación de acabados en aluminio para fachadas residenciales de lujo, integrando durabilidad con diseño minimalista.", "img": "projects/torre_departamental_3.jpg" },
  { "name": "TORRE DEPARTAMENTAL 1", "client": "Torre Departamental", "product": "Panel de aluminio", "date": "---", "description": "Revestimiento integral de fachada en edificio multifamiliar, asegurando un mantenimiento mínimo y una estética vanguardista.", "img": "projects/torre_departamental_1.jpg" },
  { "name": "ULSA ESCUELA DE DISEÑO", "client": "ULSA", "product": "Panel de aluminio", "date": "---", "description": "Fachada creativa con paneles de aluminio, reflejando el espíritu de innovación y diseño de la institución educativa.", "img": "projects/ulsa_escuela_de_dise_o.jpg" },
  { "name": "FORD", "client": "Ford", "product": "Panel de aluminio", "date": "---", "description": "Identidad corporativa Ford aplicada en fachada mediante paneles de aluminio de alta calidad y precisión en el montaje.", "img": "projects/ford.jpg" },
  { "name": "GM", "client": "GM", "product": "Panel de aluminio", "date": "---", "description": "Suministro e instalación de paneles de aluminio para instalaciones industriales de GM, cumpliendo con los más altos estándares globales.", "img": "projects/gm.jpg" },
  { "name": "KIA", "client": "KIA", "product": "Vidrio templado, panel de aluminio", "date": "---", "description": "Fachada de agencia automotriz utilizando vidrio templado para máxima visibilidad y panel de aluminio para un marco institucional elegante.", "img": "projects/kia.jpg" },
  { "name": "INSTITUTO LEONES", "client": "Instituto Leones", "product": "Vidrio templado", "date": "---", "description": "Instalación de vidrios de seguridad en áreas educativas, garantizando protección y una iluminación natural óptima.", "img": "projects/instituto_leones.jpg" },
  { "name": "LA MARINA", "client": "La Marina", "product": "Vidrio templado", "date": "---", "description": "Solución de vidrio templado para local comercial, integrando escaparates de gran tamaño con herrajes de alta gama.", "img": "projects/la_marina.jpg" },
  { "name": "LOCAL COMERCIAL", "client": "Local Comercial", "product": "Vidrio templado", "date": "---", "description": "Cancelería de vidrio templado para locales de plaza comercial, priorizando la estética y el flujo visual.", "img": "projects/local_comercial.jpg" },
  { "name": "CENTRO COMERCIAL SENTURA", "client": "Sentura", "product": "Panel de aluminio", "date": "---", "description": "Fachada monumental de centro comercial ejecutada con paneles de aluminio en diversos tonos para un impacto visual dinámico.", "img": "projects/centro_comercial_sentura.jpg" },
  { "name": "LOCALES COMERCIALES", "client": "Locales Comerciales", "product": "Vidrio templado", "date": "---", "description": "Sistema de fachadas y puertas de vidrio para complejo comercial, enfocado en durabilidad y alto tránsito.", "img": "projects/locales_comerciales.jpg" },
  { "name": "ULSA PARQUE DE INNOVACIÓN", "client": "ULSA", "product": "Cancelería de aluminio", "date": "---", "description": "Integración de cancelería de aluminio de alta eficiencia en edificio de oficinas de innovación tecnológica.", "img": "projects/ulsa_parque_de_innovaci_n.jpg" },
  { "name": "QUERÉTARO", "client": "Querétaro Project", "product": "Panel de aluminio", "date": "---", "description": "Proyecto foráneo de gran envergadura utilizando paneles de aluminio para revestimiento de fachadas industriales.", "img": "projects/quer_taro.jpg" },
  { "name": "HOSPITAL ARANDA", "client": "Hospital Aranda", "product": "Panel de aluminio", "date": "---", "description": "Aplicación de paneles de aluminio en fachadas hospitalarias, facilitando la limpieza y manteniendo una imagen higiénica y moderna.", "img": "projects/hospital_aranda.jpg" },
  { "name": "JFE STEEL AMÉRICA CDMX", "client": "JFE Steel", "product": "Plafón", "date": "---", "description": "Diseño e instalación de plafones arquitectónicos en oficinas corporativas, mejorando la acústica y el diseño interior.", "img": "projects/jfe_steel_am_rica_cdmx.jpg" },
  { "name": "INDUSTRIAL TOLUCA", "client": "Industrial Toluca", "product": "Panel de aluminio", "date": "---", "description": "Cerramiento industrial con paneles de aluminio de alta resistencia para ambientes de manufactura pesada.", "img": "projects/industrial_toluca.jpg" },
  { "name": "TIENDA DE DEPORTES", "client": "Tienda de Deportes", "product": "Vidrio templado", "date": "---", "description": "Fachada acristalada para tienda departamental, permitiendo una exhibición clara y segura de los productos.", "img": "projects/tienda_de_deportes.jpg" },
  { "name": "PUERTO INTERIOR 1", "client": "Puerto Interior", "product": "Panel de aluminio", "date": "---", "description": "Infraestructura logística revestida con panel de aluminio, asegurando resistencia a la intemperie y bajo mantenimiento.", "img": "projects/puerto_interior_1.jpg" },
  { "name": "PLAZA MARIANO ESCOBEDO", "client": "Plaza Mariano Escobedo", "product": "Panel de aluminio", "date": "---", "description": "Remodelación de fachada de plaza comercial mediante paneles de aluminio compuestos para un look moderno.", "img": "projects/plaza_mariano_escobedo.jpg" },
  { "name": "PIRMA", "client": "Pirma", "product": "Panel de aluminio", "date": "---", "description": "Identidad de marca Pirma implementada en fachadas mediante paneles de aluminio de corte preciso y acabado premium.", "img": "projects/pirma.jpg" },
  { "name": "PIRELLI", "client": "Pirelli", "product": "Panel de aluminio", "date": "---", "description": "Instalación de panel de aluminio en interior de planta industrial, optimizando la limpieza y el flujo de trabajo.", "img": "projects/pirelli.jpg" },
  { "name": "MUNDO DEL AZULEJO", "client": "Mundo del Azulejo", "product": "Panel de aluminio", "date": "---", "description": "Fachada comercial renovada con paneles de aluminio, atrayendo la atención mediante un diseño industrial sofisticado.", "img": "projects/mundo_del_azulejo.jpg" },
  { "name": "K-TECH", "client": "K-Tech", "product": "Panel de aluminio", "date": "---", "description": "Suministro de paneles para fachada de planta industrial K-Tech, con enfoque en durabilidad estructural.", "img": "projects/k_tech.jpg" },
  { "name": "OFICINAS CAMPESTRE", "client": "Oficinas Campestre", "product": "Panel de aluminio, Plafón", "date": "---", "description": "Proyecto corporativo integrando fachadas de panel de aluminio y plafones interiores para un ambiente profesional.", "img": "projects/oficinas_campestre.jpg" },
  { "name": "OFICINAS DE GOBIERNO", "client": "Gobierno", "product": "Vidrio templado", "date": "---", "description": "Instalaciones gubernamentales equipadas con cancelería de vidrio templado de alta seguridad.", "img": "projects/oficinas_de_gobierno.jpg" },
  { "name": "ULSA TALLERES", "client": "ULSA", "product": "Cancelería de aluminio y vidrio", "date": "---", "description": "Talleres universitarios con amplios ventanales de aluminio, favoreciendo la entrada de luz y la ventilación.", "img": "projects/ulsa_talleres.jpg" },
  { "name": "RESIDENCIALES 1", "client": "Residencial", "product": "Cancelería de aluminio", "date": "---", "description": "Hogares de alta gama con cancelería de aluminio de diseño personalizado y cierre hermético.", "img": "projects/residenciales_1.jpg" },
  { "name": "ULSA ODONTOLOGÍA", "client": "ULSA", "product": "Cancelería de aluminio y vidrio", "date": "---", "description": "Clínicas de odontología equipadas con divisiones de vidrio y aluminio para un entorno aséptico y moderno.", "img": "projects/ulsa_odontolog_a.jpg" },
  { "name": "ULSA GASTRONOMÍA", "client": "ULSA", "product": "Cancelería de aluminio y vidrio", "date": "---", "description": "Áreas de gastronomía con fachadas de vidrio de gran formato, integrando la cocina con el entorno visual.", "img": "projects/ulsa_gastronom_a.jpg" }
];

function App() {
  const [visibleProjects, setVisibleProjects] = useState(12);
  const [selectedProject, setSelectedProject] = useState(null);

  const showMoreProjects = useCallback(() => {
    setVisibleProjects(prev => prev + 12);
  }, []);

  const openProject = useCallback((project) => {
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const closeProject = useCallback(() => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  }, []);

  const renderedProjects = useMemo(() => {
    return projectsData.slice(0, visibleProjects).map((project, index) => (
      <div key={index} className="project-card-item" onClick={() => openProject(project)}>
        <LazyImage src={project.img} alt={project.name} className="project-img" />
        <div className="project-info-overlay">
          <h3>{project.name}</h3>
          <p>{project.product}</p>
          <span className="project-client">Cliente: {project.client}</span>
          <div className="project-view-more">Ver detalles ➔</div>
        </div>
      </div>
    ));
  }, [visibleProjects, openProject]);

  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />

        {/* About Section */}
        <section id="nosotros" className="section-padding about-section reveal">
          <div className="container about-grid">
            <div className="about-image">
              <img src="about-us.png" alt="Arquitectura Aluoferta" />
              <div className="experience-badge glass">
                <span className="years">25</span>
                <span className="text">AÑOS DE <br />EXISTENCIA</span>
              </div>
            </div>
            <div className="about-content">
              <span className="subtitle">CONÓCENOS</span>
              <h2 className="section-title">Nuestra <span className="accent-text">Experiencia</span></h2>
              <p>
                Con más de 25 años de trayectoria, nuestra variedad de productos, calidad, servicio, personal altamente calificado y precio competitivo nos ubican como una de las mejores empresas en el bajío dedicada a la fabricación e instalación de cancelería de aluminio y vidrio.
              </p>
              <div className="features-grid">
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <ShieldCheck size={20} color="currentColor" />
                  </div>
                  <div>
                    <h4>Calidad Superior</h4>
                    <p>Materiales certifications y procesos de vanguardia en cada transformación.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <Clock size={20} color="currentColor" />
                  </div>
                  <div>
                    <h4>Tiempos de Entrega</h4>
                    <p>Compromiso absoluto con la puntualidad y cronograma de su obra.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-wrapper">
                    <UserCheck size={20} color="currentColor" />
                  </div>
                  <div>
                    <h4>Personal Calificado</h4>
                    <p>Técnicos especialistas en instalación de fachadas de gran escala.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Products />

        {/* Portfolio Section */}
        <section id="portafolio" className="section-padding portfolio-section reveal">
          <div className="container">
            <div className="section-header">
              <span className="subtitle">NUESTRA OBRA</span>
              <h2 className="section-title">Portafolio de <span className="accent-text">Proyectos</span></h2>
            </div>
            <div className="projects-grid">
              {renderedProjects}
            </div>

            {visibleProjects < projectsData.length && (
              <div className="portfolio-actions">
                <button className="btn btn-outline" onClick={showMoreProjects}>
                  CARGAR MÁS PROYECTOS <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="section-padding contact-section reveal">
          <div className="container">
            <div className="contact-card glass">
              <div className="contact-info">
                <h2 className="contact-title">Inicie su Proyecto</h2>
                <p>Escríbenos y un experto se pondrá en contacto contigo para brindarte asesoría personalizada y técnica.</p>
                <div className="contact-details">
                  <div className="detail-item">
                    <div className="detail-header">
                      <div className="contact-icon-wrapper">
                        <Phone size={18} color="currentColor" />
                      </div>
                      <strong>TELÉFONO</strong>
                    </div>
                    <span>(477) 7123885</span>
                  </div>
                  <div className="detail-item">
                    <div className="detail-header">
                      <div className="contact-icon-wrapper">
                        <Mail size={18} color="currentColor" />
                      </div>
                      <strong>EMAIL</strong>
                    </div>
                    <span>ventas@aluoferta.com</span>
                  </div>
                  <div className="detail-item">
                    <div className="detail-header">
                      <div className="contact-icon-wrapper">
                        <MapPin size={18} color="currentColor" />
                      </div>
                      <strong>DIRECCIÓN</strong>
                    </div>
                    <span>María Soledad #208 esq. Blvd. Mariano Escobedo col. Loma bonita, Leon Gto.</span>
                  </div>
                </div>
              </div>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <input type="text" placeholder="Su Nombre" required />
                  <input type="email" placeholder="Su Correo" required />
                </div>
                <input type="text" placeholder="Asunto / Producto de Interés" />
                <textarea placeholder="Detalles de su requerimiento..." rows="4" required></textarea>
                <button type="submit" className="btn btn-primary">
                  SOLICITAR PRESUPUESTO <ChevronRight size={18} />
                </button>
              </form>
            </div>

            {/* Google Maps Integration */}
            <GoogleMap />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-info">
              <img src={logo} alt="Aluoferta" className="footer-logo" />
              <p>Líderes en transformación de aluminio y vidrio en el Bajío con más de 25 años de experiencia.</p>
            </div>
            <div className="footer-nav">
              <h4>Navegación</h4>
              <ul>
                <li><a href="#inicio">Inicio</a></li>
                <li><a href="#productos">Productos</a></li>
                <li><a href="#portafolio">Portafolio</a></li>
                <li><a href="#nosotros">Nosotros</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Aluoferta. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={closeProject} />
    </div>
  );
}

export default App;
