import { TrendingUp, Twitter, Github, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Footer = () => {
  const footerSections = [{
    title: "Products",
    links: [{
      name: "Futures",
      href: "/futures"
    }]
  }, {
    title: "Resources",
    links: [{
      name: "Help Center",
      href: "/help"
    }, {
      name: "Market Analysis",
      href: "/markets"
    }]
  }, {
    title: "Company",
    links: [{
      name: "About Us",
      href: "/about"
    }, {
      name: "Contact",
      href: "/contact"
    }]
  }, {
    title: "Legal",
    links: [{
      name: "Terms of Service",
      href: "/terms"
    }, {
      name: "Privacy Policy",
      href: "/privacy"
    }, {
      name: "Cookie Policy",
      href: "/cookies"
    }, {
      name: "Risk Disclosure",
      href: "/risk"
    }]
  }];
  const socialLinks = [{
    icon: Twitter,
    href: "https://twitter.com/cryptoflow",
    label: "Twitter"
  }, {
    icon: Github,
    href: "https://github.com/cryptoflow",
    label: "GitHub"
  }, {
    icon: Linkedin,
    href: "https://linkedin.com/company/cryptoflow",
    label: "LinkedIn"
  }, {
    icon: Mail,
    href: "mailto:support@cryptoflowtrade.com",
    label: "Email"
  }];
  const stats = [{
    label: "Trading Volume (24h)",
    value: "$2.4B+"
  }, {
    label: "Active Users",
    value: "50M+"
  }, {
    label: "Countries Served",
    value: "180+"
  }, {
    label: "Cryptocurrencies",
    value: "500+"
  }];
  return <footer className="relative bg-surface border-t border-border/50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-secondary/3 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          {/* Stats Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Trusted by Millions
                <span className="text-gradient"> Worldwide</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join the global community of traders who choose CryptoFlow for secure and reliable cryptocurrency trading.
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => <div key={stat.label} className="text-center glass-card rounded-xl p-6 hover:shadow-card transition-all duration-300 animate-fade-in" style={{
              animationDelay: `${index * 0.1}s`
            }}>
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>)}
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">CryptoFlow</span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The world's most advanced cryptocurrency trading platform. 
                Trade with confidence using our institutional-grade security and cutting-edge technology.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  support@cryptoflowtrade.com
                </div>
                
                
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map(section => <div key={section.title}>
                <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map(link => <li key={link.name}>
                      {link.href.startsWith('/') ? <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                          {link.name}
                        </Link> : <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                          {link.name}
                        </a>}
                    </li>)}
                </ul>
              </div>)}
          </div>

          {/* Newsletter Signup */}
          
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">© 2018-2025 CryptoFlow. All rights reserved. | Risk Warning: Trading cryptocurrencies involves substantial risk of loss.</div>

            {/* Social Links */}
            
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;