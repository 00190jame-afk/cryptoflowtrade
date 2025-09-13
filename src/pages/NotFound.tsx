import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            {/* 404 Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                <Search className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
              <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="glass-card border-primary/30 hover:bg-primary/10">
                <button onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </button>
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Try these popular pages:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/markets">Markets</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/futures">Trading</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/news">News</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/help">Help</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
