import { Link } from "react-router-dom";
import { ArrowRight, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 hero-gradient relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: List Your Item */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Have something to rent out?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-lg">
              Turn your idle items into income. List your items or services and connect with people who need them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/create-listing">
                  Start Listing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Token Info */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Coins className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Token System</h3>
                <p className="text-white/60">Simple & affordable listing</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">30 days listing</span>
                <span className="font-semibold text-white">1 Token</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/80">60 days listing</span>
                <span className="font-semibold text-white">2 Tokens</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-white/80">90 days listing</span>
                <span className="font-semibold text-white">3 Tokens</span>
              </div>
            </div>

            <Button variant="hero" className="w-full" size="lg" asChild>
              <Link to="/wallet">
                <Coins className="w-5 h-5" />
                Buy Tokens
              </Link>
            </Button>

            <p className="text-white/50 text-sm text-center mt-4">
              No hidden fees. You only pay for listing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
