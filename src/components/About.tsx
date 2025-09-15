import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Shield, Users, Globe, Clock, DollarSign, BarChart3 } from "lucide-react";

const About = () => {
  const stats = [
    { number: "1000+", label: "Trading Pairs" },
    { number: "500,000+", label: "Registered Users" },
    { number: "2,000,000+", label: "CryptoFlow Ecosystem Users" },
    { number: "24/7", label: "Customer Service and Support" }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Diversified Trading Categories",
      description: "CryptoFlow offers diversified trading categories such as spot trading, futures trading, OTC trading and margin trading. CryptoFlow is committed to providing interest-free margin trading and charges the lowest service fees."
    },
    {
      icon: Users,
      title: "Social Infused Trading Platform", 
      description: "Group trading enables an easier access to crypto trading and a faster tracking of the market."
    },
    {
      icon: Globe,
      title: "Global Coverage Business Scope",
      description: "CryptoFlow has established operation centers globally with worldwide coverage of business operations."
    }
  ];

  const tradingCategories = [
    "Spot Trading",
    "Fiat",
    "Futures Trading", 
    "Savings",
    "Margin Trade",
    "Pool"
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl animate-float" style={{
        animationDelay: '1s'
      }} />
      
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            CryptoFlow
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold mb-8">
            Gateway to Digital Asset, Highway to
            <span className="text-gradient"> Wealth</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            CryptoFlow is a globally leading digital asset trading platform dedicated to providing users with secure, stable, and diversified cryptocurrency trading services.
          </p>
          <p className="text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            The platform operates under the global domain, serving over 500,000 registered users with more than 100,000 monthly active users, and a total ecosystem traffic exceeding 2 million. The platform supports over 800 cryptocurrencies and 1,000+ trading pairs, offering a wide range of services including spot trading, margin trading, derivatives, OTC, and credit card purchases—striving to deliver a professional, secure, and efficient one-stop trading experience for users worldwide.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 animate-slide-up">
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center animate-fade-in" style={{
              animationDelay: `${index * 0.1}s`
            }}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="space-y-16 mb-20">
          {features.map((feature, index) => (
            <div key={feature.title} className={`grid lg:grid-cols-2 gap-12 items-center animate-slide-up ${
              index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
            }`} style={{
              animationDelay: `${index * 0.2}s`
            }}>
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              <div className={`glass-card p-8 rounded-2xl ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                {index === 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {tradingCategories.map((category) => (
                      <div key={category} className="p-4 rounded-lg bg-surface-elevated/50 text-center">
                        <div className="text-sm font-medium">{category}</div>
                      </div>
                    ))}
                  </div>
                )}
                {index === 1 && (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Social Trading Features</p>
                    </div>
                  </div>
                )}
                {index === 2 && (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Global Operations</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Partners Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 items-center opacity-60">
            {[
              "BlockTech", "CryptoMedia", "WXY Group", "CoinGecko", "Cobak", "KORating",
              "CoinReaders", "Aliansi Koin", "BlockNews", "AiCoin", "Xangle", "Coin360",
              "CoinGhost", "Coinhills", "CryptoWisser", "Banxa", "Hachen", "IntoTheBlock",
              "TokenPost", "Advcash", "Simplex", "Bitpush", "BitTab", "BitcoinTrading",
              "Chiliz", "Koinly", "TraderX", "WalletInvestor", "OSLPay", "InvestorBites",
              "TechFlow", "ODaily", "Huostarter", "CoreSky"
            ].map((partner, index) => (
              <div 
                key={partner} 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
export default About;