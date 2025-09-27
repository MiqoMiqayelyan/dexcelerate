import { chainIdToName } from '../chainIdToName';
import { SupportedChainName } from '../../globalTypes';

describe('chainIdToName', () => {
  it('should correctly convert Ethereum chain ID', () => {
    expect(chainIdToName(1)).toBe<SupportedChainName>('ETH');
  });

  it('should correctly convert BSC chain ID', () => {
    expect(chainIdToName(56)).toBe<SupportedChainName>('BSC');
  });

  it('should correctly convert BASE chain ID', () => {
    expect(chainIdToName(8453)).toBe<SupportedChainName>('BASE');
  });

  it('should correctly convert Solana chain ID', () => {
    expect(chainIdToName(900)).toBe<SupportedChainName>('SOL');
  });

  it('should default to ETH for unknown chain IDs', () => {
    expect(chainIdToName(999)).toBe<SupportedChainName>('ETH');
    expect(chainIdToName(0)).toBe<SupportedChainName>('ETH');
    expect(chainIdToName(-1)).toBe<SupportedChainName>('ETH');
  });

  it('should handle chain IDs passed as strings from JSON', () => {
    const chainId = JSON.parse('"1"');
    expect(chainIdToName(Number(chainId))).toBe<SupportedChainName>('ETH');
  });

  it('should handle large chain IDs without precision loss', () => {
    expect(chainIdToName(8453)).toBe<SupportedChainName>('BASE');
    expect(chainIdToName(Number('8453'))).toBe<SupportedChainName>('BASE');
  });
});