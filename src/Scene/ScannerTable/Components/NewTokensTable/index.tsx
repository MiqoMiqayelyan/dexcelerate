import React from 'react';
import { Table } from 'antd';
import { NewTokensTableProps } from '../../../../types';
import { useNewTokensTableColumns } from '../../hooks/useNewTokensTableColumns';

const NewTokensTable: React.FC<NewTokensTableProps> = ({ 
  data,
  isConnected 
}) => {
  const columns = useNewTokensTableColumns();

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

export default NewTokensTable;