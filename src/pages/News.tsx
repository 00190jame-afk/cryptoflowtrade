import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, ArrowRight, ExternalLink, RefreshCw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface NewsItem {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  timestamp: string;
  readTime: string;
  trend: string;
  image: string;
  url?: string;
  source?: string;
}

const NewsPage = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const getCategoryColor = (category: string) => {
    const colors = {
      "Market Analysis": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "Technology": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Regulation": "bg-orange-500/10 text-orange-400 border-orange-500/20",
      "DeFi": "bg-green-500/10 text-green-400 border-green-500/20",
      "Platform": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "News": "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[category as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "bullish") return <TrendingUp className="h-3 w-3 text-success" />;
    return <div className="h-3 w-3 rounded-full bg-muted-foreground/50" />;
  };

  const fetchNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('Fetching crypto news...');
      const { data, error } = await supabase.functions.invoke('crypto-news');

      if (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Error",
          description: "Failed to fetch latest news. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.data) {
        setNewsItems(data.data);
        if (isRefresh) {
          toast({
            title: "Success",
            description: "News updated successfully!",
          });
        }
      } else {
        console.error('Invalid news data received:', data);
        toast({
          title: "Warning",
          description: "No news data received from the API.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchNews:', error);
      toast({
        title: "Error",
        description: "Failed to connect to news service.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleNewsClick = (url?: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <Skeleton className="h-12 w-80 mb-4" />
                <Skeleton className="h-6 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="glass-card border-border/50">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-3" />
                    <Skeleton className="h-6 w-full mb-3" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Back to Home Button */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <main className="py-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 animate-fade-in">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Latest 
                <span className="text-gradient"> Crypto News</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Stay informed with the latest developments in cryptocurrency markets, technology, and regulations.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="glass-card border-primary/30 hover:bg-primary/10 mt-4 lg:mt-0"
              onClick={() => fetchNews(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh News
            </Button>
          </div>

          {newsItems.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-4">No news available</h3>
              <p className="text-muted-foreground mb-6">
                Unable to fetch news at the moment. Please try refreshing.
              </p>
              <Button onClick={() => fetchNews(true)} disabled={refreshing}>
                {refreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {newsItems[0] && (
                <div className="mb-12 animate-slide-up">
                  <Card className="glass-card border-border/50 overflow-hidden group hover:shadow-elevated transition-all duration-500 cursor-pointer">
                    <div className="lg:flex" onClick={() => handleNewsClick(newsItems[0].url)}>
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
                        <h2 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                          {newsItems[0].title}
                        </h2>
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
                            {newsItems[0].source && (
                              <span>• {newsItems[0].source}</span>
                            )}
                          </div>
                          <Button variant="ghost" className="group/btn hover:bg-primary/10">
                            Read More
                            <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems.slice(1).map((article, index) => (
                  <Card 
                    key={article.id}
                    className="glass-card border-border/50 overflow-hidden group hover:shadow-card transition-all duration-500 hover:-translate-y-1 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleNewsClick(article.url)}
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
                        <div className="flex items-center gap-2">
                          <span>{article.readTime}</span>
                          {article.source && (
                            <>
                              <span>•</span>
                              <span>{article.source}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

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
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;