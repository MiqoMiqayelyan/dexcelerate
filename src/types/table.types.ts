import type { TableColumnType } from 'antd';
import { TokenData, SupportedChain } from './token.types';
import { TokenPriceUpdate } from './price.types';

export interface FilterParams {
  chain: SupportedChain | null;
  minVolume?: number;
  maxAge?: number;
  minMcap?: number;
  isNotHP: boolean;
}

export type TokenTableColumnType = TableColumnType<TokenData>;

export interface BaseTableProps {
  filters: FilterParams;
  data: TokenData[] | null;
  priceUpdates: Record<string, TokenPriceUpdate>;
  onTokensLoad: (tokens: TokenData[]) => void;
}

export interface TokenTableProps extends BaseTableProps {
  data: TokenData[] | null;
  loading: boolean;
  onSort?: (sorter: SorterConfig) => void;
  defaultSort?: SorterConfig;
}

export interface TrendingTokensTableProps {
  data: TokenData[];
  isConnected: boolean;
}

export interface NewTokensTableProps {
  data: TokenData[];
  isConnected: boolean;
}

export interface SorterConfig {
  field: keyof TokenData;
  order: 'ascend' | 'descend' | undefined;
}

export interface TokenTableState {
  sortedInfo: SorterConfig | null;
  filteredInfo: Record<string, string[]> | null;
}

export type SortOrder = 'ascend' | 'descend' | null;

export interface ColumnSorterProps {
  compare: <T>(a: T, b: T) => number;
  multiple?: number;
}