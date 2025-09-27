import { TokenData } from "../../../types";
import { formatPrice, formatValue, getColorByChange } from "../../../utils/formatters";

export const useNewTokensTableColumns = () => {
  return [
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
          title: 'Price Change (5m, 1h, 6h, 24h)',
          dataIndex: 'priceChangePcs',
          key: 'priceChangePcs',
          children: [{
            title: '5m',
            dataIndex: ['priceChangePcs', '5m'],
            key: 'priceChange5m',
            render: (priceChangePcs: number | undefined) => (
            <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
              {priceChangePcs}%
            </span>
          ),
          }, 
          {
            title: '1h',
            dataIndex: ['priceChangePcs', '1h'],
            key: 'priceChange1h',
            render: (priceChangePcs: number | undefined) => (
              <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
                {priceChangePcs}%
              </span>
            ),
          },
        {
          title: '6h',
          dataIndex: ['priceChangePcs', '6h'],
          key: 'priceChange6h',
          render: (priceChangePcs: number | undefined) => (
            <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
              {(priceChangePcs ?? 0)}%
            </span>
          ),
        }, {
          title: '24h',
          dataIndex: ['priceChangePcs', '24h'],
          key: 'priceChange24h',
          render: (priceChangePcs: number | undefined) => (
            <span style={{ color: getColorByChange(Number(priceChangePcs ?? 0)) }}>
              {priceChangePcs ?? 0}%
            </span>
          ),
        }]
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
}