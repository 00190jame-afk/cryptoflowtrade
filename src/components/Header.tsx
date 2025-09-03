import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      title: "Markets",
      href: "/markets",
      description: "Explore all available trading pairs"
    },
    {
      title: "Trading",
      items: [
        { title: "Spot Trading", href: "/spot", description: "Trade cryptocurrencies instantly" },
        { title: "Futures", href: "/futures", description: "Advanced trading with leverage" },
        { title: "Options", href: "/options", description: "Hedge your positions" }
      ]
    },
    {
      title: "Assets",
      href: "/assets",
      description: "Manage your portfolio"
    },
    {
      title: "Support",
      items: [
        { title: "Help Center", href: "/help", description: "Find answers to common questions" },
        { title: "Contact Us", href: "/contact", description: "Get in touch with our team" },
        { title: "API Docs", href: "/api", description: "Developer documentation" }
      ]
    },
    {
      title: "News",
      href: "/news",
      description: "Latest cryptocurrency news"
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">CryptoFlow</span>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.items ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[300px] gap-3 p-4">
                        {item.items.map((subItem) => (
                          <NavigationMenuLink
                            key={subItem.title}
                            href={subItem.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted/50 focus:bg-muted/50"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{subItem.title}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {subItem.description}
                            </p>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={item.href}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                  >
                    {item.title}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Button variant="ghost" className="hover:bg-muted/50">
            Login
          </Button>
          <Button className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300">
            Register
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] glass-card">
            <div className="flex flex-col space-y-4 mt-6">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  {item.items ? (
                    <div className="space-y-2">
                      <div className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                        {item.title}
                      </div>
                      {item.items.map((subItem) => (
                        <a
                          key={subItem.title}
                          href={subItem.href}
                          className="block py-2 text-sm hover:text-primary transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.title}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="block py-2 text-sm hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.title}
                    </a>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start hover:bg-muted/50">
                  Login
                </Button>
                <Button className="w-full gradient-primary shadow-primary">
                  Register
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;