import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { TokenData, NewTokensTableProps } from '../../../../types';
import { useWebSocket } from '../../../../hooks/useWebSocket';
import { useNewTokensTableColumns } from '../../hooks/useNewTokensTableColumns';

const NewTokensTable: React.FC<NewTokensTableProps> = ({ 
  filters,
  data, 
  priceUpdates, 
  onTokensLoad 
}) => {
  const [tableData, setTableData] = useState<TokenData[]>(data || []);
  const { tokens, isConnected } = useWebSocket({
    rankBy: 'age',
    ...filters,
  });

  const columns = useNewTokensTableColumns();

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