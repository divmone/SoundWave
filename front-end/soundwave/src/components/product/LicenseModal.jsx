/**
 * LicenseModal — лицензионное соглашение для загрузки треков
 * Открывается при клике на "Terms of Service" / "Content Policy"
 */
export default function LicenseModal({ onClose, onAccept }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', animation: 'overlayIn 0.2s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--line2)',
          borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 600,
          maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.85)',
          animation: 'modalIn 0.35s cubic-bezier(.34,1.2,.64,1) both',
        }}
      >
        {/* Shimmer stripe */}
        <div style={{
          height: 3, borderRadius: '20px 20px 0 0', flexShrink: 0,
          background: 'linear-gradient(90deg, var(--cyan-dark), var(--violet), var(--cyan))',
          backgroundSize: '300%', animation: 'shimmer 3s linear infinite',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.4rem 1.8rem 1.2rem', borderBottom: '1px solid var(--line)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--cyan)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: 4 }}>
              📄 LEGAL DOCUMENT
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 900 }}>
              Content Upload License Agreement
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--bg3)', border: '1.5px solid var(--line2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text3)', fontSize: '1rem', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line2)'; e.currentTarget.style.color = 'var(--text3)'; }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{
          overflowY: 'auto', padding: '1.8rem',
          flex: 1,
          fontSize: '0.83rem', lineHeight: 1.8,
          color: 'var(--text2)',
          fontFamily: 'var(--font-body)',
        }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text3)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            Last updated: March 2026 · Effective immediately upon upload
          </p>

          {[
            {
              title: '1. Exclusive Rights & Ownership',
              text: 'By uploading content to SoundWave Marketplace, you confirm and warrant that you are the sole author and copyright holder of the submitted audio work, or that you hold all necessary exclusive rights, licenses, and permissions to distribute it commercially. You confirm that the work does not infringe upon the intellectual property rights, moral rights, or any other rights of any third party.',
            },
            {
              title: '2. Grant of License',
              text: 'Upon upload, you grant SoundWave a non-exclusive, worldwide, royalty-free license to host, store, display, stream, and distribute your content on the Platform for the purpose of enabling buyers to preview and purchase your work. This license does not transfer ownership of your copyright to SoundWave.',
            },
            {
              title: '3. Buyer License Terms',
              text: 'Buyers who purchase your content receive a non-exclusive, non-transferable, perpetual license to use the audio in their personal or commercial streaming projects (e.g., Twitch, YouTube, podcasts). Buyers may not resell, redistribute, sublicense, or repackage the audio as a standalone product.',
            },
            {
              title: '4. Prohibited Content',
              text: 'You agree not to upload content that: (a) contains material you do not own or license; (b) includes samples or recordings from third-party copyrighted works without clearance; (c) is generated entirely by AI tools without original creative contribution from you; (d) contains illegal, harmful, hateful, or obscene material; (e) impersonates another creator or contains misleading metadata.',
            },
            {
              title: '5. Revenue & Payments',
              text: 'You are entitled to 80% of the net sale price for each purchase of your content. SoundWave retains 20% as a platform fee covering hosting, payment processing, and marketplace services. Payments are processed on a monthly basis, subject to a minimum threshold.',
            },
            {
              title: '6. Takedown & DMCA',
              text: 'SoundWave complies with the Digital Millennium Copyright Act (DMCA) and applicable copyright laws. If you receive a valid DMCA takedown notice related to your content, your upload may be removed pending resolution. False copyright claims may result in account suspension.',
            },
            {
              title: '7. Representations & Warranties',
              text: 'You represent and warrant that: (a) you have full legal capacity to enter into this agreement; (b) the uploaded content is original and does not violate any applicable law or third-party rights; (c) you will not engage in fraudulent activity including fake purchases, review manipulation, or metadata misrepresentation.',
            },
            {
              title: '8. Indemnification',
              text: 'You agree to indemnify, defend, and hold harmless SoundWave, its officers, employees, and agents from any claims, damages, liabilities, costs, or expenses (including legal fees) arising from your breach of this Agreement, your uploaded content, or your violation of any third-party rights.',
            },
            {
              title: '9. Termination',
              text: 'SoundWave reserves the right to remove any content and suspend or terminate your account at its discretion, with or without notice, if you violate this Agreement or applicable laws. Upon termination, licenses granted to buyers for already-purchased content remain valid.',
            },
            {
              title: '10. Governing Law',
              text: 'This Agreement is governed by applicable international copyright law and the laws of the jurisdiction in which SoundWave operates. Any disputes shall be resolved through binding arbitration unless prohibited by local law.',
            },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: '1.4rem' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '0.88rem', color: 'var(--text)', marginBottom: 6,
              }}>{section.title}</div>
              <p>{section.text}</p>
            </div>
          ))}

          <div style={{
            padding: '1rem 1.2rem', marginTop: '1rem',
            background: 'var(--cyan-dim)', border: '1px solid var(--line-hot)',
            borderRadius: 'var(--radius-sm)', fontSize: '0.78rem',
            color: 'var(--cyan)', fontWeight: 600,
          }}>
            By checking the agreement box in the upload form, you confirm that you have read, understood, and agree to be legally bound by all terms of this Content Upload License Agreement.
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: '1.2rem 1.8rem', borderTop: '1px solid var(--line)',
          display: 'flex', gap: '0.75rem', flexShrink: 0,
        }}>
          <button onClick={onClose} className="btn-ghost"
            style={{ flex: 1, padding: '0.85rem', justifyContent: 'center' }}>
            Close
          </button>
          {onAccept && (
            <button onClick={() => { onAccept(); onClose(); }} className="btn-primary"
              style={{ flex: 2, padding: '0.85rem', fontSize: '0.85rem', justifyContent: 'center' }}>
              ✓ I Agree — Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
