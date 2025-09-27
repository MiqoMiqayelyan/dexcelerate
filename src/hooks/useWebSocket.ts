import { useEffect, useRef, useState, useCallback } from 'react';
import {
  IncomingWebSocketMessage,
  ScannerSubscriptionMessage,
  PairSubscriptionMessage,
  PairStatsSubscriptionMessage,
  PairUnsubscriptionMessage,
  PairStatsUnsubscriptionMessage,
  ScannerResult,
  GetScannerResultParams,
  WsTokenSwap,
} from '../globalTypes';

import { chainIdToName } from '../utils/chainIdToName';

import { TokenData } from '../types';

const WS_URL = 'wss://api-rs.dexcelerate.com/ws';


export const useWebSocket = (options: GetScannerResultParams) => {
  const ws = useRef<WebSocket | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const subscribedPairs = useRef<Set<string>>(new Set());
  const currentOptions = useRef(options);

  const subscribeToScanner = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const message: ScannerSubscriptionMessage = {
      event: "scanner-filter",
      data: currentOptions.current
    };
    ws.current.send(JSON.stringify(message));
  }, []);

  const subscribeToPair = useCallback((token: TokenData) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (subscribedPairs.current.has(token.pairAddress)) return;

    const pairStatsMessage: PairStatsSubscriptionMessage = {
      event: "subscribe-pair-stats",
      data: {
        pair: token.pairAddress,
        token: token.tokenAddress,
        chain: token.chain
      }
    };
    ws.current.send(JSON.stringify(pairStatsMessage));

    const pairTickMessage: PairSubscriptionMessage = {
      event: "subscribe-pair",
      data: {
        pair: token.pairAddress,
        token: token.tokenAddress,
        chain: token.chain
      }
    };
    ws.current.send(JSON.stringify(pairTickMessage));

    subscribedPairs.current.add(token.pairAddress);
  }, []);

  const unsubscribeFromPair = useCallback((token: TokenData) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!subscribedPairs.current.has(token.pairAddress)) return;

    const pairStatsMessage: PairStatsUnsubscriptionMessage = {
      event: "unsubscribe-pair-stats",
      data: {
        pair: token.pairAddress,
        token: token.tokenAddress,
        chain: token.chain
      }
    };
    ws.current.send(JSON.stringify(pairStatsMessage));

    const pairTickMessage: PairUnsubscriptionMessage = {
      event: "unsubscribe-pair",
      data: {
        pair: token.pairAddress,
        token: token.tokenAddress,
        chain: token.chain
      }
    };
    ws.current.send(JSON.stringify(pairTickMessage));

    subscribedPairs.current.delete(token.pairAddress);
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const wsMessage = JSON.parse(event.data) as IncomingWebSocketMessage;
      
      switch (wsMessage.event) {
        case 'scanner-pairs': {
          setTokens(prevTokens => {
            const newTokens = wsMessage.data.results.pairs.map((newToken: ScannerResult) => {
              const tokenData: TokenData = {
                id: newToken.pairAddress,
                tokenName: newToken.token1Name,
                tokenSymbol: newToken.token1Symbol,
                tokenAddress: newToken.token1Address,
                pairAddress: newToken.pairAddress,
                chain: chainIdToName(newToken.chainId),
                exchange: newToken.routerAddress,
                priceUsd: parseFloat(newToken.price || '0'),
                volumeUsd: parseFloat(newToken.volume || '0'),
                mcap: parseFloat(newToken.currentMcap || newToken.initialMcap || newToken.pairMcapUsd || newToken.pairMcapUsdInitial || '0'),
                priceChangePcs: {
                  "5m": parseFloat(newToken.diff5M || '0'),
                  "1h": parseFloat(newToken.diff1H || '0'),
                  "6h": parseFloat(newToken.diff6H || '0'),
                  "24h": parseFloat(newToken.diff24H || '0')
                },
                transactions: {
                  buys: newToken.buys || 0,
                  sells: newToken.sells || 0
                },
                audit: {
                  mintable: !newToken.isMintAuthDisabled,
                  freezable: !newToken.isFreezeAuthDisabled,
                  honeypot: newToken.honeyPot || false,
                  contractVerified: newToken.contractVerified
                },
                liquidity: {
                  current: parseFloat(newToken.liquidity || '0'),
                  changePc: parseFloat(newToken.percentChangeInLiquidity || '0')
                },
                tokenCreatedTimestamp: new Date(newToken.age),
              };
              return tokenData;
            });
            
            newTokens.forEach(token => {
              if (!subscribedPairs.current.has(token.pairAddress)) {
                subscribeToPair(token);
              }
            });

            prevTokens.forEach(token => {
              if (!newTokens.find(t => t.pairAddress === token.pairAddress)) {
                unsubscribeFromPair(token);
              }
            });

            return newTokens;
          });
          break;
        }

        case 'tick': {
          const swaps = wsMessage.data.swaps;
          const latestSwap = swaps.filter((swap: WsTokenSwap) => !swap.isOutlier).pop();
          
          if (latestSwap) {
            setTokens(prevTokens => 
              prevTokens.map(token => {
                if (subscribedPairs.current.has(token.pairAddress)) {
                  const newPrice = parseFloat(latestSwap.priceToken1Usd);
                  const mcap = token.mcap / token.priceUsd * newPrice;
                  
                  return {
                    ...token,
                    priceUsd: newPrice,
                    mcap,
                    transactions: {
                      ...token.transactions,
                      buys: token.transactions.buys + (latestSwap.tokenInAddress === token.tokenAddress ? 1 : 0),
                      sells: token.transactions.sells + (latestSwap.tokenInAddress !== token.tokenAddress ? 1 : 0)
                    }
                  };
                }
                return token;
              })
            );
          }
          break;
        }

        case 'pair-stats': {
          const pairData = wsMessage.data.pair;
          setTokens(prevTokens => 
            prevTokens.map(token => {
              if (subscribedPairs.current.has(token.pairAddress)) {
                return {
                  ...token,
                  audit: {
                    ...token.audit,
                    mintable: !pairData.mintAuthorityRenounced,
                    freezable: !pairData.freezeAuthorityRenounced,
                    honeypot: pairData.token1IsHoneypot === true,
                    contractVerified: pairData.isVerified
                  }
                };
              }
              return token;
            })
          );
          break;
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [subscribeToPair, unsubscribeFromPair]);

  const connectWebSocket = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      subscribeToScanner();
      
      // Start heartbeat
      const heartbeatInterval = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ event: 'ping' }));
        }
      }, 30000); // Send heartbeat every 30 seconds

      // Store interval ID for cleanup
      (ws.current as any).heartbeatInterval = heartbeatInterval;
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket Disconnected:', event.code, event.reason);
      setIsConnected(false);
      subscribedPairs.current.clear();

      // Clear heartbeat interval
      if ((ws.current as any)?.heartbeatInterval) {
        clearInterval((ws.current as any).heartbeatInterval);
      }

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }
      }, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
      // Only attempt to reconnect if the connection is closed
      if (ws.current?.readyState === WebSocket.CLOSED) {
        setTimeout(() => connectWebSocket(), 5000);
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle pong response to keep connection alive
        if (data.event === 'pong') {
          return;
        }

        handleMessage(event);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
  }, [handleMessage, subscribeToScanner]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        if ((ws.current as any)?.heartbeatInterval) {
          clearInterval((ws.current as any).heartbeatInterval);
        }
        ws.current.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    currentOptions.current = options;
    if (isConnected) {
      subscribeToScanner();
    }
  }, [isConnected, subscribeToScanner, options]);

  return { tokens, isConnected };
};