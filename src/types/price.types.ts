export interface SwapData {
  isOutlier: boolean;
  priceToken1Usd: string;
  type: 'buy' | 'sell';
}

export interface TokenPriceUpdate {
  tokenAddress: string;
  newPrice: number;
  newMarketCap: number;
  type: 'buy' | 'sell';
}

export type MarketCapSource = 'currentMcap' | 'initialMcap' | 'pairMcapUsd' | 'pairMcapUsdInitial';

export interface TokenPriceState {
  price: number;
  marketCap: number;
  buys: number;
  sells: number;
  volume24h: number;
  source: MarketCapSource;
}

export interface PriceUpdateResult {
  price: number;
  marketCap: number;
  transactionType: 'buy' | 'sell';
}

export interface TokenMetrics {
  totalSupply: number;
  decimals: number;
  initialPrice: number;
  initialMarketCap: number;
}

export interface TokenUpdateContext {
  tokenAddress: string;
  metrics: TokenMetrics;
  priceState: TokenPriceState;
}