import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { TokenData, TrendingTokensTableProps } from '../../../types';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { formatPrice, formatValue, getColorByChange } from '../../../utils/formatters';

const TrendingTokensTable: React.FC<TrendingTokensTableProps> = ({ 
  filters,
  data,
  priceUpdates, 
  onTokensLoad 
}) => {
  const [tableData, setTableData] = useState<TokenData[]>([]);
  const { tokens, isConnected } = useWebSocket({
    rankBy: 'volume',
    ...filters,
  });

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  useEffect(() => {
    if (tokens.length > 0) {
      setTableData(tokens.map(token => {
        const update = priceUpdates[token.tokenAddress];
        if (update) {
          return {
            ...token,
            price: update.newPrice,
            currentMcap: update.newMarketCap,
          };
        }
        return token;
      }));
      onTokensLoad(tokens);
    }
  }, [tokens, priceUpdates, onTokensLoad]);

  const columns = [
    {
      title: 'Token',
      key: 'token0Symbol',
      sorter: (a: TokenData, b: TokenData) => Number(a.chain) - Number(b.chain),
      render: (record: TokenData) => (
        <div>
          <div>{record.tokenSymbol}</div>
          <div style={{ color: '#8c8c8c', fontSize: '0.9em' }}>
            {record.tokenSymbol} ({record.chain})
          </div>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'priceUsd',
      key: 'priceUsd',
      sorter: (a: TokenData, b: TokenData) => Number(a.priceUsd) - Number(b.priceUsd),
      render: (price: number) => formatPrice(Number(price)),
    },
    {
      title: 'Volume (24h)',
      dataIndex: 'volumeUsd',
      key: 'volumeUsd',
      sorter: (a: TokenData, b: TokenData) => Number(a.volumeUsd) - Number(b.volumeUsd),
      render: (value: number) => formatValue(value),
    },
    {
      title: 'Market Cap',
      dataIndex: 'mcap',
      key: 'mcap',
      sorter: (a: TokenData, b: TokenData) => Number(a.mcap) - Number(b.mcap),
      render: (value: number) => formatValue(value),
    },
    {
      title: '5m',
      dataIndex: 'priceChangePcs',
      key: 'priceChangePcs',
      sorter: (a: TokenData, b: TokenData) => Number(a.priceChangePcs?.['5m'] ?? 0) - Number(b.priceChangePcs?.['5m'] ?? 0),
      render: (priceChangePcs: Record<string, number> | undefined) => (
        <span style={{ color: getColorByChange(Number(priceChangePcs?.['5m'] ?? 0)) }}>
          {(Number(priceChangePcs?.['5m'] ?? 0)).toFixed(2)}%
        </span>
      ),
    },
    {
      title: 'Liquidity',
      dataIndex: ['liquidity', 'current'],
      key: 'liquidity',
      render: (value: number, record: TokenData) => (
        <div>
          <div>{formatValue(value)}</div>
          <div style={{ color: getColorByChange(record.liquidity.changePc) }}>
            {record.liquidity.changePc.toFixed(2)}%
          </div>
        </div>
      ),
    },
    {
      title: 'Tx (B/S)',
      key: 'transactions',
      render: (record: TokenData) => (
        <span>
          <span style={{ color: '#52c41a' }}>{record.transactions.buys}</span>
          {' / '}
          <span style={{ color: '#f5222d' }}>{record.transactions.sells}</span>
        </span>
      ),
    },
  ];

  return (
    <Table
      dataSource={tableData}
      columns={columns}
      rowKey="id"
      loading={!isConnected}
      pagination={{ pageSize: 50 }}
      scroll={{ x: true }}
      size="middle"
    />
  );
};

export default TrendingTokensTable;