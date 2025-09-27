import type { TableColumnType } from 'antd';
import { TokenData, SupportedChain } from './token.types';
import { TokenPriceUpdate } from './price.types';
import { ScannerApiResponse } from '../globalTypes';

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

export interface TrendingTokensTableProps extends BaseTableProps {}

export interface NewTokensTableProps extends BaseTableProps {}

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
  compare: (a: any, b: any) => number;
  multiple?: number;
}