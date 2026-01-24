import React from 'react';
import { X, Calendar, User, Construction, Info } from 'lucide-react';
import './ProjectModal.css';

const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-grid">
                    <div className="modal-image">
                        <img src={project.img} alt={project.name} />
                    </div>

                    <div className="modal-details">
                        <span className="modal-subtitle">DETALLES DEL PROYECTO</span>
                        <h2 className="modal-title">{project.name}</h2>

                        <div className="modal-info-grid">
                            <div className="info-item">
                                <div className="info-icon"><User size={18} /></div>
                                <div>
                                    <strong>CLIENTE</strong>
                                    <span>{project.client || "Aluoferta"}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon"><Construction size={18} /></div>
                                <div>
                                    <strong>PRODUCTO</strong>
                                    <span>{project.product || "Solución Arquitectónica"}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon"><Calendar size={18} /></div>
                                <div>
                                    <strong>AÑO</strong>
                                    <span>{project.date || "---"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-description">
                            <div className="description-header">
                                <Info size={18} />
                                <strong>RESEÑA</strong>
                            </div>
                            <p>{project.description}</p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={onClose}>CERRAR</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;
