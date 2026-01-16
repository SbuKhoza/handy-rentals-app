import { Search, MessageCircle, Handshake } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find an Item",
    description: "Browse thousands of items and services from local owners. Use filters to find exactly what you need.",
  },
  {
    icon: MessageCircle,
    title: "Contact the Owner",
    description: "Message the owner directly to discuss availability, pricing, and rental terms that work for both of you.",
  },
  {
    icon: Handshake,
    title: "Agree & Pay Privately",
    description: "Once you've agreed on terms, arrange payment and collection/delivery directly with the owner.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rent4Hire connects you directly with owners. No middleman fees on rentals.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative text-center">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-secondary/50 to-secondary/10" />
                )}

                {/* Step Number & Icon */}
                <div className="relative inline-flex flex-col items-center mb-6">
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    <Icon className="w-9 h-9 text-secondary" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
