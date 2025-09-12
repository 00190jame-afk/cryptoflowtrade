import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Monitor, Tablet, Download, Play, Apple } from "lucide-react";
import { useTranslation } from 'react-i18next';
const About = () => {
  const { t } = useTranslation();
  const features = [{
    title: "Real-Time Market Data",
    description: "Access live cryptocurrency prices, charts, and market depth across all your devices."
  }, {
    title: "Advanced Order Types",
    description: "Execute sophisticated trading strategies with limit, market, stop-loss, and algorithmic orders."
  }, {
    title: "Portfolio Management",
    description: "Track your investments with comprehensive portfolio analytics and performance metrics."
  }, {
    title: "Instant Notifications",
    description: "Stay informed with customizable price alerts and market movement notifications."
  }, {
    title: "Secure Trading",
    description: "Multi-factor authentication and biometric security protect your trading activities."
  }, {
    title: "24/7 Access",
    description: "Trade cryptocurrencies anytime, anywhere with seamless cross-platform synchronization."
  }];
  const platforms = [{
    name: "Desktop",
    icon: Monitor,
    description: "Full-featured trading terminal",
    available: true
  }, {
    name: "Mobile",
    icon: Smartphone,
    description: "Trade on the go",
    available: true
  }, {
    name: "Tablet",
    icon: Tablet,
    description: "Optimized for tablets",
    available: true
  }];
  return <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl animate-float" style={{
      animationDelay: '1s'
    }} />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4 px-4 py-2 glass-card border-primary/20">
            🎯 Trade Anywhere, Anytime
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Features */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-2xl font-bold mb-6">Why Choose Our Platform?</h3>
              <div className="grid gap-6">
                {features.map((feature, index) => <div key={feature.title} className="group flex gap-4 p-4 rounded-xl hover:bg-surface-elevated/50 transition-all duration-300 animate-fade-in" style={{
                animationDelay: `${index * 0.1}s`
              }}>
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* Platform Compatibility */}
            
          </div>

          {/* Right Column - App Preview & Downloads */}
          
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">{t('about.createAccount')}</h3>
            <p className="text-muted-foreground mb-8">
              {t('about.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300 group">
                {t('about.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default About;