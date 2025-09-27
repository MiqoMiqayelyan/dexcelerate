import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Select, InputNumber, Switch, Flex } from 'antd';
import { SupportedChain, TokenData } from '../../types';
import TrendingTokensTable from './Components/TrendingTokensTable';
import NewTokensTable from './Components/NewTokensTable';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useDebounce } from '../../hooks/useDabounce';
import useCheckMobileScreen from '../../hooks/useCheckTableScreen';
import { transformData } from '../../utils/transformData';
import { getScannerResults } from '../../api/getScannerResults';

interface FilterParams {
  chain: SupportedChain | null;
  minVolume?: number;
  maxAge?: number;
  minMcap?: number;
  isNotHP: boolean;
}

const ScannerTableContainer: React.FC = () => {
  const isColumns = useCheckMobileScreen();

  const [filters, setFilters] = useState<FilterParams>({
    chain: null,
    minVolume: undefined,
    maxAge: undefined,
    minMcap: undefined,
    isNotHP: true
  });
  const [data, setData] = useState<TokenData[] | null>(null);

  const getScanner = async (filters: FilterParams) => {
    try {
     const data = await getScannerResults(filters);
            setData(transformData(data?.pairs || []));
    } catch (err) {
      console.error(err);
    }
      
  };


  // Use the WebSocket hook for real-time data
  const { tokens, isConnected } = useWebSocket(filters, data);


  const handleChainChange = (value: SupportedChain | null) => {
    setFilters(prev => ({ ...prev, chain: value }));
    getScanner({ ...filters, chain: value });
  };

  const handleMinVolumeChange = (value: number | null) => {
    setFilters(prev => ({ ...prev, minVolume: value || undefined }));
    getScanner({ ...filters, minVolume: value || undefined });
  };

  const handleMaxAgeChange = (value: number | null) => {
    setFilters(prev => ({ ...prev, maxAge: value ? value * 3600 : undefined }));
    getScanner({ ...filters, maxAge: value ? value * 3600 : undefined });
  };

  const handleMinMcapChange = (value: number | null) => {
    setFilters(prev => ({ ...prev, minMcap: value || undefined }));
    getScanner({ ...filters, minMcap: value || undefined });
  };

  const handleHoneypotChange = (checked: boolean) => {
    setFilters(prev => ({ ...prev, isNotHP: checked }));
    getScanner({ ...filters, isNotHP: checked });
  };

  useEffect(() => {
    if(data) return;
    getScanner(filters);

  }, [filters, data]);

  // Debounce filter changes to prevent too many WebSocket reconnections
  const debouncedMaxAgeChange = useDebounce(handleMaxAgeChange, 500);
  const debouncedMinMcapChange = useDebounce(handleMinMcapChange, 500);
  const debouncedMinVolumeChange = useDebounce(handleMinVolumeChange, 500);

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <span style={{ marginRight: '8px' }}>Chain:</span>
            <Select
              style={{ width: 120 }}
              value={filters.chain}
              onChange={handleChainChange}
              allowClear
            >
              <Select.Option value="ETH">ETH</Select.Option>
              <Select.Option value="SOL">SOL</Select.Option>
              <Select.Option value="BASE">BASE</Select.Option>
              <Select.Option value="BSC">BSC</Select.Option>
            </Select>
          </Col>

          <Col>
            <span style={{ marginRight: '8px' }}>Min Volume ($):</span>
            <InputNumber
              style={{ width: 120 }}
              value={filters.minVolume}
              onChange={debouncedMinVolumeChange}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => parseFloat(value!.replace(/\$\s?|(,*)/g, ''))}
            />
          </Col>

          <Col>
            <span style={{ marginRight: '8px' }}>Max Age (hours):</span>
            <InputNumber
              style={{ width: 120 }}
              value={filters.maxAge ? filters.maxAge / 3600 : undefined}
              onChange={debouncedMaxAgeChange}
              min={0}
            />
          </Col>

          <Col>
            <span style={{ marginRight: '8px' }}>Min Market Cap ($):</span>
            <InputNumber
              style={{ width: 120 }}
              value={filters.minMcap}
              onChange={debouncedMinMcapChange}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => parseFloat(value!.replace(/\$\s?|(,*)/g, ''))}
            />
          </Col>

          <Col>
            <span style={{ marginRight: '8px' }}>Exclude Honeypots:</span>
            <Switch
              checked={filters.isNotHP}
              onChange={handleHoneypotChange}
            />
          </Col>
        </Row>
      </Card>

      <Flex wrap={isColumns} gap="small">
        <Col span={isColumns ? 24 : 12}>
          <Card title="Trending Tokens">
            <TrendingTokensTable
              data={tokens}
              isConnected={isConnected}
            />
          </Card>
        </Col>
        <Col span={isColumns ? 24 : 12}>
          <Card title="New Tokens">
            <NewTokensTable
              data={tokens}
              isConnected={isConnected}
            />
          </Card>
        </Col>
      </Flex>
    </div>
  );
};

export default ScannerTableContainer;