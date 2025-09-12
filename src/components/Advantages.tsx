import { Shield, Zap, Users, BarChart3, Clock, Globe, Lock, Headphones } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Advantages = () => {
  const advantages = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Multi-signature wallets, cold storage, and advanced encryption protect your assets with institutional-grade security measures.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Execute trades in under 1ms with our cutting-edge matching engine, handling 300,000+ transactions per second.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Global Community",
      description: "Join millions of traders worldwide with 24/7 multi-language support and an active community across all time zones.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Professional trading tools with real-time charts, technical indicators, and market intelligence for informed decisions.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Clock,
      title: "24/7 Operations",
      description: "Never miss an opportunity with round-the-clock trading, continuous market access, and seamless global operations.",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: Globe,
      title: "Regulatory Compliance",
      description: "Fully licensed and compliant with international regulations, ensuring a safe and legal trading environment.",
      gradient: "from-teal-500 to-green-500"
    },
    {
      icon: Lock,
      title: "Asset Protection",
      description: "100% reserve backing with transparent proof-of-reserves and comprehensive insurance coverage for digital assets.",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Dedicated customer success team with deep crypto expertise, available via chat, email, and phone support.",
      gradient: "from-rose-500 to-pink-500"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Choose 
            <span className="text-gradient"> CryptoFlow</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Built for traders by traders, CryptoFlow combines cutting-edge technology with 
            institutional-grade security to deliver the ultimate cryptocurrency trading experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => (
            <Card 
              key={advantage.title}
              className="group glass-card border-border/50 hover:shadow-card transition-all duration-500 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 h-full flex flex-col">
                {/* Icon */}
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${advantage.gradient} p-3 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className="w-full h-full text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                    {advantage.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {advantage.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`h-0.5 bg-gradient-to-r ${advantage.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-slide-up">
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to experience the difference?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of traders who trust CryptoFlow for their digital asset trading needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300">
                <Link to="/futures">Start Trading Today</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Advantages;