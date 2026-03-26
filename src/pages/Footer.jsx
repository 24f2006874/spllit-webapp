import { Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">spllit.</h3>
            <p className="footer-description">
              The embedded fintech infrastructure for modern shared mobility. 
              We automate fare splitting, micropayments, and settlements in real-time.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-icon" aria-label="WhatsApp">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Product Section */}
          <div className="footer-column">
            <h4 className="footer-column-title">Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#download">Download App</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="footer-column">
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-column">
            <h4 className="footer-column-title">Contact</h4>
            <ul className="footer-links">
              <li><a href="mailto:support@spllit.app">support@spllit.app</a></li>
              <li><a href="mailto:info@spllit.app">info@spllit.app</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">&copy; 2026 Spllit Inc. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
