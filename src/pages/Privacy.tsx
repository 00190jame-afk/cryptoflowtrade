import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center border-b border-border">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/favicon.png" alt="CryptoFlow" className="w-8 h-8" />
              <CardTitle className="text-3xl font-bold">CryptoFlow Privacy Policy</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Last updated: December 2024
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Privacy Terms</h2>
                </div>
                <p className="text-foreground leading-relaxed">
                  CryptoFlow understands the importance of users' personal information, complies with relevant laws and regulations such as the "Personal Information Protection Law", and always respects and protects the security of users' personal information. We will collect, store, maintain and use your personal information so that we can provide better access to utility programs or services. Therefore, CryptoFlow discloses how we use and store your personal information to ensure security through our privacy terms.
                </p>
              </section>

              {/* Section 1 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. What information do you need to provide</h2>
                <p className="text-foreground leading-relaxed">
                  It is regarded that you agree to us to collect your personal information upon your registration, trade or use of our services, that is, we have obtained your permission. CryptoFlow will not use fraudulent or improper means to collect your personal information apart from it, and will not ask you to provide relevant information beyond the scope of terms. The main purpose to collect your personal information is to facilitate communication with you and provide better services. The personal information collected may include: name, contact information, email address, country and region information, social media account, transaction information, the copy of your identification information, ID number issued by government, passport number, any information related to your device or internet service (such as IP address and MAC number), and in case of special services may require you to provide a bank account and other related information.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Why do I need your personal information</h2>
                <p className="text-foreground leading-relaxed mb-3">Your personal information will be used to:</p>
                <div className="space-y-2 text-foreground">
                  <p><strong>2.1</strong> Collect in the CryptoFlow transaction process, and we will process the personal information you provide to us;</p>
                  <p><strong>2.2</strong> Verify and confirm the real information to avoid fraudulent behavior of relevant users;</p>
                  <p><strong>2.3</strong> Verify as legitimate citizen since we have adopted international standards to prevent money laundering and other improper activities;</p>
                  <p><strong>2.4</strong> Inform you of the revision to relevant terms and policies;</p>
                  <p><strong>2.5</strong> Communicate timely in case of emergency;</p>
                  <p><strong>2.6</strong> Follow the requirements of relevant departments and institutions in national government;</p>
                  <p><strong>2.7</strong> Support customized service for user;</p>
                  <p><strong>2.8</strong> Facilitate communication with CryptoFlow to instantly enjoy relevant services and win prizes during the event;</p>
                  <p><strong>2.9</strong> Meet the requirement of relevant laws and regulations;</p>
                  <p><strong>2.10</strong> Analyze the operation of CryptoFlow to provide better function and product.</p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. How does CryptoFlow protect your personal information</h2>
                <div className="space-y-4 text-foreground leading-relaxed">
                  <p>
                    CryptoFlow will not use your personal information for other purposes, sell or disclose information to any third party (except third-party security partners related to service) without your permission; CryptoFlow will decentralize your personal information to ensure your information is safely stored in case of the risk of loss, damage, tampering or leakage, etc.; CryptoFlow encrypts, stores and manages your information with SSL technology, and only you can use and modify it, unauthorized person will be restricted from accessing your information; in addition, the internal autonomy of CryptoFlow team will protect the security of your personal information from leakage, tampering, etc. to the greatest extent.
                  </p>
                  <p>
                    However, this does not apply to our affiliates or trusted third-party service providers who assist us in operating our websites, supporting our business functions, or delivering services to users. These parties may access limited information solely to the extent necessary and are subject to strict confidentiality obligations.
                  </p>
                  <p>
                    User information may also be shared, where necessary, with our employees, advisors, or other authorized personnel for internal operations, or disclosed in response to lawful requests by courts, regulators, or law enforcement agencies. In the event of a corporate transaction such as a merger, restructuring, or asset transfer, relevant data may also be shared with appropriate safeguards.
                  </p>
                  <p>
                    Any such information will not be used for advertising, promotional, or other unrelated commercial purposes without explicit consent from all relevant parties.
                  </p>
                  <p>
                    For example, we may integrate the AppsFlyer SDK into our platform to help us understand how users find and interact with the platform, measure advertising effectiveness, and detect potential fraud in real time. Any information shared with AppsFlyer is handled in accordance with AppsFlyer's Privacy Policy.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. How do I set my personal information</h2>
                <p className="text-foreground leading-relaxed">
                  You can login CryptoFlow to view, add, modify and delete personal information at any time. It may be necessary to contact us by email to change information in special condition. If you do not agree to Privacy Policy, the related services provided by CryptoFlow may be terminated.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Declaration</h2>
                <p className="text-foreground leading-relaxed mb-3">
                  You must read and understand the terms of Privacy Policy in detail to ensure that you have full confidence in our dealing with personal data. Once you login our website, in particular, whether you are registered on the website or not, is indicated that you accept, agree, undertake and confirm:
                </p>
                <div className="space-y-2 text-foreground">
                  <p><strong>5.1</strong> You voluntarily consent to disclose personal data to us;</p>
                  <p><strong>5.2</strong> If we are unable to send information in time, log in or enjoy service due to the wrong information you disclosed to us, we do not assume economic or legal responsibility. You can correct the wrong information in time when you discover the wrong information;</p>
                  <p><strong>5.3</strong> You comply with all terms and restrictions of this Privacy Policy;</p>
                  <p><strong>5.4</strong> You agree that we collect your information when your login this website, register this website and/or use the services we provide; you agree to any future revisions to our Privacy Policy by us.</p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Privacy issues and questions</h2>
                <p className="text-foreground leading-relaxed">
                  Your ID and password are kept by yourself. Please keep your password safe at all times and do not disclose to others. If you find your password is leaked, information is abnormal, or have any questions or suggestions about CryptoFlow privacy terms, please contact customer service as soon as possible.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Translation</h2>
                <p className="text-foreground leading-relaxed">
                  This Privacy Terms is drafted in the English language, which shall serve as the official version of this Privacy Terms. In the event this Privacy Terms is translated into any other language, such translated version may be utilized for information purposes only. In the event of any inconsistency, the English language version is the original version and will prevail in case of any inconsistency over any translated version, and in the interpretation required of the Privacy Terms.
                </p>
              </section>

              {/* Contact Section */}
              <section className="border-t border-border pt-6">
                <div className="text-center">
                  <Button asChild>
                    <Link to="/contact">Contact Support</Link>
                  </Button>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;