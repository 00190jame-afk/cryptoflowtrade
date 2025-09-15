import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, BookOpen } from "lucide-react";
const Help = () => {
  const faqs = [{
    question: "How do I create an account?",
    answer: "Click the 'Register' button in the top right corner and fill out the required information. You'll need to verify your email address to complete the registration process."
  }, {
    question: "What are the trading fees?",
    answer: "We offer competitive trading fees starting at 0.1% for makers and 0.2% for takers. Fees may be reduced based on your trading volume and CryptoFlow token holdings."
  }, {
    question: "How do I deposit funds?",
    answer: "Navigate to your Assets page and click 'Deposit'. You can deposit cryptocurrencies directly to your wallet addresses or use our fiat on-ramp services."
  }, {
    question: "Is my money safe?",
    answer: "Yes, we use industry-leading security measures including cold storage for 95% of funds, multi-signature wallets, and comprehensive insurance coverage."
  }, {
    question: "What trading pairs are available?",
    answer: "We support over 500 trading pairs including major cryptocurrencies like BTC, ETH, ADA, and many altcoins against USD, EUR, and BTC base pairs."
  }, {
    question: "How do I enable two-factor authentication?",
    answer: "Go to your Profile settings, find the Security section, and click 'Enable 2FA'. You'll need a authenticator app like Google Authenticator or Authy."
  }];
  const supportOptions = [{
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support team",
    action: "Start Chat",
    available: "24/7"
  }, {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message about your issue",
    action: "Send Email",
    available: "Response within 24h"
  }, {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    action: "Call Now",
    available: "Mon-Fri 9AM-6PM EST"
  }, {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Browse our comprehensive guides",
    action: "Browse Articles",
    available: "Self-service"
  }];
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      

      <Footer />
    </div>;
};
export default Help;