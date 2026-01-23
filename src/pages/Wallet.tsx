'use client';

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useFirestoreCRUD, where, orderBy } from "@/hooks/useFirestoreCRUD";
import type { TokenWallet, TokenTransaction } from "@/types";
import { Wallet as WalletIcon, Plus, History, ArrowUpRight, ArrowDownLeft, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Wallet = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [userTransactions, setUserTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const walletApi = useFirestoreCRUD<TokenWallet>({ collectionName: "wallets" });
  const transactionsApi = useFirestoreCRUD<TokenTransaction>({ collectionName: "tokenTransactions" });

  // Fetch wallet and transactions for the current user
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user's wallet by their UID
        const wallet = await walletApi.getById(user.uid);
        if (wallet) {
          setWalletBalance(wallet.balance);
        }

        // Fetch user's transactions with a query filter (required by Firestore rules)
        const filteredTransactions = await transactionsApi.getAll([
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        ]);
        setUserTransactions(filteredTransactions);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user]);

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
              <p className="text-muted-foreground mb-6">Sign in to view your wallet</p>
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">Token Wallet</h1>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-6 mb-6 text-secondary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Available Balance</p>
                  <p className="text-3xl font-bold">{walletBalance} Tokens</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-secondary-foreground/10 border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/20" asChild>
              <Link to="/buy-tokens">
                <Plus className="w-4 h-4 mr-2" />
                Buy More Tokens
              </Link>
            </Button>
          </div>

          {/* Token Packages */}
          <div className="bg-card rounded-2xl p-6 card-elevated mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Token Packages</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-border rounded-xl p-4 text-center hover:border-secondary transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-foreground">10</p>
                <p className="text-xs text-muted-foreground mb-2">Tokens</p>
                <p className="text-sm font-semibold text-secondary">R50</p>
              </div>
              <div className="border-2 border-secondary rounded-xl p-4 text-center relative cursor-pointer bg-secondary/5">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">Popular</span>
                <p className="text-2xl font-bold text-foreground">50</p>
                <p className="text-xs text-muted-foreground mb-2">Tokens</p>
                <p className="text-sm font-semibold text-secondary">R200</p>
              </div>
              <div className="border border-border rounded-xl p-4 text-center hover:border-secondary transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-foreground">100</p>
                <p className="text-xs text-muted-foreground mb-2">Tokens</p>
                <p className="text-sm font-semibold text-secondary">R350</p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-card rounded-2xl p-6 card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              <History className="w-5 h-5 text-muted-foreground" />
            </div>
{loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : userTransactions.length > 0 ? (
              <div className="space-y-3">
                {userTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "credit" ? "bg-success/20" : "bg-muted"
                      }`}>
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      tx.type === "credit" ? "text-success" : "text-foreground"
                    }`}>
                      {tx.type === "credit" ? "+" : "-"}{tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Wallet;
