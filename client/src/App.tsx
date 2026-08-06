import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PolicyPage from "./pages/PolicyPage";
import CustomCursor from "./components/CustomCursor";
import WhatIsSilly from "./pages/WhatIsSilly";
import LabReportsPage from "./pages/LabReportsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";

// Storefront-only routes — rendered inside StorefrontLayout (Navbar + Footer).
// /admin and /login have their own layout and are NOT part of this Switch.
function StorefrontRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/what-is-silly" component={WhatIsSilly} />
      <Route path="/lab-reports" component={LabReportsPage} />
      <Route path="/collections/all" component={ShopPage} />
      <Route path="/collections/:categorySlug" component={ShopPage} />
      <Route path="/products/:slug" component={ProductDetailPage} />
      <Route path="/pages/about-us" component={AboutPage} />
      <Route path="/pages/faq" component={FAQPage} />
      <Route path="/pages/contact" component={ContactPage} />
      <Route path="/pages/:slug" component={PolicyPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <StorefrontRouter />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster position="top-right" richColors />
            <CustomCursor />
            {/* /admin, /login, /signup and /verify-email get their own clean
                layout — no storefront Navbar/Footer. Everything else falls
                through to StorefrontLayout, which has its own inner Switch
                for the rest of the site. */}
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/verify-email" component={VerifyEmail} />
              <Route component={StorefrontLayout} />
            </Switch>
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
