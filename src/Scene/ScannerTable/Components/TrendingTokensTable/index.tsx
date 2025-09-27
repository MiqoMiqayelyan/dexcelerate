import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { TokenData, TrendingTokensTableProps } from '../../../../types';
import { useWebSocket } from '../../../../hooks/useWebSocket';
import { useTrendingTokensTableColumns } from '../../hooks/useTrendingTokensTableColumns';

const TrendingTokensTable: React.FC<TrendingTokensTableProps> = ({ 
  filters,
  data,
  priceUpdates, 
  onTokensLoad 
}) => {
  const [tableData, setTableData] = useState<TokenData[]>(data || []);
  const { tokens, isConnected } = useWebSocket({
    rankBy: 'volume',
    ...filters,
  });

  const columns = useTrendingTokensTableColumns();

  useEffect(() => {
    if (tokens.length > 0) {
      setTableData(tokens.map(token => {
        const update = priceUpdates[token.tokenAddress];
        if (update) {
          return {
            ...token,
            price: update.newPrice,
            mcap: update.newMarketCap,
          };
        }
        return token;
      }));
      onTokensLoad(tokens);
    }
  }, [tokens, priceUpdates, onTokensLoad]);

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