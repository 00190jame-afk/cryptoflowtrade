import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
const Risk = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Back to Home Button - positioned at top like other pages */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
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
          <div className="space-y-8 animate-slide-up" style={{
            animationDelay: '0.2s'
          }}>
            <section className="prose prose-lg max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold mb-6">General Risk Warning</h2>
              <p className="text-sm text-muted-foreground mb-6">Last Update: 28 July 2025</p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3">A. How to interpret this Risk Warning</h3>
                  <p className="mb-4">All capitalised terms used in this Risk Warning that are defined in the CryptoFlow Terms of Use (the "Terms of Use", which includes any Product Terms (as defined in the Terms of Use)), have the same meaning and construction as in the Terms of Use.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">B. CryptoFlow Services</h3>
                  <p className="mb-4">In line with our commitments to compliance and user protection, this Risk Warning provides you with information about some of the key risks associated with CryptoFlow Services. Each CryptoFlow Service has its own distinct risks. This Risk Warning provides a general description of some of the risks that may arise when you use CryptoFlow Services.</p>
                  
                  <p className="mb-4">This Risk Warning does not explain all of the risks or how such risks relate to your personal circumstances. It is important that you fully understand the risks involved before making a decision to use CryptoFlow Services and you should also read the relevant terms applicable to the specific CryptoFlow Service. By using the CryptoFlow Services and entering into any Transactions, you agree that you assume all of the related risks.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">C. Regulatory or Legal Advice</h3>
                  <p className="mb-4">You have sole responsibility for determining what taxes you might be liable to, how and when they apply, and meeting such tax obligations, when transacting through the CryptoFlow Services. It is your responsibility to report and pay any taxes that may arise from entering into a Transaction by using the CryptoFlow Services, and you acknowledge that CryptoFlow does not provide legal or tax advice in relation to these transactions. If you have any doubts about your tax status or obligations when using CryptoFlow Services, or with respect to the Digital Assets held to the credit of your CryptoFlow account, you are encouraged to seek independent advice.</p>
                  
                  <p className="mb-4">You acknowledge that, when, where and as required by Applicable Law, CryptoFlow shall report information regarding your transactions, transfers, distributions or payments to tax or other public authorities. Similarly, when, where and as required by Applicable Law, CryptoFlow shall withhold taxes related to your transactions, transfers, distributions or payments. Applicable Laws could also prompt CryptoFlow to request that you provide additional tax information, status, certificates or documentation or other information. You acknowledge that failure to comply with these requests within the specified timeframe, may result in taxes withheld by CryptoFlow, to be remitted to tax authorities as defined by Applicable Law. You are encouraged to seek professional and personal tax advice regarding the above and before entering into any Transaction.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">D. Market Risks</h3>
                  <p className="mb-4">An investment in Digital Assets carries significant risk. The value of an investment and any returns can go up or down, and you may lose all or part of your investment and not get back the amount you had invested. If you are new to Digital Assets, consider investing only a small amount. Only invest what you can afford to lose. It is important to do your own research to understand the risks of investing in Digital Assets.</p>
                  
                  <p className="mb-4">Digital Asset trading is speculative, prices are volatile and market movements are difficult to predict. Supply and demand for Digital Assets can change rapidly without warning and can be affected by a variety of factors which may not be predictable, including regulation, general economic trends and developments in the Digital Asset ecosystem. All investments in Digital Assets carry the risk of loss.</p>
                  
                  <p className="mb-4">Past performance is not an indicator of future performance. CryptoFlow does not in any way guarantee or provide any assurance about the performance or market price of Digital Assets or products available through the CryptoFlow Services.</p>
                  
                  <p className="mb-4">The Digital Asset industry is subject to systemic and systematic risk.</p>
                  
                  <ul className="list-disc pl-6 mb-4">
                    <li>Systemic risk is the risk that a company or industry-level risk could trigger a major collapse.</li>
                    <li>Systematic risk is the risk inherent to the entire market, which can be economic, sociopolitical, technological, or natural in origin.</li>
                  </ul>
                  
                  <p className="mb-4">These risks can affect the prices of Digital Assets.</p>
                  
                  <p className="mb-4">Blockchain technology is a relatively new technology that is evolving rapidly and is likely to be subject to continued technological development. The future development and growth of the Digital Asset industry is subject to a variety of factors that are difficult to predict and evaluate. Similarly, the sustainability of Digital Asset networks may also be affected by a range of different factors. All such factors may impact the value of a Digital Asset.</p>
                  
                  <p className="mb-4">Negative perceptions about Digital Assets may reduce the confidence of investors in the industry and result in greater volatility of the prices in Digital Assets, including possibly a significant depreciation in value. Any events that trigger negative publicity in respect of Digital Asset markets may therefore have an adverse impact on the value of any investment in Digital Assets.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">E. Counterparty Risk</h3>
                  <p className="mb-4">You may be exposed to counterparty risk in various circumstances when using CryptoFlow Services. This may include, without limitation, if a market maker or liquidity provider faces issues which could result in slippage or an inability to execute trades; failures by or disputes with payment processors which may delay deposit and withdrawal transactions; borrowers defaulting on their repayment obligations which may delay the redemption of deposits from certain products.</p>
                  
                  <p className="mb-4">In such other exceptional circumstances, your holdings and your ability to transact or deal with your holdings, may be adversely affected which may result in a range of outcomes including, without limitation, transactions not completing as expected, trading costs being irrecoverable, loss of profits, inability to acquire or dispose of assets at the desired time or price.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">F. Liquidity Risk</h3>
                  <p className="mb-4">Digital Asset prices on the secondary market are driven by supply and demand and may be highly volatile. Digital Assets may have limited liquidity which may make it difficult or impossible for you to sell or exit a position when you wish to do so. This may occur at any time, including at times of rapid price movements.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">G. Availability Risk</h3>
                  <p className="mb-4">While we aim to deliver a seamless user experience, we cannot guarantee that the CryptoFlow Services will be available at any particular time or that CryptoFlow Services will not be subject to unplanned service outages or network congestion. It may not be possible for you to buy, sell, transfer, send or receive Digital Assets when you wish to do so.</p>
                  
                  <p className="mb-4">There are legal requirements in various countries which may restrict the products and services that CryptoFlow can lawfully provide. Accordingly, some products and services and/or certain functionality within the Platform, including but not limited to fiat services, may not be available or may be restricted in certain jurisdictions or regions or to certain Users and any CryptoFlow campaigns, user competitions or other promotions will not be open to (and are not targeted at or intended for) Users to whom restrictions apply. Users are responsible for informing themselves about, and observing any restrictions and/or requirements imposed with respect to, the access to and use of the Platform and the CryptoFlow Services in each jurisdiction from which the Platform and the CryptoFlow Services are accessed by or on behalf of the User. CryptoFlow reserves the right to modify such restrictions or impose additional restrictions with respect to the access to and use of the Platform and/or the CryptoFlow Services from time to time in its sole discretion without notification.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">H. Security Risk</h3>
                  <p className="mb-4">The nature of Digital Assets exposes them to an increased risk of cyberattack. While CryptoFlow uses all reasonable efforts to safeguard Digital Assets and protect the Platform from cyberattack, it is not possible for any exchange to eliminate security risks entirely. There can be no guarantee that systems in place to mitigate cybersecurity threats will always be effective to prevent improper access to the Platform and Digital Assets.</p>
                  
                  <p className="mb-4">You are responsible for keeping your CryptoFlow Account information safe, and you shall be responsible for all the Transactions under your CryptoFlow Account, whether you authorised them or not. Transactions in Digital Assets may be irreversible, and losses due to fraudulent or unauthorised transactions may not be recoverable.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">I. Risks related to Digital Assets</h3>
                  <p className="mb-4">Given the nature of Digital Assets and their underlying technologies, there are a number of intrinsic risks, including but not limited to:</p>
                  
                  <ol className="list-[lower-alpha] pl-6 space-y-2">
                    <li>faults, defects, hacks, exploits, errors, protocol failures or unforeseen circumstances occurring in respect of a Digital Asset or the technologies or economic systems on which the Digital Asset rely;</li>
                    <li>transactions in Digital Assets being irreversible. Consequently, losses due to fraudulent or accidental transactions may not be recoverable;</li>
                    <li>technological developments leading to the obsolescence of a Digital Asset;</li>
                    <li>network delays causing transactions to not be settled on the scheduled delivery date;</li>
                    <li>attacks on the protocol or technologies on which a Digital Asset depends;</li>
                    <li>a hard fork may occur if Digital Asset developers suggest changes to a particular Digital Asset software and the updated software is not compatible with the original software and a sufficient number (but not necessarily a majority) of users and miners elect not to migrate to the updated software. This would result in two versions of Digital Asset networks running in parallel and a split of the blockchain underlying the Digital Asset network, which could impact the demand of the Digital Asset and adversely impact the price of the Digital Asset;</li>
                    <li>certain addresses on the blockchain networks hold a significant amount of the currently outstanding asset on that network. If one of these addresses were to exit their positions, this may result in volatility that could adversely affect the price of that asset;</li>
                    <li>if anyone gains control of over 51% of the computing power (hash rate) used by a blockchain network, they could use their majority share to double spend their Digital Assets. Whilst the risk of this occurring for networks with wider adoption is remote, if such a "51% attack" were to be successful, this would significantly erode trust in public blockchain networks (like Bitcoin and Ethereum) to store value and serve as a means of exchange, which may significantly decrease the value of Digital Assets;</li>
                    <li>Digital Assets are subject to the risk of fraud or cyber attacks;</li>
                    <li>Digital Assets purchased and held in an account with CryptoFlow are not covered by any external investor compensation, customer asset protection, deposit protection, insurance or other similar schemes; and</li>
                    <li>new risks may arise from investing in new types of Digital Assets or market participants&apos; engagement in more complex transaction strategies. Digital Assets and the Digital Asset market is subject to speculative interest, rapid price swings and uncertainty.</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">J. Monitoring Risks</h3>
                  <p className="mb-4">Digital Asset markets are open 24 hours a day, 7 days a week. Rapid price changes may occur at any time, including outside of normal business hours.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">K. Communication Risks</h3>
                  <p className="mb-4">When you communicate with us via electronic communication, you should be aware that electronic communications can fail, can be delayed, may not be secure and/or may not reach the intended destination.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">L. Currency</h3>
                  <p className="mb-4">Currency exchange fluctuations may impact your gains and losses.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">M. Legal and Regulatory Risks</h3>
                  <p className="mb-4">Most Digital Assets operate without a central authority and are generally not backed by any government or authority. Changes in laws and regulations may materially affect the value of Digital Assets. This risk is unpredictable and may vary from market to market.</p>
                  
                  <p className="mb-4">Further, Digital Assets may not be considered "property" under Applicable Laws in some jurisdictions. This may affect the nature and enforceability of your interest in the Digital Assets.</p>
                  
                  <p className="mb-4">Legislative and regulatory changes may adversely affect or restrict (as applicable) the use, transfer, exchange and value of Digital Assets, as well as the provision of the CryptoFlow Services in certain jurisdictions. Legislative and regulatory changes may occur quickly and without prior notice.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">N. Risk of trading using leverage</h3>
                  <p className="mb-4">Trading using leverage entails significant risk and it is important that you fully understand the risks involved in trading Digital Assets using leverage.</p>
                  
                  <p className="mb-4">A relatively small market movement will have a proportionately larger impact on the leveraged funds you have deposited or will have to deposit; this may work against you as well as for you. You may sustain a total loss of initial margin funds and, in exceptional circumstances, any additional funds deposited with CryptoFlow to maintain your position. If the market moves against your position or margin levels are increased, you may be called upon to pay substantial additional funds on short notice to maintain your position. If you fail to comply with a request for additional funds within the time prescribed, your position may be liquidated at a loss and you may, in exceptional circumstances, be liable for any resulting deficit.</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">O. Risk of trading Futures</h3>
                  <p className="mb-4">Futures are complex leveraged products and may not be suitable for inexperienced investors. Before investing, investors must understand the nature and accept the risks of futures products, including extreme price volatility of Digital Asset Futures and the risk that the value of a Digital Asset Futures position may decline rapidly and significantly, including to zero. While Digital Asset Futures amplifies the potential profit of trading in Digital Assets, it also amplifies the risk of loss. All the risks relating to the underlying Digital Assets may be magnified in Digital Asset Futures because of the use of leverage.</p>
                  
                  <p className="mb-4">The risk of loss is substantial. In volatile market conditions, the price of Digital Assets, and therefore the price of Digital Asset Futures, may decline significantly in a short period of time, including to zero. An investor in Digital Asset Futures must be prepared and able to bear the loss of the entirety of their investment.</p>
                  
                  <p className="mb-4">You should not invest any amount that you cannot afford to lose. You are strongly encouraged to seek independent professional advice when deciding whether Digital Asset Futures products are suitable for you, having regard to your risk appetite, financial position and knowledge about Digital Assets.</p>
                  
                  <p className="mb-4">When trading Futures, it is your responsibility:</p>
                  
                  <ol className="list-[lower-alpha] pl-6 space-y-2">
                    <li>To familiarise yourself with Digital Assets and Futures before you start trading.</li>
                    <li>To monitor your open positions and, when required, to reduce your position or deposit additional margin to avoid liquidation.</li>
                    <li>Manage your exposure and not risk more than you can afford to lose.</li>
                  </ol>
                  
                  <p className="mb-4">When trading Futures you may suffer a loss as a result of a number of factors including but not limited to the following:</p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>a position in Futures moving against you, for example, you hold a long position and the price of the underlying Digital Asset declines or you hold a short position and the price of the underlying Digital Asset increases. You may lose the entirety of your investment, including all assets that you have made available as margin for the position;</li>
                    <li>your profitable position may be force closed under auto-deleveraging, because one or more of the counter-parties to your profitable position has provided insufficient collateral, resulting in you not receiving some or all of the profits that you may otherwise be entitled to receive;</li>
                    <li>you cannot close a Futures position because there is insufficient market liquidity or demand for the other side of that trade;</li>
                    <li>we are required to change parameters on the Platform such as the margin requirements;</li>
                    <li>there is a malfunction of the Platform, for example resulting from scheduled or unscheduled downtimes, matching system failure, database failure, cryptocurrency transfer or storage failure, failure or malfunction of the API, hacker attacks or other failure or malfunction.</li>
                  </ul>
                  
                  <p className="mb-4">The market price of a Futures contract for a Digital Asset may not mirror the price of the relevant Digital Asset in the spot market. The price of a Futures contract for a Digital Asset may also fluctuate significantly in response to movements in the price of the underlying Digital Asset, supply and demand, and other market factors.</p>
                  
                  <p className="mb-4">In order to open and maintain a Futures position, you will be required to provide collateral as margin. The use of leverage allows traders to provide a relatively small amount of margin for a position with significantly more market exposure. However, this use of leverage means that a relatively small change in the market price of the underlying Digital Asset could result in liquidation of a position and loss of assets. For example, a 1% decrease in the price of a Digital Asset underlying a 10x leveraged long Futures contract is equal to a 10% loss in the long Futures position. Conversely, a 1% increase in the price of a Digital Asset underlying a 10x leveraged short Futures contract is equal to a 10% loss in the short Futures position.</p>
                  
                  <p className="mb-4">If the market moves against your Futures position, you may be required to provide additional margin on short notice in order to maintain your Futures positions, failing which your position may be liquidated. If you are subject to liquidation, you may sustain a total loss of all collateral that has been provided or otherwise made available to establish or maintain a position, including collateral provided to meet margin calls. Further, you may, in exceptional circumstances, be responsible and liable for any deficit resulting in your Account following liquidation of your positions. It is your responsibility to ensure that you have sufficient margin in your Account to maintain all open positions.</p>
                  
                  <p className="mb-4">Perpetual Futures Products do not have a fixed term. You will be subject to funding rates for the duration of your positions in Perpetual Futures Products.</p>
                  
                  <p className="mb-4">CryptoFlow may at its sole discretion determine to terminate the offering of Futures. If you are required to close your Futures positions, or your Futures positions are forced closed, at a time when the market price of the underlying Digital Asset is not favourable, you may suffer losses as a result. CryptoFlow will not be responsible for any losses resulting from such termination.</p>
                  
                  <p className="mb-4">The placing of certain "stop-loss" orders, or "stop-limit" orders which are intended to limit losses to certain amounts may not always be effective because rapidly changing market conditions may make it impossible to execute such orders. Strategies using combinations of positions such as "spread" and "straddle" positions may be as risky as taking simply "long" or "short" positions.</p>
                </div>

                
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>;
};
export default Risk;