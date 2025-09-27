import { ScannerResult } from "../globalTypes";


export const transformData = (data: ScannerResult[]) => {
    return data.map((item: ScannerResult) => ({
        id: item.pairAddress,
      tokenName: item.token1Name,
      tokenSymbol: item.token1Symbol,
      tokenAddress: item.token1Address,
      pairAddress: item.pairAddress,
      chain: String(item.chainId),
      exchange: item.routerAddress,
      priceUsd: parseFloat(item.price || '0'),
      volumeUsd: parseFloat(item.volume || '0'),
      mcap: parseFloat(item.currentMcap || item.initialMcap || item.pairMcapUsd || item.pairMcapUsdInitial || '0'),
      priceChangePcs: {
        "5m": parseFloat(item.diff5M || '0'),
        "1h": parseFloat(item.diff1H || '0'),
        "6h": parseFloat(item.diff6H || '0'),
        "24h": parseFloat(item.diff24H || '0')
      },
      transactions: {
        buys: item.buys || 0,
        sells: item.sells || 0
      },
      liquidity: {
current: parseFloat(item.liquidity || '0'),
changePc: parseFloat(item.percentChangeInLiquidity || '0')
},
      audit: {
        mintable: !item.isMintAuthDisabled,
        freezable: !item.isFreezeAuthDisabled,
        honeypot: item.honeyPot || false,
        contractVerified: item.contractVerified
      },
      tokenCreatedTimestamp: new Date(item.age)
    }));
}