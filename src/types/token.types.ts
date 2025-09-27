export type SupportedChain = "ETH" | "SOL" | "BASE" | "BSC";

export interface TokenData {
id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  pairAddress: string;
  chain: string;
  exchange: string;
  priceUsd: number;
  volumeUsd: number;
  mcap: number;
  priceChangePcs: {
    "5m": number;
    "1h": number;
    "6h": number;
    "24h": number;
  };
  transactions: {
    buys: number;
    sells: number;
  };
  liquidity: {
    current: number;
    changePc: number;
  };
  audit: {
    mintable: boolean;
    freezable: boolean;
    honeypot: boolean;
    contractVerified: boolean;
  };
  tokenCreatedTimestamp: Date;
};

