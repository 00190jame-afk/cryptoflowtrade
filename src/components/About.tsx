import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Monitor, Tablet, Download, Play, Apple } from "lucide-react";
import { useTranslation } from 'react-i18next';
const About = () => {
  const { t } = useTranslation();
  const features = [
    {
      title: t('about.realTimeMarketData.title'),
      description: t('about.realTimeMarketData.description')
    }, 
    {
      title: t('about.advancedOrderTypes.title'),
      description: t('about.advancedOrderTypes.description')
    }, 
    {
      title: t('about.portfolioManagement.title'),
      description: t('about.portfolioManagement.description')
    }, 
    {
      title: t('about.instantNotifications.title'),
      description: t('about.instantNotifications.description')
    }, 
    {
      title: t('about.secureTrading.title'),
      description: t('about.secureTrading.description')
    }, 
    {
      title: t('about.access247.title'),
      description: t('about.access247.description')
    }
  ];
  const platforms = [
    {
      name: t('about.platforms.desktop.name'),
      icon: Monitor,
      description: t('about.platforms.desktop.description'),
      available: true
    }, 
    {
      name: t('about.platforms.mobile.name'),
      icon: Smartphone,
      description: t('about.platforms.mobile.description'),
      available: true
    }, 
    {
      name: t('about.platforms.tablet.name'),
      icon: Tablet,
      description: t('about.platforms.tablet.description'),
      available: true
    }
  ];
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
              <h3 className="text-2xl font-bold mb-6">{t('about.whyChoose')}</h3>
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
              {t('about.joinDescription')}
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