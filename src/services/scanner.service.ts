import axios from 'axios';
import { 
  GetScannerResultParams, 
  ScannerApiResponse, 
  TokenData,
  SwapData,
  TokenPriceUpdate,
  TokenUpdateContext,
  PriceUpdateResult
} from '../types';

class ScannerService {
  private static instance: ScannerService;
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private tokenUpdateHandlers: ((update: TokenPriceUpdate) => void)[] = [];

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api-rs.dexcelerate.com';
  }

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  async getScannerResults(params: GetScannerResultParams): Promise<ScannerApiResponse> {
    try {
      const response = await axios.get<ScannerApiResponse>(`${this.baseUrl}/scanner`, {
        params
      });
      console.log(response.data, 'response data from scanner service');
      return response.data;
    } catch (error) {
      console.error('Error fetching scanner results:', error);
      throw error;
    }
  }

//   calculateMarketCap(token: TokenData): number {
//     if (token.currentMcap && parseFloat(token.currentMcap) > 0) return parseFloat(token.currentMcap);
//     if (token.initialMcap && parseFloat(token.initialMcap) > 0) return parseFloat(token.initialMcap);
//     if (token.pairMcapUsd && parseFloat(token.pairMcapUsd) > 0) return parseFloat(token.pairMcapUsd);
//     if (token.pairMcapUsdInitial && parseFloat(token.pairMcapUsdInitial) > 0) return parseFloat(token.pairMcapUsdInitial);
    
//     const totalSupply = token.token1TotalSupplyFormatted ? parseFloat(token.token1TotalSupplyFormatted) : 0;
//     const price = token.price ? parseFloat(token.price) : 0;
//     return totalSupply * price;
//   }

  private handleTickEvent(swaps: SwapData[], context: TokenUpdateContext): PriceUpdateResult | null {
    const latestSwap = [...swaps].reverse().find(swap => !swap.isOutlier);
    
    if (!latestSwap) return null;

    const newPrice = parseFloat(latestSwap.priceToken1Usd);
    const newMarketCap = context.metrics.totalSupply * newPrice;

    return {
      price: newPrice,
      marketCap: newMarketCap,
      transactionType: latestSwap.type
    };
  }

  subscribeToTokenUpdates(tokenAddress: string, handler: (update: TokenPriceUpdate) => void) {
    this.tokenUpdateHandlers.push(handler);

    if (!this.wsConnection) {
      this.connectWebSocket();
    }

    // Subscribe to specific token updates
    this.wsConnection?.send(JSON.stringify({
      event: 'subscribe-pair',
      data: { tokenAddress }
    }));
  }

  private connectWebSocket() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'wss://api-rs.dexcelerate.com/ws';
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.event === 'tick' && data.data.swaps) {
        // Handle price updates
        this.handleWsMessage(data);
      }
    };

    this.wsConnection.onclose = () => {
      setTimeout(() => this.connectWebSocket(), 5000); // Reconnect after 5 seconds
    };
  }

  private handleWsMessage(data: any) {
    // Implementation depends on your specific WebSocket message format
    const { tokenAddress, swaps, context } = data;
    
    const update = this.handleTickEvent(swaps, context);
    if (update) {
      const priceUpdate: TokenPriceUpdate = {
        tokenAddress,
        newPrice: update.price,
        newMarketCap: update.marketCap,
        type: update.transactionType
      };

      this.tokenUpdateHandlers.forEach(handler => handler(priceUpdate));
    }
  }

  unsubscribeFromTokenUpdates(handler: (update: TokenPriceUpdate) => void) {
    this.tokenUpdateHandlers = this.tokenUpdateHandlers.filter(h => h !== handler);
  }

  disconnect() {
    this.wsConnection?.close();
    this.wsConnection = null;
    this.tokenUpdateHandlers = [];
  }
}

export default ScannerService;