'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#8B5CF6" />
              <path d="M10 16c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="14" r="1.5" fill="white" />
              <circle cx="20" cy="14" r="1.5" fill="white" />
            </svg>
            <span className="logo-text">VoxSilent</span>
          </div>
          <p className="tagline">Diskusi tanpa tekanan, keputusan dengan pasti.</p>
        </div>

        <div className="footer-links">
          <div className="link-group">
            <h4 className="link-title">Produk</h4>
            <a href="#" className="footer-link">Fitur</a>
            <a href="#" className="footer-link">Harga</a>
            <a href="#" className="footer-link">FAQ</a>
          </div>
          <div className="link-group">
            <h4 className="link-title">Perusahaan</h4>
            <a href="#" className="footer-link">Tentang Kami</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Karir</a>
          </div>
          <div className="link-group">
            <h4 className="link-title">Legal</h4>
            <a href="#" className="footer-link">Privasi</a>
            <a href="#" className="footer-link">Syarat</a>
            <a href="#" className="footer-link">Cookie</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
              </svg>
            </a>
          </div>
          <div className="copyright">
            © {currentYear} VoxSilent. Semua hak dilindungi.
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #0F172A;
          padding: 60px 24px 32px;
          color: #eef0ff;
        }

        .container {
          max-width: 480px;
          margin: 0 auto;
        }

        .footer-brand {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
        }

        .tagline {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #eef0ff;
          opacity: 0.7;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .link-title {
          font-family: 'Lexend', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .footer-link {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #eef0ff;
          opacity: 0.7;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-link:hover {
          opacity: 1;
        }

        .footer-bottom {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid rgba(238, 240, 255, 0.1);
        }

        .social-links {
          display: flex;
          gap: 16px;
        }

        .social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(238, 240, 255, 0.1);
          border-radius: 10px;
          color: #eef0ff;
          transition: background 0.2s, transform 0.2s;
        }

        .social-link:hover {
          background: rgba(238, 240, 255, 0.2);
          transform: translateY(-2px);
        }

        .copyright {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #eef0ff;
          opacity: 0.5;
        }

        @media (min-width: 768px) {
          .footer-links {
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </footer>
  );
}