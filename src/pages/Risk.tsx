import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Risk = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Risk
              <span className="text-gradient"> Disclosure</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Important risk information and warnings for using CryptoFlow services
            </p>
          </div>

          {/* Risk Disclosure Content */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <section className="prose prose-lg max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold mb-6">General Risk Warning</h2>
              <p className="text-sm text-muted-foreground mb-6">Last Update: 28 July 2025</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">A. How to interpret this Risk Warning</h3>
                  <p>All capitalised terms used in this Risk Warning that are defined in the CryptoFlow Terms of Use (the "Terms of Use", which includes any Product Terms (as defined in the Terms of Use)), have the same meaning and construction as in the Terms of Use.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">B. CryptoFlow Services</h3>
                  <p>In line with our commitments to compliance and user protection, this Risk Warning provides you with information about some of the key risks associated with CryptoFlow Services. Each CryptoFlow Service has its own distinct risks. This Risk Warning provides a general description of some of the risks that may arise when you use CryptoFlow Services.</p>
                  
                  <p>This Risk Warning does not explain all of the risks or how such risks relate to your personal circumstances. It is important that you fully understand the risks involved before making a decision to use CryptoFlow Services and you should also read the relevant terms applicable to the specific CryptoFlow Service. By using the CryptoFlow Services and entering into any Transactions, you agree that you assume all of the related risks.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">C. Regulatory or Legal Advice</h3>
                  <p>You have sole responsibility for determining what taxes you might be liable to, how and when they apply, and meeting such tax obligations, when transacting through the CryptoFlow Services. It is your responsibility to report and pay any taxes that may arise from entering into a Transaction by using the CryptoFlow Services, and you acknowledge that CryptoFlow does not provide legal or tax advice in relation to these transactions. If you have any doubts about your tax status or obligations when using CryptoFlow Services, or with respect to the Digital Assets held to the credit of your CryptoFlow account, you are encouraged to seek independent advice.</p>
                  
                  <p>You acknowledge that, when, where and as required by Applicable Law, CryptoFlow shall report information regarding your transactions, transfers, distributions or payments to tax or other public authorities. Similarly, when, where and as required by Applicable Law, CryptoFlow shall withhold taxes related to your transactions, transfers, distributions or payments. Applicable Laws could also prompt CryptoFlow to request that you provide additional tax information, status, certificates or documentation or other information. You acknowledge that failure to comply with these requests within the specified timeframe, may result in taxes withheld by CryptoFlow, to be remitted to tax authorities as defined by Applicable Law. You are encouraged to seek professional and personal tax advice regarding the above and before entering into any Transaction.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">D. Market Risks</h3>
                  <p>Digital assets are subject to high market risk and price volatility. Changes in value may be significant and may occur rapidly and without warning. Past performance is not a reliable indicator of future performance.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">E. Technology Risks</h3>
                  <p>Digital assets exist only by virtue of the ownership record maintained in the underlying blockchain network. Any transfer of title that might occur in any digital asset occurs on the decentralised ledger within the blockchain network, and not on any digital asset trading platform. We do not guarantee the functionality or security of any particular blockchain network.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">F. Liquidity Risk</h3>
                  <p>Digital assets may have limited liquidity and there may be difficulty in selling or realising digital assets. This could result in loss if you cannot close your position.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">G. Operational Risk</h3>
                  <p>Our trading systems and technology are complex and may experience operational failures, disruptions, or delays which could result in the inability to trade or access your account.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">H. Regulatory Risk</h3>
                  <p>The regulatory environment for digital assets continues to evolve. Changes in regulations or enforcement priorities may adversely affect the value, transferability or functionality of digital assets.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">I. Cybersecurity Risk</h3>
                  <p>Digital assets trading platforms and wallets are frequent targets of cyber attacks. While we implement security measures, we cannot guarantee absolute security of your digital assets or personal information.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">J. Loss of Private Keys</h3>
                  <p>If you lose access to your private keys or authentication credentials, you may permanently lose access to your digital assets. CryptoFlow cannot recover lost private keys or credentials.</p>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-3 text-destructive">Important Notice</h3>
                  <p className="text-sm">
                    <strong>You should not invest more than you can afford to lose and you should ensure that you fully understand the risks involved. Trading and investment in digital assets may not be suitable for all users and may result in significant losses. You are strongly advised to seek independent advice before engaging in any trading or investment activity.</strong>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Risk;