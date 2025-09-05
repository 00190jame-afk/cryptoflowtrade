import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const News = () => {
  const newsItems = [
    {
      id: 1,
      category: "Market Analysis",
      title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
      excerpt: "Major financial institutions continue to embrace Bitcoin, driving unprecedented market growth and mainstream acceptance.",
      timestamp: "2 hours ago",
      readTime: "3 min read",
      trend: "bullish",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      category: "Technology",
      title: "Ethereum 2.0 Staking Rewards Hit Record High",
      excerpt: "The latest network upgrade has significantly improved staking yields, attracting more validators to the ecosystem.",
      timestamp: "4 hours ago",
      readTime: "5 min read",
      trend: "neutral",
      image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      category: "Regulation",
      title: "New Cryptocurrency Guidelines Released by Financial Authorities",
      excerpt: "Clearer regulatory framework provides enhanced clarity for institutional investors and retail traders alike.",
      timestamp: "6 hours ago",
      readTime: "4 min read",
      trend: "neutral",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      category: "DeFi",
      title: "Decentralized Finance TVL Surpasses $100B Milestone",
      excerpt: "Total value locked in DeFi protocols reaches historic levels as adoption accelerates across various sectors.",
      timestamp: "8 hours ago",
      readTime: "6 min read",
      trend: "bullish",
      image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      category: "Platform",
      title: "CryptoFlow Introduces Advanced Portfolio Analytics",
      excerpt: "New AI-powered insights help traders optimize their strategies with real-time risk assessment and performance tracking.",
      timestamp: "12 hours ago",
      readTime: "3 min read",
      trend: "neutral",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      category: "Market Analysis",
      title: "Altcoin Season: Emerging Opportunities in Layer 1 Protocols",
      excerpt: "Analysis of promising blockchain platforms and their potential impact on the broader cryptocurrency ecosystem.",
      timestamp: "1 day ago",
      readTime: "7 min read",
      trend: "bullish",
      image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "Market Analysis": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Technology": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Regulation": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      "DeFi": "bg-green-500/10 text-green-400 border-green-500/20",
      "Platform": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "bullish") return <TrendingUp className="h-3 w-3 text-success" />;
    return <div className="h-3 w-3 rounded-full bg-muted-foreground/50" />;
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Latest 
              <span className="text-gradient"> Crypto News</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Stay informed with the latest developments in cryptocurrency markets, technology, and regulations.
            </p>
          </div>
          <Link to="/news">
            <Button variant="outline" className="glass-card border-primary/30 hover:bg-primary/10 mt-4 lg:mt-0">
              View All News
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Featured Article */}
        <div className="mb-12 animate-slide-up">
          <Link to="/news">
            <Card className="glass-card border-border/50 overflow-hidden group hover:shadow-elevated transition-all duration-500 cursor-pointer">
            <div className="lg:flex">
              <div className="lg:w-1/2">
                <img 
                  src={newsItems[0].image} 
                  alt={newsItems[0].title}
                  className="w-full h-64 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="lg:w-1/2 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getCategoryColor(newsItems[0].category)}>
                    {newsItems[0].category}
                  </Badge>
                  {getTrendIcon(newsItems[0].trend)}
                  <span className="text-sm text-muted-foreground">Featured</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {newsItems[0].title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {newsItems[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {newsItems[0].timestamp}
                    </div>
                    <span>{newsItems[0].readTime}</span>
                  </div>
                  <Button variant="ghost" className="group/btn hover:bg-primary/10">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.slice(1).map((article, index) => (
            <Link key={article.id} to="/news">
              <Card 
                className="glass-card border-border/50 overflow-hidden group hover:shadow-card transition-all duration-500 hover:-translate-y-1 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
              <div className="relative">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={getCategoryColor(article.category)}>
                    {article.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  {getTrendIcon(article.trend)}
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.timestamp}
                  </div>
                  <span>{article.readTime}</span>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 animate-slide-up">
          <Card className="glass-card border-primary/20 text-center">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Stay in the Loop</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get the latest crypto news and market insights delivered directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-surface border border-border focus:border-primary outline-none transition-colors"
                />
                <Button className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default News;