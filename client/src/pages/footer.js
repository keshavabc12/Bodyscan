import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-md-4 mb-4">
            <h5 className="text-uppercase">Body-Scan</h5>
            <p className="text-light small">
              Your one-stop shop for all stylish clothing. Quality, comfort, and fashion at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4">
            <h6 className="text-uppercase mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/shop" className="text-light text-decoration-none">Shop</a></li>
              <li><a href="/cart" className="text-light text-decoration-none">Cart</a></li>
              <li><a href="/contact" className="text-light text-decoration-none">Contact Us</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-md-3 mb-4">
            <h6 className="text-uppercase mb-3">Categories</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Bra</a></li>
              <li><a href="/" className="text-light text-decoration-none">Panties</a></li>
              <li><a href="/" className="text-light text-decoration-none">Kids Drawer</a></li>
              <li><a href="/" className="text-light text-decoration-none">Sale</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="col-md-3 mb-4">
            <h6 className="text-uppercase mb-3">Follow Us</h6>
            <div className="d-flex flex-column gap-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-light text-decoration-none">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-light text-decoration-none">Instagram</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-light text-decoration-none">Twitter</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-3 border-top border-secondary">
          <p className="mb-0 text-light small">
            &copy; {new Date().getFullYear()} Body-Scan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
