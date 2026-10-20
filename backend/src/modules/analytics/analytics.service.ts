import { Order, Product } from '../../database/models';

export async function getDashboardOverview(startDate?: Date, endDate?: Date): Promise<{
  totalOrders: number;
  grossSales: number; // in subunits, from paid orders
  netSales: number;   // grossSales - refunds
  totalRefunds: number;
  paidOrdersCount: number;
  unpaidOrdersCount: number;
  pendingOrdersCount: number;
}> {
  const dateFilter: Record<string, unknown> = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) (dateFilter.createdAt as any).$gte = startDate;
    if (endDate) (dateFilter.createdAt as any).$lte = endDate;
  }

  const [orderStats, paidSalesStats] = await Promise.all([
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          paidOrders: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
          },
          unpaidOrders: {
            $sum: { $cond: [{ $ne: ['$paymentStatus', 'paid'] }, 1, 0] },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'pending_payment'] }, 1, 0] },
          },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          ...dateFilter,
          paymentStatus: { $in: ['paid', 'partially_refunded', 'refunded'] },
        },
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: '$grandTotal' },
          totalRefunds: { $sum: '$refundedAmount' },
        },
      },
    ]),
  ]);

  const stats = orderStats[0] || {
    totalOrders: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    pendingOrders: 0,
  };

  const sales = paidSalesStats[0] || { grossSales: 0, totalRefunds: 0 };
  const netSales = Math.max(0, sales.grossSales - sales.totalRefunds);

  return {
    totalOrders: stats.totalOrders,
    grossSales: sales.grossSales,
    netSales,
    totalRefunds: sales.totalRefunds,
    paidOrdersCount: stats.paidOrders,
    unpaidOrdersCount: stats.unpaidOrders,
    pendingOrdersCount: stats.pendingOrders,
  };
}

export async function getBestSellingProducts(limit = 5): Promise<unknown[]> {
  return Product.find({ isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .select('name slug sku basePrice soldCount averageRating images');
}

export async function getLowStockProducts(threshold = 5): Promise<unknown[]> {
  return Product.find({
    isActive: true,
    inventoryPolicy: 'track',
    inventory: { $lte: threshold },
  })
    .select('name slug sku inventory reservedInventory basePrice colorVariants')
    .sort({ inventory: 1 });
}

export async function getSalesByDate(
  days = 30
): Promise<Array<{ date: string; sales: number; orders: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        paymentStatus: { $in: ['paid', 'partially_refunded', 'refunded'] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return stats.map((s) => ({
    date: s._id,
    sales: s.sales,
    orders: s.orders,
  }));
}
