import { TokenData } from "../../../types";
import { formatPrice, formatValue, getColorByChange } from "../../../utils/formatters";

export const useTrendingTokensTableColumns = () => {
    return [
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
      title: 'Price Change (5m, 1h, 6h, 24h)',
      dataIndex: 'priceChangePcs',
      key: 'priceChangePcs',
      children: [{
        title: '5m',
        dataIndex: ['priceChangePcs', '5m'],
        key: 'priceChange5m',
        sorter: (a: TokenData, b: TokenData) => Number(a.priceChangePcs?.['5m'] ?? 0) - Number(b.priceChangePcs?.['5m'] ?? 0),
        render: (priceChangePcs: number | undefined) => (
        <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
          {priceChangePcs ?? 0}%
        </span>
      ),
      }, 
      {
        title: '1h',
        dataIndex: ['priceChangePcs', '1h'],
        key: 'priceChange1h',
        sorter: (a: TokenData, b: TokenData) => Number(a.priceChangePcs?.['1h'] ?? 0) - Number(b.priceChangePcs?.['1h'] ?? 0),
        render: (priceChangePcs: number | undefined) => (
          <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
            {(Number(priceChangePcs ?? 0)).toFixed(2)}%
          </span>
        ),
      },
    {
      title: '6h',
      dataIndex: ['priceChangePcs', '6h'],
      key: 'priceChange6h',
      sorter: (a: TokenData, b: TokenData) => Number(a.priceChangePcs?.['6h'] ?? 0) - Number(b.priceChangePcs?.['6h'] ?? 0),
      render: (priceChangePcs: number | undefined) => (
        <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
          {priceChangePcs}%
        </span>
      ),
    }, {
      title: '24h',
      dataIndex: ['priceChangePcs', '24h'],
      key: 'priceChange24h',
      sorter: (a: TokenData, b: TokenData) => Number(a.priceChangePcs?.['24h'] ?? 0) - Number(b.priceChangePcs?.['24h'] ?? 0),
      render: (priceChangePcs: number | undefined) => (
        <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
          {priceChangePcs}%
        </span>
      ),
    }]
    },
    {
      title: 'Liquidity',
      dataIndex: ['liquidity', 'current'],
      key: 'liquidity',
      sorter: (a: TokenData, b: TokenData) => a.liquidity.current - b.liquidity.current,
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
      sorter: (a: TokenData, b: TokenData) => (a.transactions.buys + a.transactions.sells) - (b.transactions.buys + b.transactions.sells),
      render: (record: TokenData) => (
        <span>
          <span style={{ color: '#52c41a' }}>{record.transactions.buys}</span>
          {' / '}
          <span style={{ color: '#f5222d' }}>{record.transactions.sells}</span>
        </span>
      ),
    },
  ];

}