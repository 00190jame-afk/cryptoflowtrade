import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-4">5. Risk Disclosure</h2>
                  
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-destructive mb-4">General Risk Warning</h3>
                    <p className="text-sm text-muted-foreground mb-2">Last Update: 28 July 2025</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">A. How to interpret this Risk Warning</h3>
                      <p className="text-foreground leading-relaxed">
                        All capitalised terms used in this Risk Warning that are defined in the CryptoFlow Terms of Use (the "Terms of Use", which includes any Product Terms (as defined in the Terms of Use)), have the same meaning and construction as in the Terms of Use.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">B. CryptoFlow Services</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        In line with our commitments to compliance and user protection, this Risk Warning provides you with information about some of the key risks associated with CryptoFlow Services. Each CryptoFlow Service has its own distinct risks. This Risk Warning provides a general description of some of the risks that may arise when you use CryptoFlow Services.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        This Risk Warning does not explain all of the risks or how such risks relate to your personal circumstances. It is important that you fully understand the risks involved before making a decision to use CryptoFlow Services and you should also read the relevant terms applicable to the specific CryptoFlow Service. By using the CryptoFlow Services and entering into any Transactions, you agree that you assume all of the related risks.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">C. Regulatory or Legal Advice</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        You have sole responsibility for determining what taxes you might be liable to, how and when they apply, and meeting such tax obligations, when transacting through the CryptoFlow Services. It is your responsibility to report and pay any taxes that may arise from entering into a Transaction by using the CryptoFlow Services, and you acknowledge that CryptoFlow does not provide legal or tax advice in relation to these transactions. If you have any doubts about your tax status or obligations when using CryptoFlow Services, or with respect to the Digital Assets held to the credit of your CryptoFlow account, you are encouraged to seek independent advice.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        You acknowledge that, when, where and as required by Applicable Law, CryptoFlow shall report information regarding your transactions, transfers, distributions or payments to tax or other public authorities. Similarly, when, where and as required by Applicable Law, CryptoFlow shall withhold taxes related to your transactions, transfers, distributions or payments. Applicable Laws could also prompt CryptoFlow to request that you provide additional tax information, status, certificates or documentation or other information. You acknowledge that failure to comply with these requests within the specified timeframe, may result in taxes withheld by CryptoFlow, to be remitted to tax authorities as defined by Applicable Law. You are encouraged to seek professional and personal tax advice regarding the above and before entering into any Transaction.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">D. Market Risks</h3>
                      <div className="space-y-4">
                        <p className="text-foreground leading-relaxed">
                          An investment in Digital Assets carries significant risk. The value of an investment and any returns can go up or down, and you may lose all or part of your investment and not get back the amount you had invested. If you are new to Digital Assets, consider investing only a small amount. Only invest what you can afford to lose. It is important to do your own research to understand the risks of investing in Digital Assets.
                        </p>
                        <p className="text-foreground leading-relaxed">
                          Digital Asset trading is speculative, prices are volatile and market movements are difficult to predict. Supply and demand for Digital Assets can change rapidly without warning and can be affected by a variety of factors which may not be predictable, including regulation, general economic trends and developments in the Digital Asset ecosystem. All investments in Digital Assets carry the risk of loss.
                        </p>
                        <p className="text-foreground leading-relaxed">
                          Past performance is not an indicator of future performance. CryptoFlow does not in any way guarantee or provide any assurance about the performance or market price of Digital Assets or products available through the CryptoFlow Services.
                        </p>
                        <p className="text-foreground leading-relaxed">
                          The Digital Asset industry is subject to systemic and systematic risk:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>Systemic risk is the risk that a company or industry-level risk could trigger a major collapse.</li>
                          <li>Systematic risk is the risk inherent to the entire market, which can be economic, sociopolitical, technological, or natural in origin.</li>
                        </ul>
                        <p className="text-foreground leading-relaxed mt-4">
                          These risks can affect the prices of Digital Assets. Blockchain technology is a relatively new technology that is evolving rapidly and is likely to be subject to continued technological development. The future development and growth of the Digital Asset industry is subject to a variety of factors that are difficult to predict and evaluate.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">E. Counterparty Risk</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        You may be exposed to counterparty risk in various circumstances when using CryptoFlow Services. This may include, without limitation, if a market maker or liquidity provider faces issues which could result in slippage or an inability to execute trades; failures by or disputes with payment processors which may delay deposit and withdrawal transactions; borrowers defaulting on their repayment obligations which may delay the redemption of deposits from certain products.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        In such other exceptional circumstances, your holdings and your ability to transact or deal with your holdings, may be adversely affected which may result in a range of outcomes including, without limitation, transactions not completing as expected, trading costs being irrecoverable, loss of profits, inability to acquire or dispose of assets at the desired time or price.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">F. Liquidity Risk</h3>
                      <p className="text-foreground leading-relaxed">
                        Digital Asset prices on the secondary market are driven by supply and demand and may be highly volatile. Digital Assets may have limited liquidity which may make it difficult or impossible for you to sell or exit a position when you wish to do so. This may occur at any time, including at times of rapid price movements.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">G. Availability Risk</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        While we aim to deliver a seamless user experience, we cannot guarantee that the CryptoFlow Services will be available at any particular time or that CryptoFlow Services will not be subject to unplanned service outages or network congestion. It may not be possible for you to buy, sell, transfer, send or receive Digital Assets when you wish to do so.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        There are legal requirements in various countries which may restrict the products and services that CryptoFlow can lawfully provide. Some products and services may not be available or may be restricted in certain jurisdictions. Users are responsible for informing themselves about any restrictions that may apply in their jurisdiction.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">H. Security Risk</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        The nature of Digital Assets exposes them to an increased risk of cyberattack. While CryptoFlow uses all reasonable efforts to safeguard Digital Assets and protect the Platform from cyberattack, it is not possible for any exchange to eliminate security risks entirely. There can be no guarantee that systems in place to mitigate cybersecurity threats will always be effective.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        You are responsible for keeping your CryptoFlow Account information safe, and you shall be responsible for all the Transactions under your CryptoFlow Account, whether you authorised them or not. Transactions in Digital Assets may be irreversible, and losses due to fraudulent or unauthorised transactions may not be recoverable.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">I. Risks related to Digital Assets</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        Given the nature of Digital Assets and their underlying technologies, there are a number of intrinsic risks, including but not limited to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4 text-foreground">
                        <li>Faults, defects, hacks, exploits, errors, protocol failures or unforeseen circumstances occurring in respect of a Digital Asset</li>
                        <li>Transactions in Digital Assets being irreversible. Consequently, losses due to fraudulent or accidental transactions may not be recoverable</li>
                        <li>Technological developments leading to the obsolescence of a Digital Asset</li>
                        <li>Network delays causing transactions to not be settled on the scheduled delivery date</li>
                        <li>Attacks on the protocol or technologies on which a Digital Asset depends</li>
                        <li>Hard forks may occur if Digital Asset developers suggest incompatible changes to software</li>
                        <li>Certain addresses on blockchain networks hold significant amounts of outstanding assets</li>
                        <li>51% attacks where someone gains control of over 51% of computing power could enable double spending</li>
                        <li>Digital Assets are subject to the risk of fraud or cyber attacks</li>
                        <li>Digital Assets are not covered by external investor compensation or insurance schemes</li>
                        <li>New risks may arise from investing in new types of Digital Assets or complex transaction strategies</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">J. Monitoring Risks</h3>
                      <p className="text-foreground leading-relaxed">
                        Digital Asset markets are open 24 hours a day, 7 days a week. Rapid price changes may occur at any time, including outside of normal business hours.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">K. Communication Risks</h3>
                      <p className="text-foreground leading-relaxed">
                        When you communicate with us via electronic communication, you should be aware that electronic communications can fail, can be delayed, may not be secure and/or may not reach the intended destination.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">L. Currency</h3>
                      <p className="text-foreground leading-relaxed">
                        Currency exchange fluctuations may impact your gains and losses.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">M. Legal and Regulatory Risks</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        Most Digital Assets operate without a central authority and are generally not backed by any government or authority. Changes in laws and regulations may materially affect the value of Digital Assets. This risk is unpredictable and may vary from market to market.
                      </p>
                      <p className="text-foreground leading-relaxed mb-4">
                        Further, Digital Assets may not be considered "property" under Applicable Laws in some jurisdictions. This may affect the nature and enforceability of your interest in the Digital Assets.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        Legislative and regulatory changes may adversely affect or restrict the use, transfer, exchange and value of Digital Assets, as well as the provision of the CryptoFlow Services in certain jurisdictions. Legislative and regulatory changes may occur quickly and without prior notice.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">N. Risk of trading using leverage</h3>
                      <p className="text-foreground leading-relaxed mb-4">
                        Trading using leverage entails significant risk and it is important that you fully understand the risks involved in trading Digital Assets using leverage.
                      </p>
                      <p className="text-foreground leading-relaxed">
                        A relatively small market movement will have a proportionately larger impact on the leveraged funds you have deposited or will have to deposit; this may work against you as well as for you. You may sustain a total loss of initial margin funds and, in exceptional circumstances, any additional funds deposited with CryptoFlow to maintain your position. If the market moves against your position or margin levels are increased, you may be called upon to pay substantial additional funds on short notice to maintain your position.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-3">O. Risk of trading Futures</h3>
                      <div className="space-y-4">
                        <p className="text-foreground leading-relaxed">
                          Futures are complex leveraged products and may not be suitable for inexperienced investors. Before investing, investors must understand the nature and accept the risks of futures products, including extreme price volatility of Digital Asset Futures and the risk that the value of a Digital Asset Futures position may decline rapidly and significantly, including to zero.
                        </p>
                        <p className="text-foreground leading-relaxed">
                          The risk of loss is substantial. In volatile market conditions, the price of Digital Assets, and therefore the price of Digital Asset Futures, may decline significantly in a short period of time, including to zero. An investor in Digital Asset Futures must be prepared and able to bear the loss of the entirety of their investment.
                        </p>
                        <p className="text-foreground leading-relaxed">
                          When trading Futures, it is your responsibility:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-foreground">
                          <li>To familiarise yourself with Digital Assets and Futures before you start trading</li>
                          <li>To monitor your open positions and, when required, to reduce your position or deposit additional margin to avoid liquidation</li>
                          <li>Manage your exposure and not risk more than you can afford to lose</li>
                        </ul>
                        <p className="text-foreground leading-relaxed mt-4">
                          When trading Futures you may suffer losses due to various factors including position movements against you, force closures under auto-deleveraging, insufficient market liquidity, platform parameter changes, or system malfunctions.
                        </p>
                        <p className="text-foreground leading-relaxed">
                          The market price of a Futures contract may not mirror the spot market price and may fluctuate significantly in response to various market factors. Leverage allows traders to provide relatively small margin for positions with significantly more market exposure, but this means small price changes can result in liquidation and loss of assets.
                        </p>
                      </div>
                    </div>
                  </div>
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