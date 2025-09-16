import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MarketPrices } from "@/components/MarketPrices";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Markets = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <main className="flex-1 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Crypto
              <span className="text-gradient"> Markets</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time cryptocurrency market data, prices, and trading volumes for the top digital assets.
            </p>
          </div>

          {/* Market Prices Section */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <MarketPrices />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Markets;