'use client';

export default function MapSectionInner({ latitude, longitude, name }) {
  // Dynamic Google Maps embed link
  const embedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=14&output=embed`;

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <iframe
        title={`Map location for ${name}`}
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
