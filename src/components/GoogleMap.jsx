import React from 'react';

const GoogleMap = () => {
    // Aluoferta Location: María Soledad #208 esq. Blvd. Mariano Escobedo col. Loma bonita, Leon Gto.
    const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.247169018659!2d-101.69047!3d21.116412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842bbf761ccf4e2d%3A0x650ec85f075aab66!2sALUOFERTA!5e0!3m2!1ses-419!2smx!4v1721861214088!5m2!1ses-419!2smx";

    return (
        <div className="google-map-container glass">
            <iframe
                src={mapUrl}
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Aluoferta"
            ></iframe>
        </div>
    );
};

export default GoogleMap;
