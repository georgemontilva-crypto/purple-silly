import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { MotionConfig } from "framer-motion";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PromoPopup from "./components/PromoPopup";
import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import PolicyPage from "./pages/PolicyPage";
import CustomCursor from "./components/CustomCursor";
import { usePointerFine } from "./hooks/usePointerFine";
import WhatIsSilly from "./pages/WhatIsSilly";
import LabReportsPage from "./pages/LabReportsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Account from "./pages/Account";

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
      {/* Mounted here rather than in App so it can only ever appear on the
          storefront — never over /admin, /login, /signup or /verify-email. */}
      <PromoPopup />
    </div>
  );
}

function App() {
  // The custom cursor is mounted only where there IS a cursor. On a touch
  // device it has nothing to follow, and its effect hides the native cursor
  // document-wide — which on a hybrid device would strand a user who then
  // reaches for the trackpad. Gated here so the component never mounts at
  // all on touch, rather than mounting and rendering nothing.
  const pointerFine = usePointerFine();

  return (
    <ErrorBoundary>
      {/* reducedMotion="user" makes every framer-motion animation site-wide
          (scroll reveals, particle bursts, etc.) automatically respect the
          OS-level prefers-reduced-motion setting — no per-component checks. */}
      <MotionConfig reducedMotion="user">
        <ThemeProvider defaultTheme="light">
          <CartProvider>
            <TooltipProvider>
              <Toaster position="top-right" richColors />
              {pointerFine && <CustomCursor />}
              {/* /admin and the account pages (/login, /signup, /verify-email,
                  /account) get their own clean layout — no storefront
                  Navbar/Footer. Everything else falls through to
                  StorefrontLayout, which has its own inner Switch for the
                  rest of the site. */}
              <Switch>
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/login" component={Login} />
                <Route path="/signup" component={Signup} />
                <Route path="/verify-email" component={VerifyEmail} />
                <Route path="/account" component={Account} />
                <Route component={StorefrontLayout} />
              </Switch>
            </TooltipProvider>
          </CartProvider>
        </ThemeProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
