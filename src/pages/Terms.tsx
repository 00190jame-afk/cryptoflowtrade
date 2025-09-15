import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center border-b">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/favicon.png" 
                  alt="CryptoFlow" 
                  className="w-12 h-12 mr-3"
                />
                <div>
                  <h1 className="text-2xl font-bold">Terms of Service</h1>
                  <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
                    <span className="text-primary font-medium">CryptoFlow</span>
                    <span className="mx-2">•</span>
                    <span>Updated</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="prose prose-slate max-w-none p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  CryptoFlow is a cryptocurrency and digital asset exchange platform of towards future. Its operating website is (referred as "this website" or "website" hereinafter). This website is a platform which enables users to have digital asset trades and offers related services (referred as "the service(s)" or "service(s)" hereinafter). For the convenience of expression herein the company and the website together will be referred as "we" or other first person expressions in these Terms of Use (Terms). All natural persons and other entities who log in the website are users of the website. For the convenience of expression herein users will be referred as "you" or other second person expressions in the Terms. For the convenience of expression herein we and you together will be referred as "both parties" with you or us as "one party".
                </p>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-destructive mb-4">Important:</h2>
                <p className="text-foreground mb-4">We especially remind you:</p>
                <ol className="list-decimal list-inside space-y-3 text-foreground">
                  <li>Digital assets are not endorsed by any financial institution or government. The digital asset market is brand new, with no clear and stable expectations.</li>
                  <li>Digital asset trading is highly risky. The trading is continuous throughout the day without limits on rise and fall and the prices are in large fluctuation.</li>
                  <li>Due to the formulation or modification of national laws, regulations and regulatory documents, digital asset transactions may be suspended or prohibited at any time.</li>
                  <li>XT smartchain does not support illegal gambling applications.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <p className="text-foreground leading-relaxed">
                  Digital asset trading has extremely high risks and is not suitable for most people. You understand that this investment may cause some or all of the losses, so you should decide the amount of investment with the degree of loss you can afford. Please confirm that you understand and understand that digital assets generate derivative risks. In addition to the risks mentioned above, there are also unpredictable risks. Before making any decision to buy or sell digital assets, you should carefully consider and use your clear judgment to evaluate your financial situation and the risks mentioned above, and bear all losses arising therefrom. We are not responsible for this.
                </p>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">1. General Principles</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">1.1</h3>
                      <p className="text-foreground leading-relaxed">
                        You should read this agreement carefully before using the services provided by this website. If you do not understand or otherwise need to consult a professional lawyer. If you do not agree with this agreement and / or modify it at any time, please immediately stop using the services provided by this website or no longer log in to this website. Once you log in to this website, use any services on this website, or any other similar behavior, it means that you have understood and fully agree with the contents of this agreement, including any modifications made by this website to this agreement at any time.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">1.2</h3>
                      <p className="text-foreground leading-relaxed">
                        After you become a member of this website, you will get a member account and corresponding password. The member account and password are kept by the member; the member shall be legally responsible for all activities and events performed under his account.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">1.3</h3>
                      <p className="text-foreground leading-relaxed mb-3">
                        You can become a member of this website by filling in the relevant information in accordance with the requirements of this website and going through other relevant procedures (hereinafter referred to as 'members'). Clicking the 'Agree' button during the registration process indicates that you are in the form of electronic signature entering into an agreement with the company; or when you click any button marked 'Agree' or similar meaning during the use of this website or actually use the services provided by this website in other ways permitted by this website, you fully understand, agree and accept all the terms and conditions under this agreement without your handwritten written signature will have no effect on your legal binding force.
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>1.3.1 Subject to all terms and conditions of this agreement.</li>
                        <li>1.3.2 You confirm that you have reached the legal age to enter into a contract and are fully capable of accepting these terms under different applicable laws.</li>
                        <li>1.3.3 You guarantee that the digital assets belonging to you in the transaction are legally acquired and owned.</li>
                        <li>1.3.4 You agree that you assume full responsibility and any gains or losses for your own trading or non-trading activities.</li>
                        <li>1.3.5 You confirm that the information provided during registration is true and accurate.</li>
                        <li>1.3.6 You agree to comply with any relevant legal requirements including, for tax purposes, the reporting of any transaction profits.</li>
                        <li>1.3.7 This agreement only restricts the rights and obligations between you and us and does not involve legal relationships and legal disputes between users of this website and other websites and you due to digital asset transactions.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">2. Amendment of Agreement</h2>
                  <p className="text-foreground leading-relaxed">
                    We reserve the right to amend this agreement from time to time, make announcements on the website, and no longer notify you separately. The changed agreement will be marked on the first page of this agreement with the time of change. It will be effective immediately upon publication on the website. From time to time, you should browse and pay attention to the time and content of the updates and changes to this agreement. If you do not agree with the relevant changes, you should immediately stop using this website service; by continuing to use this website service, you accept and agree to be bound by the revised agreement.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">3. Registration</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">3.1 Qualifications of Registration</h3>
                      <p className="text-foreground leading-relaxed">
                        You acknowledge and promise that when you complete the registration process or actually use the services provided by this website in other ways permitted by this website, you should have the ability to sign this agreement and use this website services as required by applicable laws. Natural person, legal person or other organization. Once you click the Agree Registration button, it means that you or your authorized agent have agreed to the content of the agreement, and their agents will register and use the services of this website. If you do not have the aforementioned subject qualifications, you and your authorized agent shall bear all the consequences caused by it. The company reserves the right to cancel or permanently freeze your account and hold you and your authorized agent accountable.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">3.2 Objectives of Registration</h3>
                      <p className="text-foreground leading-relaxed">
                        You confirm and promise that your registration on this website is not for the purpose of violating laws and regulations or disrupting the order of digital asset transactions on this website.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">3.3 Registration Process</h3>
                      <div className="space-y-3">
                        <p><strong>3.3.1</strong> You agree to provide a valid email address, mobile phone number, and other information according to the requirements of the user registration page of this website. You can use the email address, mobile phone number, or other methods permitted by this website to log in to this website. If necessary, in accordance with the relevant laws and regulations of different jurisdictions, you must provide your real name, identity documents and other relevant laws and regulations, as well as the relevant provisions of the privacy provisions and anti-money laundering provisions, and continuously update the registration information in accordance with timely, detailed and accurate requirements. All originally entered information will be cited as registration information. You shall be responsible for the authenticity, completeness and accuracy of such information and bear any direct or indirect losses and adverse consequences arising therefrom.</p>
                        <p><strong>3.3.2</strong> If the laws, regulations, rules, orders, etc. of your sovereign country or region have a real name for the mobile phone number, you are required to agree to provide the registered mobile phone number that is registered under the real name. Otherwise both direct and indirect losses and adverse consequences shall be borne by you.</p>
                        <p><strong>3.3.3</strong> You have provided the information required for registration legally, completely and effectively and verified. You have the right to obtain the account and password of this website. When you obtain the account and password of this website, you are deemed to have registered successfully.</p>
                        <p><strong>3.3.4</strong> Users located in [United States, Canada, Mainland China, Cuba, North Korea, Singapore, Sudan, Syria, Venezuela, Crimea] are prohibited from using the services provided by XT.COM. XT.COM owns the right to terminate or ban users' accounts at any time if users break the rule.Users should warrant that if you are or become a resident of any one or more of the above restricted countries, or you know that any other user is or becomes a resident of any one or more of the above restricted countries, you will immediately notify XT.COM. You understand and agree that if XT.COM finds out that you have concealed or misrepresented your  region, nationality, or residence in any form during the process of using our services, we have the right to take any appropriate measures to ensure that XT.COM complies with related laws and regulations, including terminating any account and closing any position in your account. In addition, the above list of countries or regions will change as the policies of different countries and regions change. We will not notify you specifically so please stay tuned for the update of this agreement.</p>
                        <p><strong>3.3.5</strong> You agree to receive emails and / or short messages related to the management and operation of this website.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">4. Services</h2>
                  <p className="text-foreground leading-relaxed mb-4">
                    This website only provides online trading platform services for your digital asset trading activities (including but not limited to digital asset trading services) through this website. This website does not itself act as a buyer or seller in buying and selling digital assets.
                  </p>
                  <p className="text-foreground leading-relaxed">
                    The Buy Crypto service provided by this website through third-party payments is supported by PEPPER INTERNET TECHNOLOGY PTE. LTD.
                  </p>
                </section>

                {/* Continue with remaining sections... */}
                <div className="text-center pt-8 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    For questions about these Terms of Service, please contact our support team.
                  </p>
                  <Link to="/contact">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;