'use client';

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, Check, Loader2, Shield, CreditCard, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useFirestoreCRUD } from "@/hooks/useFirestoreCRUD";
import type { TokenWallet, TokenTransaction, TokenPackage } from "@/types";
import { toast } from "sonner";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

const TOKEN_PACKAGES: TokenPackage[] = [
  { id: "starter", tokens: 10, price: 1000 },
  { id: "popular", tokens: 50, price: 4500, popular: true },
  { id: "value", tokens: 100, price: 8000 },
];

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

const BuyTokens = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const walletApi = useFirestoreCRUD<TokenWallet>({ collectionName: "wallets" });
  const transactionsApi = useFirestoreCRUD<TokenTransaction>({ collectionName: "tokenTransactions" });

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      try {
        const wallet = await walletApi.getById(user.uid);
        if (wallet) {
          setWalletBalance(wallet.balance);
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
      }
    };
    fetchWallet();
  }, [user]);

  const handlePayment = async () => {
    if (!user || !selectedPackage || !paystackLoaded) {
      toast.error("Please select a package and ensure you're logged in");
      return;
    }

    setLoading(true);

    const reference = `TOK_${user.uid}_${Date.now()}`;

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email || "",
        amount: selectedPackage.price * 100, // Paystack expects amount in kobo
        currency: "NGN",
        ref: reference,
        callback: async (response) => {
          // Payment successful - credit tokens
          try {
            // Get or create wallet
            let wallet = await walletApi.getById(user.uid);
            
            if (!wallet) {
              // Create new wallet
              await walletApi.set(user.uid, {
                userId: user.uid,
                balance: selectedPackage.tokens,
              });
            } else {
              // Update existing wallet
              await walletApi.update(user.uid, {
                balance: wallet.balance + selectedPackage.tokens,
              });
            }

            // Record transaction
            await transactionsApi.create({
              userId: user.uid,
              type: "credit",
              amount: selectedPackage.tokens,
              description: `Token Purchase - ${selectedPackage.tokens} tokens`,
              reference: response.reference,
            });

            toast.success(`Successfully purchased ${selectedPackage.tokens} tokens!`);
            setWalletBalance((prev) => prev + selectedPackage.tokens);
            setSelectedPackage(null);
          } catch (error) {
            console.error("Error crediting tokens:", error);
            toast.error("Payment received but failed to credit tokens. Please contact support.");
          }
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
          toast.info("Payment cancelled");
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Not logged in</h2>
              <p className="text-muted-foreground mb-6">Sign in to purchase tokens</p>
              <Button variant="teal" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Buy Tokens</h1>
              <p className="text-muted-foreground">Purchase tokens to list your items</p>
            </div>
          </div>

          {/* Current Balance */}
          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-6 mb-8 text-secondary-foreground">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
                <Coins className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm opacity-80">Current Balance</p>
                <p className="text-3xl font-bold">{walletBalance} Tokens</p>
              </div>
            </div>
          </div>

          {/* Token Packages */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Select a Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TOKEN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative border rounded-2xl p-6 cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? "border-secondary bg-secondary/10 ring-2 ring-secondary"
                      : "border-border hover:border-secondary/50"
                  } ${pkg.popular ? "md:scale-105" : ""}`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-medium">
                      Most Popular
                    </span>
                  )}
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <Coins className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{pkg.tokens}</p>
                    <p className="text-muted-foreground mb-4">Tokens</p>
                    <p className="text-2xl font-bold text-secondary">₦{pkg.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      ₦{(pkg.price / pkg.tokens).toFixed(0)} per token
                    </p>
                  </div>

                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <Check className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Token Usage Info */}
          <div className="bg-card rounded-2xl p-6 border mb-8">
            <h3 className="font-semibold text-foreground mb-4">How Tokens Work</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold">1</span>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">30-day listing</strong> costs 1 token
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold">2</span>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">60-day listing</strong> costs 2 tokens
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold">3</span>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">90-day listing</strong> costs 3 tokens
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            variant="teal"
            size="xl"
            className="w-full"
            onClick={handlePayment}
            disabled={!selectedPackage || loading || !paystackLoaded}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                {selectedPackage
                  ? `Pay ₦${selectedPackage.price.toLocaleString()}`
                  : "Select a Package"}
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secured by Paystack</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyTokens;
