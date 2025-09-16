import Header from "@/components/Header";
import Footer from "@/components/Footer";
import About from "@/components/About";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
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
      
      <main className="flex-1">
        <About />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;