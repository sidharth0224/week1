import React from 'react';
import { Package, Boxes, DollarSign, TrendingUp } from 'lucide-react';

export default function StatsCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="kpi-card">
            <div className="skeleton" style={{ height: '16px', width: '100px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '32px', width: '120px' }} />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: <Package size={18} />,
      unit: 'Active SKUs'
    },
    {
      title: 'Warehouse Units',
      value: stats?.totalStockQuantity ?? 0,
      icon: <Boxes size={18} />,
      unit: 'Units in Stock'
    },
    {
      title: 'Inventory Valuation',
      value: `$${(stats?.totalInventoryValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign size={18} />,
      unit: 'Total Asset Value'
    },
    {
      title: 'Average Unit Price',
      value: `$${(stats?.averagePrice || 0).toFixed(2)}`,
      icon: <TrendingUp size={18} />,
      unit: 'Mean Item Cost'
    }
  ];

  return (
    <div className="stats-grid animate-fade-in">
      {items.map((item, idx) => (
        <div key={idx} className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">{item.title}</span>
            <div className="kpi-icon">{item.icon}</div>
          </div>
          <div className="kpi-value">{item.value}</div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 500 }}>
            {item.unit}
          </div>
        </div>
      ))}
    </div>
  );
}
