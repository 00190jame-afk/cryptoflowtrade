import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown, TrendingUp, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleNavClick = (item: any, subItem?: any) => {
    const target = subItem || item;

    // Redirect to login for Trading and Assets if user is not logged in
    const isProtected = item.key === 'trading' || item.key === 'assets';
    if (!user && isProtected) {
      navigate("/login");
      return;
    }

    // For other items, navigate normally
    if (target.href) {
      // If we're already on the target page, scroll to top
      if (location.pathname === target.href) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(target.href);
      }
    }
  };

  const handleLogoClick = () => {
    // If we're already on home page, scroll to top
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate("/");
    }
  };

  const navigationItems = [
    {
      key: 'home',
      title: t('nav.home'),
      href: '/',
      description: 'Go back to homepage'
    },
    {
      key: 'markets',
      title: t('nav.markets'),
      href: '/markets',
      description: 'Explore all available trading pairs'
    },
    {
      key: 'trading',
      title: t('nav.futures'),
      items: [
        { key: 'futures', title: t('nav.futures'), href: '/futures', description: 'Advanced trading with leverage' }
      ]
    },
    {
      key: 'assets',
      title: t('nav.assets'),
      href: '/assets',
      description: 'Manage your portfolio'
    },
    {
      key: 'support',
      title: 'Support',
      items: [
        { key: 'help', title: 'Help Center', href: '/help', description: 'Find answers to common questions' },
        { key: 'contact', title: 'Contact Us', href: '/contact', description: 'Get in touch with our team' },
        { key: 'api', title: 'API Docs', href: '/api', description: 'Developer documentation' }
      ]
    },
    {
      key: 'news',
      title: t('nav.news'),
      href: '/news',
      description: 'Latest cryptocurrency news'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">CryptoFlow</span>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.key || item.title}>
                {item.items ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[300px] gap-3 p-4">
                        {item.items.map((subItem) => (
                          <div
                            key={subItem.key || subItem.title}
                            onClick={() => handleNavClick(item, subItem)}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted/50 focus:bg-muted/50 cursor-pointer"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{subItem.title}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {subItem.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <div
                    onClick={() => handleNavClick(item)}
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none cursor-pointer"
                  >
                    {item.title}
                  </div>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-muted/50">
                  <User className="h-4 w-4" />
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" className="hover:bg-muted/50" onClick={() => navigate("/login")}>
                {t('nav.login')}
              </Button>
              <Button className="gradient-primary shadow-primary hover:shadow-elevated transition-all duration-300" onClick={() => navigate("/register")}>
                {t('nav.register')}
              </Button>
            </>
          )}
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
                <div key={item.key || item.title}>
                  {item.items ? (
                    <div className="space-y-2">
                      <div className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                        {item.title}
                      </div>
                      {item.items.map((subItem) => (
                        <div
                          key={subItem.key || subItem.title}
                          className="block py-2 text-sm hover:text-primary transition-colors cursor-pointer"
                          onClick={() => {
                            handleNavClick(item, subItem);
                            setIsOpen(false);
                          }}
                        >
                          {subItem.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="block py-2 text-sm hover:text-primary transition-colors cursor-pointer"
                      onClick={() => {
                        handleNavClick(item);
                        setIsOpen(false);
                      }}
                    >
                      {item.title}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-muted/50"
                      onClick={() => {
                        navigate("/profile");
                        setIsOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('nav.profile')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:bg-muted/50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
            <>
              <Button variant="ghost" className="w-full justify-start hover:bg-muted/50" onClick={() => navigate("/login")}> 
                {t('nav.login')}
              </Button>
              <Button className="w-full gradient-primary shadow-primary" onClick={() => navigate("/register")}> 
                {t('nav.register')}
              </Button>
            </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;