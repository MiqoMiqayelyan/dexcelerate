import React from 'react';
import { Table } from 'antd';
import { TrendingTokensTableProps } from '../../../../types';
import { useTrendingTokensTableColumns } from '../../hooks/useTrendingTokensTableColumns';

const TrendingTokensTable: React.FC<TrendingTokensTableProps> = ({ 
  data,
  isConnected 
}) => {
  const columns = useTrendingTokensTableColumns();

  return (
    <Table
      dataSource={data || []}
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