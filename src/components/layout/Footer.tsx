import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 md:py-16 pb-24 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-xl">Rent4Hire</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm">
              Rent anything. Hire anytime. Connect with local owners and find what you need.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-semibold mb-4">Browse</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/browse" className="hover:text-secondary transition-colors">All Listings</Link></li>
              <li><Link to="/browse?type=items" className="hover:text-secondary transition-colors">Items</Link></li>
              <li><Link to="/browse?type=services" className="hover:text-secondary transition-colors">Services</Link></li>
              <li><Link to="/browse" className="hover:text-secondary transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/login" className="hover:text-secondary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-secondary transition-colors">Create Account</Link></li>
              <li><Link to="/wallet" className="hover:text-secondary transition-colors">Token Wallet</Link></li>
              <li><Link to="/create-listing" className="hover:text-secondary transition-colors">List an Item</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/how-it-works" className="hover:text-secondary transition-colors">How it Works</Link></li>
              <li><Link to="/help" className="hover:text-secondary transition-colors">Help Center</Link></li>
              <li><Link to="/safety" className="hover:text-secondary transition-colors">Safety Tips</Link></li>
              <li><Link to="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © 2024 Rent4Hire. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/50">
            <Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
