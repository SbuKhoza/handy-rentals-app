import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CMSProvider } from "@/contexts/CMSContext";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ListingDetails from "./pages/ListingDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import ListingsManagement from "./pages/admin/ListingsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import TokenPackagesManagement from "./pages/admin/TokenPackagesManagement";
import ListingPricingManagement from "./pages/admin/ListingPricingManagement";
import SiteContentManagement from "./pages/admin/SiteContentManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CMSProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            
            {/* Admin CMS Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="listings" element={<ListingsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="tokens" element={<TokenPackagesManagement />} />
              <Route path="pricing" element={<ListingPricingManagement />} />
              <Route path="content" element={<SiteContentManagement />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CMSProvider>
  </QueryClientProvider>
);

export default App;
