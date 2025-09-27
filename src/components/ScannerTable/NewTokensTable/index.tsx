import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { TokenData, NewTokensTableProps } from '../../../types';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { formatPrice, formatValue, getColorByChange } from '../../../utils/formatters';

const NewTokensTable: React.FC<NewTokensTableProps> = ({ 
  filters,
  data, 
  priceUpdates, 
  onTokensLoad 
}) => {
  const [tableData, setTableData] = useState<TokenData[]>([]);
  const { tokens, isConnected } = useWebSocket({
    rankBy: 'age',
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
            priceUsd: update.newPrice,
            mcap: update.newMarketCap,
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
      title: 'Age',
      key: 'age',
      sorter: (a: TokenData, b: TokenData) => {
        const aDate = new Date(a.tokenCreatedTimestamp
).getTime();
        const bDate = new Date(b.tokenCreatedTimestamp
).getTime();
        return aDate - bDate;
      },
      render: (record: TokenData) => {
        const age = Math.floor((Date.now() - new Date(record.tokenCreatedTimestamp).getTime()) / 1000);
        const hours = Math.floor(age / 3600);
        const minutes = Math.floor((age % 3600) / 60);
        return `${hours}h ${minutes}m`;
      },
    },
    {
      title: 'Price',
      dataIndex: 'priceUsd',
      key: 'priceUsd',
      render: (price: number) => formatPrice((Number(price))),
    },
    {
      title: 'Market Cap',
      dataIndex: 'mcap',
      key: 'mcap',
      render: (value: number) => {

        return formatValue(value)
    },
    },
    {
      title: 'Volume',
      dataIndex: 'volumeUsd',
      key: 'volumeUsd',
      render: (value: number) => formatValue(value),
    },
    {
      title: '5m',
      dataIndex: 'priceChangePcs',
      key: 'priceChangePcs',
            render: (priceChangePcs: Record<string, number> | undefined) => (
              <span style={{ color: getColorByChange(Number(priceChangePcs?.['5m'] ?? 0)) }}>
                {(Number(priceChangePcs?.['5m'] ?? 0)).toFixed(2)}%
              </span>
            )
    },
    {
      title: 'Liquidity',
      dataIndex: ['liquidity', 'current'],
      key: 'liquidity',
      render: (value: number, record: TokenData) => (
        <div>
          <div>{formatValue(Number(value))}</div>
          <div style={{ color: getColorByChange(record.liquidity.changePc) }}>
            {record.liquidity.changePc.toFixed(2)}%
          </div>
        </div>
      ),
    },
    {
      title: 'Audit',
      key: 'audit',
      render: (record: TokenData) => (
        <div>
          {record.audit.contractVerified && (
            <span style={{ color: '#52c41a', marginRight: '4px' }}>✓</span>
          )}
          {!record.audit.honeypot && (
            <span style={{ color: '#52c41a', marginRight: '4px' }}>Safe</span>
          )}
          {(record.audit.mintable || record.audit.freezable) && (
            <span style={{ color: '#faad14' }}>⚠️</span>
          )}
        </div>
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

export default NewTokensTable;