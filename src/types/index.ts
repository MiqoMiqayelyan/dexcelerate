import { ScannerResult } from '../globalTypes';
import { TokenData } from './token.types';
import { SupportedChain } from './token.types';

export * from './token.types';
export * from './table.types';
export * from './price.types';

// Represents the response from the scanner API
export interface ScannerApiResponse {
  pairs: never[];
  success: boolean;
  data: {
    pairs: ScannerResult[];
    total: number;
  };
}

// Parameters for the scanner API request
export interface GetScannerResultParams {
  chain?: SupportedChain | null;
  minVol24H?: number;
  maxAge?: number;  // in seconds
  minMcap?: number;
  isNotHP?: boolean;
  rankBy?: "volume" | "age";
  pageSize?: number;
  page?: number;
}

// WebSocket message types
export interface WebSocketSubscribeMessage {
  event: "subscribe-pair" | "subscribe-pair-stats" | "scanner-filter";
  data: {
    pair?: string;
    token?: string;
    chain?: SupportedChain;
    rankBy?: "volume" | "age";
    isNotHP?: boolean;
  };
}

export interface WebSocketUnsubscribeMessage {
  event: "unsubscribe-pair" | "unsubscribe-pair-stats" | "unsubscribe-scanner-filter";
  data: {
    pair?: string;
    token?: string;
    chain?: SupportedChain;
  };
}

export interface PairStatsEvent {
  event: "pair-stats";
  data: {
    pair: {
      mintAuthorityRenounced: boolean;
      freezeAuthorityRenounced: boolean;
      token1IsHoneypot: boolean;
      isVerified: boolean;
      linkDiscord?: string;
      linkTelegram?: string;
      linkTwitter?: string;
      linkWebsite?: string;
      dexPaid: boolean;
    };
    migrationProgress: string;
  };
}

export interface TickEvent {
  event: "tick";
  data: {
    swaps: {
      isOutlier: boolean;
      priceToken1Usd: string;
      type: "buy" | "sell";
    }[];
  };
}

export interface ScannerPairsEvent {
  event: "scanner-pairs";
  data: TokenData[];
}