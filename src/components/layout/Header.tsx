import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Plus, LogOut, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/how-it-works", label: "How it Works" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const getHeaderBg = () => {
    if (isHome && isScrolled) {
      return "bg-secondary/95 backdrop-blur-md border-b border-secondary/50";
    }
    if (isHome) {
      return "bg-transparent";
    }
    return "bg-card/95 backdrop-blur-md border-b border-border";
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        getHeaderBg()
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-lg md:text-xl">R</span>
            </div>
            <span
              className={cn(
                "font-bold text-xl md:text-2xl transition-colors",
                isHome ? "text-white" : "text-foreground"
              )}
            >
              Rent4Hire
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-secondary",
                  isHome ? "text-white/80 hover:text-white" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/wallet"
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-secondary",
                    isHome ? "text-white/80 hover:text-white" : "text-muted-foreground"
                  )}
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full object-cover border-2 border-secondary/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isHome ? "text-white" : "text-foreground"
                  )}>
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </Link>
                <Button
                  variant={isHome ? "heroOutline" : "outline"}
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant={isHome ? "heroOutline" : "outline"}
                size="sm"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            <Button
              variant={isHome ? "hero" : "teal"}
              size="sm"
              asChild
            >
              <Link to="/create-listing">
                <Plus className="w-4 h-4" />
                List Item
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className={cn("w-6 h-6", isHome ? "text-white" : "text-foreground")} />
            ) : (
              <Menu className={cn("w-6 h-6", isHome ? "text-white" : "text-foreground")} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border animate-slide-down">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      )}
                      <span className="font-medium">
                        {user.displayName || user.email?.split("@")[0]}
                      </span>
                    </Link>
                    <Link
                      to="/wallet"
                      className="flex items-center gap-2 py-2 text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Wallet className="w-5 h-5" />
                      <span className="font-medium">Wallet</span>
                    </Link>
                    <Button variant="outline" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                )}
                <Button variant="teal" asChild>
                  <Link to="/create-listing" onClick={() => setIsMenuOpen(false)}>
                    <Plus className="w-4 h-4" />
                    List Item
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
