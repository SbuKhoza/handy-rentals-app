import Layout from "@/components/layout/Layout";
import { MessageCircle } from "lucide-react";

const Messages = () => {
  return (
    <Layout>
      <div className="pt-20 md:pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No messages yet</h2>
            <p className="text-muted-foreground max-w-md">
              When you contact a listing owner or receive inquiries about your listings, your conversations will appear here.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
