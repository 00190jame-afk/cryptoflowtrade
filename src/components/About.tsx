import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Smartphone, Monitor, Tablet, Download, Play, Apple } from "lucide-react";

const About = () => {
  const features = [
    {
      title: "Real-Time Market Data",
      description: "Access live cryptocurrency prices, charts, and market depth across all your devices."
    },
    {
      title: "Advanced Order Types",
      description: "Execute sophisticated trading strategies with limit, market, stop-loss, and algorithmic orders."
    },
    {
      title: "Portfolio Management",
      description: "Track your investments with comprehensive portfolio analytics and performance metrics."
    },
    {
      title: "Instant Notifications",
      description: "Stay informed with customizable price alerts and market movement notifications."
    },
    {
      title: "Secure Trading",
      description: "Multi-factor authentication and biometric security protect your trading activities."
    },
    {
      title: "24/7 Access",
      description: "Trade cryptocurrencies anytime, anywhere with seamless cross-platform synchronization."
    }
  ];

  const platforms = [
    {
      name: "Desktop",
      icon: Monitor,
      description: "Full-featured trading terminal",
      available: true
    },
    {
      name: "Mobile",
      icon: Smartphone,
      description: "Trade on the go",
      available: true
    },
    {
      name: "Tablet",
      icon: Tablet,
      description: "Optimized for tablets",
      available: true
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="secondary" className="mb-4 px-4 py-2 glass-card border-primary/20">
            🎯 Trade Anywhere, Anytime
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Experience 
            <span className="text-gradient"> Seamless Trading</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            CryptoFlow delivers a consistent, powerful trading experience across all platforms. 
            Whether you're at your desk or on the move, access the full power of our trading ecosystem.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Features */}
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-2xl font-bold mb-6">Why Choose Our Platform?</h3>
              <div className="grid gap-6">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="group flex gap-4 p-4 rounded-xl hover:bg-surface-elevated/50 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform duration-300" />
                    <div>
                      <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Compatibility */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold">Available On All Devices</h4>
              <div className="grid grid-cols-3 gap-4">
                {platforms.map((platform, index) => (
                  <Card 
                    key={platform.name}
                    className="glass-card border-border/50 hover:shadow-card transition-all duration-300 animate-scale-in"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-3">
                        <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <platform.icon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h5 className="font-medium mb-1">{platform.name}</h5>
                      <p className="text-xs text-muted-foreground">{platform.description}</p>
                      {platform.available && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Available
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - App Preview & Downloads */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {/* App Preview Card */}
            <Card className="glass-card border-primary/20 overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* Mock Phone Frame */}
                  <div className="relative mx-auto w-64 h-96 bg-gradient-to-br from-surface to-surface-elevated rounded-3xl p-4 shadow-elevated">
                    {/* Screen */}
                    <div className="w-full h-full bg-background rounded-2xl p-4 overflow-hidden">
                      {/* Mock App Interface */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">Portfolio</div>
                          <div className="text-sm text-success">+12.5%</div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-primary/20 rounded-full">
                            <div className="h-full w-3/4 bg-primary rounded-full" />
                          </div>
                          <div className="text-xs text-muted-foreground">$24,567.89</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-surface rounded-lg">
                            <div className="text-xs text-muted-foreground">BTC</div>
                            <div className="text-sm font-medium">$45,123</div>
                          </div>
                          <div className="p-2 bg-surface rounded-lg">
                            <div className="text-xs text-muted-foreground">ETH</div>
                            <div className="text-sm font-medium">$3,456</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-background rounded-b-2xl" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-2">Download CryptoFlow App</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Get the mobile app and trade crypto on the go with advanced features and real-time notifications.
                    </p>

                    {/* Download Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                        <Apple className="h-5 w-5" />
                        App Store
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Google Play
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="glass-card border-border/50">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4">App Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">4.8★</div>
                    <div className="text-xs text-muted-foreground">App Store Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2M+</div>
                    <div className="text-xs text-muted-foreground">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">500K+</div>
                    <div className="text-xs text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Trading?</h3>
            <p className="text-muted-foreground mb-8">
              Join millions of traders who trust CryptoFlow for secure, fast, and reliable cryptocurrency trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300 group">
                Create Account Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="glass-card border-primary/30 hover:bg-primary/10">
                Download App
                <Download className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;