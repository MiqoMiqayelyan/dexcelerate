export interface WebSocketSubscribeMessage {
  event: "subscribe-pair" | "subscribe-pair-stats" | "scanner-filter";
  data: {
    pair?: string;
    token?: string;
    chain?: string;
    rankBy?: "volume" | "age";
    isNotHP?: boolean;
  };
}

export interface WebSocketUnsubscribeMessage {
  event: "unsubscribe-pair" | "unsubscribe-pair-stats" | "unsubscribe-scanner-filter";
  data: {
    pair?: string;
    token?: string;
    chain?: string;
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
  data: any[];  // This will be TokenData[] but avoiding circular imports
};