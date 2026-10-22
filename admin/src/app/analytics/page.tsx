'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Bike, DollarSign, Package } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/format';

export default function AdminAnalyticsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi<any>('analytics/trends', { query: { period: 'monthly' } }).catch(() => null),
      adminApi<any>('analytics/best-sellers', { query: { limit: 5 } }).catch(() => null),
      adminApi<any>('analytics/low-stock', { query: { threshold: 10 } }).catch(() => null),
    ])
      .then(([trendsData, bestData, stockData]) => {
        if (trendsData?.trends) setTrends(trendsData.trends);
        if (bestData?.bestSellers) setBestSellers(bestData.bestSellers);
        if (stockData?.lowStockProducts) setLowStock(stockData.lowStockProducts);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      <div>
        <h1 className="text-[26px] font-bold text-fg tracking-tight">
          Executive Analytics & Fleet Performance
        </h1>
        <p className="text-[13px] text-muted">
          Authoritative telemetry, revenue conversion rates, and stock replenishment warnings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Selling Vehicles */}
        <div className="bg-night border border-line rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-lime" />
              <h2 className="font-semibold text-fg">Top Fleet Performers</h2>
            </div>
            <span className="font-mono text-[11px] text-muted">By Unit Velocity</span>
          </div>

          {bestSellers.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono text-[12px]">
              No best sellers recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {bestSellers.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lime w-4">#{idx + 1}</span>
                    <div>
                      <p className="font-medium text-fg">{item.name}</p>
                      <p className="font-mono text-[11px] text-dim">{item.totalQuantity} units sold</p>
                    </div>
                  </div>
                  <span className="font-mono text-fg font-bold">
                    {formatPrice(item.totalRevenue / 100, 'PKR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Replenishment Alerts */}
        <div className="bg-night border border-line rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-400" />
              <h2 className="font-semibold text-fg">Stock Replenishment Alerts</h2>
            </div>
            <span className="font-mono text-[11px] text-amber-400">Threshold: &lt; 10 units</span>
          </div>

          {lowStock.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono text-[12px]">
              All fleet models are well stocked above safety threshold.
            </div>
          ) : (
            <div className="divide-y divide-line">
              {lowStock.map((p, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-[13px]">
                  <div>
                    <p className="font-medium text-fg">{p.name}</p>
                    <p className="font-mono text-[11px] text-dim">SKU: {p.sku}</p>
                  </div>
                  <span className="font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded text-[11px]">
                    {p.inventory} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
