import { TrendingUp, Twitter, Github, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const footerSections = [
    {
      title: t('footer.sections.products.title'),
      links: [
        { name: t('footer.sections.products.spotTrading'), href: "/spot" },
        { name: t('footer.sections.products.futures'), href: "/futures" },
        { name: t('footer.sections.products.options'), href: "/options" },
        { name: t('footer.sections.products.staking'), href: "/staking" },
        { name: t('footer.sections.products.nftMarketplace'), href: "/nft" }
      ]
    },
    {
      title: t('footer.sections.resources.title'),
      links: [
        { name: t('footer.sections.resources.helpCenter'), href: "/help" },
        { name: t('footer.sections.resources.apiDocs'), href: "/api" },
        { name: t('footer.sections.resources.tradingGuides'), href: "/guides" },
        { name: t('footer.sections.resources.marketAnalysis'), href: "/analysis" },
        { name: t('footer.sections.resources.educational'), href: "/learn" }
      ]
    },
    {
      title: t('footer.sections.company.title'),
      links: [
        { name: t('footer.sections.company.aboutUs'), href: "/about" },
        { name: t('footer.sections.company.careers'), href: "/careers" },
        { name: t('footer.sections.company.pressKit'), href: "/press" },
        { name: t('footer.sections.company.blog'), href: "/blog" },
        { name: t('footer.sections.company.contact'), href: "/contact" }
      ]
    },
    {
      title: t('footer.sections.legal.title'),
      links: [
        { name: t('footer.sections.legal.terms'), href: "/terms" },
        { name: t('footer.sections.legal.privacy'), href: "/privacy" },
        { name: t('footer.sections.legal.cookies'), href: "/cookies" },
        { name: t('footer.sections.legal.compliance'), href: "/compliance" },
        { name: t('footer.sections.legal.riskDisclosure'), href: "/risk" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/cryptoflow", label: "Twitter" },
    { icon: Github, href: "https://github.com/cryptoflow", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/cryptoflow", label: "LinkedIn" },
    { icon: Mail, href: "mailto:support@cryptoflow.com", label: "Email" }
  ];

  const stats = [
    { label: t('footer.tradingVolume'), value: "$2.4B+" },
    { label: t('footer.activeUsers'), value: "50M+" },
    { label: t('footer.countriesServed'), value: "180+" },
    { label: t('footer.cryptocurrencies'), value: "500+" }
  ];

  return (
    <footer className="relative bg-surface border-t border-border/50 overflow-hidden">
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
                {t('footer.trustedBy')}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('footer.trustedDescription')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center glass-card rounded-xl p-6 hover:shadow-card transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
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
                {t('footer.description')}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  support@cryptoflow.com
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  San Francisco, CA
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <a 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="glass-card rounded-2xl p-8 mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-bold mb-4">{t('footer.stayUpdated')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('footer.newsletterDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder={t('footer.emailPlaceholder')}
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                />
                <Button className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300">
                  {t('footer.subscribe')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {t('footer.noSpam')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground mr-2">{t('footer.followUs')}</span>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;