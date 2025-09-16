import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const CookiePolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">

          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center border-b border-border/50">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                CryptoFlow Cookie Policy
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                How CryptoFlow uses cookies and other similar technology on this website.
              </p>
              <p className="text-sm text-muted-foreground">
                This policy is effective as of January 24, 2025. Please note that this privacy statement will be updated from time to time.
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              <section>
                <p className="text-muted-foreground mb-6">
                  We can place cookies and other similar technology on your device, including mobile device, in accordance with your preferences set on our cookie setting center. Depending on your settings in our cookie consent manager on your mobile device, the following information may be collected through cookies or similar technology: your unique device identifier, mobile device IP address, information about your device's operating system, mobile carrier and your location information (to the extent permissible under applicable law).
                </p>
                <p className="text-muted-foreground mb-6">
                  Every time you visit CryptoFlow website, you will be prompted to accept or reject cookies, you can also tailor your selection.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">What are cookies?</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files that are placed into user's device when you visit a website, downloaded to your computer or mobile device when you visit a site and allow a site to recognize your device. Cookies stores information about the user's visit, which may include content viewed, language preference, time and duration of each visit and advertisement accessed. Cookies managed by CryptoFlow only are called "first party cookies" whereas cookies from third parties are called "third party cookies".
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Why do we use cookies and similar technologies?</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies are a useful mechanism that do a lot of different jobs, such as letting you navigate between pages efficiently, remembering your preferences and generally improving the user experience. They can help to ensure that the advertisements you see online are more relevant to you and your interests and enable us to identify your preferences. There are different set of cookies, and we will explain that later in this document.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Does CryptoFlow use cookies for marketing and analytics?</h2>
                <p className="text-muted-foreground mb-4">
                  Yes, we may use information collected from our cookies to identify user behaviour and to serve content and offers based on your profile, and for the other purposes described below, to the extent legally permissible in certain jurisdictions.
                </p>
                <p className="text-muted-foreground mb-4">
                  In other cases, we can associate cookie information (including information from cookies placed via our advertisements on third party sites) with an identifiable individual.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Do you use any cookies from third party companies?</h2>
                <p className="text-muted-foreground mb-4">
                  Some cookies, web beacons and other tracking and storage technologies that we use are from third party companies (third party cookies) to provide us with web analytics and intelligence about our sites which may also be used to provide measurement services and target ads.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">What if I don't want cookies or similar tracking technologies?</h2>
                <p className="text-muted-foreground mb-4">
                  You can adjust your preferences about cookies through our cookie setting center. If you want to remove existing cookies from your device, you can do this using your browser options.
                </p>
                <p className="text-muted-foreground mb-4">
                  If you want to block future cookies being placed on your device, you can do so by modifying the settings at our cookie setting center. Nevertheless, please consider that deleting and blocking cookies may have an impact on your user experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">What types of cookies does the site use?</h2>
                <p className="text-muted-foreground mb-6">
                  The cookies used on CryptoFlow sites have been categorized as per the table below. However, it is important to note that not all cookies may be used in all jurisdictions or websites. A list of the categories of cookies used on this website is set out below.
                </p>
                
                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Strictly Necessary cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will not when work. These cookies do not store any personally identifiable information.
                    </p>
                  </div>

                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Performance cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site and will not be able to monitor its performance.
                    </p>
                  </div>

                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Functionality cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by a third-party provider whose services we have added to our pages. If you don't allow these cookies some services may not function properly.
                    </p>
                  </div>

                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Targeting cookies</h3>
                    <p className="text-muted-foreground">
                      Targeting cookies may be set through our site by our advertising partners. They can be used by these third parties to build a profile of your interests based on the browsing information they collect from you, which includes uniquely identifying your browser and terminal equipment. If you do not allow these cookies you will still see basic advertising on your browser that is generic and not based on your interests.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookie Retention</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies used on the CryptoFlow websites may be retained on your device for up to 1 year from the date they are set or renewed. For detailed information about the exact retention period for each cookie, please visit our Cookie Preference Center. This will allow you to adjust your settings and preferences for essential, functional, analytical and marketing cookies.
                </p>
              </section>

              <div className="pt-8 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/contact")}
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;