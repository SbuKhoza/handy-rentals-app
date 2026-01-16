import { Link } from "react-router-dom";
import { Search, MessageCircle, Handshake, Shield, Coins, ArrowRight, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    title: "Find What You Need",
    description: "Browse thousands of items and services from local owners. Use filters to narrow down by category, location, and price range.",
    features: [
      "Search by keyword or category",
      "Filter by location radius",
      "View detailed photos and descriptions",
      "Check owner ratings and reviews",
    ],
  },
  {
    icon: MessageCircle,
    title: "Contact the Owner",
    description: "Message owners directly through our secure messaging system. Discuss availability, pricing, and any questions you have.",
    features: [
      "In-app messaging system",
      "Discuss rental terms",
      "Ask about availability",
      "Negotiate pricing privately",
    ],
  },
  {
    icon: Handshake,
    title: "Agree & Pay Privately",
    description: "Once you've agreed on terms, arrange payment and pickup directly with the owner. Rent4Hire doesn't process rental payments.",
    features: [
      "No platform fees on rentals",
      "Flexible payment methods",
      "Arrange pickup or delivery",
      "Agree on deposit terms",
    ],
  },
];

const forOwners = [
  {
    icon: Coins,
    title: "Token-Based Listing",
    description: "Use tokens to publish your listings. Tokens are affordable and keep the platform spam-free.",
  },
  {
    icon: Shield,
    title: "Stay in Control",
    description: "You decide who rents your items, set your own prices, and arrange payments directly.",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat with potential renters, answer questions, and build trust before any transaction.",
  },
];

const HowItWorksPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            How Rent4Hire Works
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            A simple way to rent items and hire services from people in your community.
            No middleman fees on rentals.
          </p>
        </div>
      </section>

      {/* For Renters */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
              For Renters
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Rent in 3 Simple Steps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Finding and renting items has never been easier.
            </p>
          </div>

          <div className="space-y-16 md:space-y-24 max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center gap-8 md:gap-16`}
                >
                  {/* Icon & Number */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-secondary/10 flex items-center justify-center">
                        <Icon className="w-12 h-12 md:w-16 md:h-16 text-secondary" />
                      </div>
                      <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-secondary text-secondary-foreground text-lg font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-lg mb-6">
                      {step.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {step.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-foreground">
                          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button variant="teal" size="xl" asChild>
              <Link to="/browse">
                Start Browsing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-4">
              For Owners
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Turn Your Items Into Income
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              List your items or services and connect with people who need them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {forOwners.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-card rounded-2xl p-6 md:p-8 border border-border text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Token Pricing */}
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground text-center mb-6">
              Simple Token Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-foreground">1 Token</div>
                <div className="text-muted-foreground">30 days listing</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-foreground">2 Tokens</div>
                <div className="text-muted-foreground">60 days listing</div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-foreground">3 Tokens</div>
                <div className="text-muted-foreground">90 days listing</div>
              </div>
            </div>
            <p className="text-center text-muted-foreground mt-6">
              Tokens are priced in ZAR. Check the wallet for current rates.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button variant="teal" size="xl" asChild>
              <Link to="/create-listing">
                Start Listing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trust & Safety
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We encourage all users to communicate through our platform, check reviews before renting, 
              meet in safe public places, and always agree on terms before any transaction.
            </p>
            <div className="bg-accent/50 rounded-2xl p-6">
              <p className="text-foreground font-medium">
                ⚠️ Rent4Hire is a discovery platform. We don't process rental payments. 
                Always exercise caution and use secure payment methods when dealing with others.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorksPage;
