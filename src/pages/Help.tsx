import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, BookOpen } from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Register' button in the top right corner and fill out the required information. You'll need to verify your email address to complete the registration process."
    },
    {
      question: "What are the trading fees?",
      answer: "We offer competitive trading fees starting at 0.1% for makers and 0.2% for takers. Fees may be reduced based on your trading volume and CryptoFlow token holdings."
    },
    {
      question: "How do I deposit funds?",
      answer: "Navigate to your Assets page and click 'Deposit'. You can deposit cryptocurrencies directly to your wallet addresses or use our fiat on-ramp services."
    },
    {
      question: "Is my money safe?",
      answer: "Yes, we use industry-leading security measures including cold storage for 95% of funds, multi-signature wallets, and comprehensive insurance coverage."
    },
    {
      question: "What trading pairs are available?",
      answer: "We support over 500 trading pairs including major cryptocurrencies like BTC, ETH, ADA, and many altcoins against USD, EUR, and BTC base pairs."
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "Go to your Profile settings, find the Security section, and click 'Enable 2FA'. You'll need a authenticator app like Google Authenticator or Authy."
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message about your issue",
      action: "Send Email",
      available: "Response within 24h"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our experts",
      action: "Call Now",
      available: "Mon-Fri 9AM-6PM EST"
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Browse our comprehensive guides",
      action: "Browse Articles",
      available: "Self-service"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Help &amp;
              <span className="text-gradient"> Support</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our expert support team.
            </p>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-slide-up">
            {supportOptions.map((option, index) => (
              <Card key={option.title} className="glass-card hover:shadow-card transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                    <option.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <Button variant="outline" className="w-full mb-3">
                    {option.action}
                  </Button>
                  <p className="text-xs text-muted-foreground">{option.available}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="glass-card rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;