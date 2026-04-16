'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { Payment } from '@/app/lib/financeService';

interface FinancialDashboardProps {
  payments: Payment[];
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ payments }) => {
  const [timeRange, setTimeRange] = useState(6);
  const totalRevenue = payments
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRevenue = payments
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments.length;
  const paidCount = payments.filter(p => p.status === 'pago').length;
  const pendingCount = payments.filter(p => p.status === 'pendente').length;

  // Prepare data for the chart (last 6 months)
  const monthlyData = React.useMemo(() => {
    const months: { [key: string]: number } = {};
    const now = new Date();
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      months[monthName] = 0;
    }

    payments.forEach(p => {
      if (p.status === 'pago') {
        const d = new Date(p.date);
        const monthName = d.toLocaleString('pt-BR', { month: 'short' });
        if (months[monthName] !== undefined) {
          months[monthName] += p.amount;
        }
      }
    });

    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [payments, timeRange]);

  const stats = [
    {
      title: 'Receita Total',
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Pendente',
      value: `R$ ${pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: '-2.4%',
      trendUp: false
    },
    {
      title: 'Consultas Pagas',
      value: paidCount.toString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Taxa de Conversão',
      value: totalTransactions > 0 ? `${Math.round((paidCount / totalTransactions) * 100)}%` : '0%',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+1.1%',
      trendUp: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-2xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-[#0B2B24]">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-[#0B2B24]">Receita Mensal</h3>
              <p className="text-sm text-slate-500">Desempenho dos últimos 6 meses</p>
            </div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 px-4 py-2 focus:ring-2 focus:ring-[#22B391]"
            >
              <option value={6}>Últimos 6 meses</option>
              <option value={12}>Últimos 12 meses</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#22B391' : '#E2E8F0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-[#0B2B24] mb-6">Resumo de Status</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#22B391]" />
                <span className="text-sm font-bold text-slate-600">Pago</span>
              </div>
              <span className="text-sm font-black text-[#0B2B24]">{paidCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm font-bold text-slate-600">Pendente</span>
              </div>
              <span className="text-sm font-black text-[#0B2B24]">{pendingCount}</span>
            </div>
            
            <div className="pt-6 border-top border-slate-100">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Atenção</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Você tem {pendingCount} pagamentos pendentes que totalizam R$ {pendingRevenue.toLocaleString('pt-BR')}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
