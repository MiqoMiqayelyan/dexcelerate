import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Select, InputNumber, Switch, Flex, Skeleton } from 'antd';
import { SupportedChain, TokenData, TokenPriceUpdate } from '../../types';
import TrendingTokensTable from './Components/TrendingTokensTable';
import NewTokensTable from './Components/NewTokensTable';
import ScannerService from '../../services/scanner.service';
import { transformData } from '../../utils/transformData';
import { useDebounce} from '../../hooks/useDabounce';
import useCheckMobileScreen from '../../hooks/useCheckTableScreen';

interface FilterParams {
  chain: SupportedChain | null;
  minVolume?: number;
  maxAge?: number;
  minMcap?: number;
  isNotHP: boolean;
}

const ScannerTableContainer: React.FC = () => {
  const isColumns = useCheckMobileScreen();
  const scannerService = ScannerService.getInstance();

  const [filters, setFilters] = useState<FilterParams>({
    chain: null,
    minVolume: undefined,
    maxAge: undefined,
    minMcap: undefined,
    isNotHP: true
  });
  const [priceUpdates, setPriceUpdates] = useState<Record<string, TokenPriceUpdate>>({});
  const [data, setData] = useState<TokenData[] | null>(null);

  const handlePriceUpdate = (update: TokenPriceUpdate) => {
    setPriceUpdates(prev => ({
      ...prev,
      [update.tokenAddress]: update
    }));
  };

  const getScanner = useCallback((filters: FilterParams) => {
     scannerService.getScannerResults(filters).then((data) => {
            setData(transformData(data?.pairs || []));

        }).catch((err) => console.error(err));
  }, [scannerService]);

  useEffect(() => {
    if(data) return;
    getScanner(filters);

  }, [filters, data, scannerService, getScanner]);

  useEffect(() => {
   
    return () => {
      scannerService.disconnect();
    };
  }, [scannerService]);

  const handleChainChange = (value: SupportedChain | null) => {
    setFilters(prev => ({ ...prev, chain: value }));
    getScanner({ ...filters, chain: value });
}

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
          <Card tabProps={{
            size: 'small'
          }} title="Trending Tokens">
            {data ? <TrendingTokensTable 
              filters={filters}
              data={data}
              priceUpdates={priceUpdates}
              onTokensLoad={(tokens) => {
                tokens.forEach(token => {
                  scannerService.subscribeToTokenUpdates(token, handlePriceUpdate);
                });
              }}
            />
 : <Skeleton active paragraph={{ rows: 10 }} />
}
          </Card>
        </Col>
        <Col span={isColumns ? 24 : 12}>
          <Card tabProps={{
            size: 'small'
          }} title="New Tokens">
            {data ? 
            <NewTokensTable
              filters={filters}
              data={data}
              priceUpdates={priceUpdates}
              onTokensLoad={(tokens) => {
                tokens.forEach(token => {
                  scannerService.subscribeToTokenUpdates(token, handlePriceUpdate);
                });
              }}
            /> : <Skeleton active paragraph={{ rows: 10 }} />
}
          </Card>
        </Col>
      </Flex>
    </div>
  );
};

export default ScannerTableContainer;