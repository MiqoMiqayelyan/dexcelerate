import { SupportedChainName } from "../globalTypes";

/**
 * Helper to convert chain ID to chain name
 */
export function chainIdToName(chainId: number): SupportedChainName {
  switch (chainId.toString()) {
    case "1": return "ETH";
    case "56": return "BSC";
    case "8453": return "BASE";
    case "900": return "SOL";
    default: return "ETH";
  }
}