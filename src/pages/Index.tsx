import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Advantages from "@/components/Advantages";
import News from "@/components/News";
import About from "@/components/About";
import Footer from "@/components/Footer";
import QuickDepositCard from "@/components/QuickDepositCard";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <QuickDepositCard />
        <Advantages />
        <News />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
