interface Props {
  coin: string;
  size?: number;
}

const COLORS: Record<string, string> = {
  BTC: "from-orange-400 to-amber-600",
  ETH: "from-indigo-400 to-purple-600",
  USDT: "from-emerald-400 to-teal-600",
  USDC: "from-sky-400 to-blue-600",
  XRP: "from-slate-400 to-slate-700",
  DOGE: "from-yellow-400 to-amber-500",
  SOL: "from-fuchsia-400 to-violet-600",
  BNB: "from-yellow-400 to-orange-500",
};

export const CoinIcon = ({ coin, size = 40 }: Props) => {
  const upper = coin.toUpperCase();
  const grad = COLORS[upper] ?? "from-primary to-primary/60";
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${grad} text-white font-bold shadow`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {upper.slice(0, 3)}
    </div>
  );
};
