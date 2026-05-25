import { Link } from "react-router-dom";
import { Wallet, ArrowRight, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const QuickDepositCard = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <Link to="/deposit/channels" className="block group">
        <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-5 md:p-6 transition-all hover:border-primary/60 hover:shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg">
              <Wallet className="h-7 w-7" />
              <Zap className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-background text-primary p-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-semibold">Quick Deposit</h3>
                <span className="hidden sm:inline-flex text-[10px] uppercase tracking-wider rounded-full bg-primary/10 text-primary px-2 py-0.5">Instant</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                Support BTC, USDT, ETH, USDC and more
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </Link>
    </section>
  );
};

export default QuickDepositCard;
