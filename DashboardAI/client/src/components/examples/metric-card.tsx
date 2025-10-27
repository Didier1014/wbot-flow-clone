import { MetricCard } from '../metric-card';
import { Users, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-background">
      <MetricCard
        title="Total de Contatos"
        value="2,547"
        icon={Users}
        change={{ value: 12.5, trend: "up" }}
      />
      <MetricCard
        title="Disparos Hoje"
        value="864"
        icon={MessageSquare}
        change={{ value: 8.2, trend: "up" }}
      />
      <MetricCard
        title="Taxa de Entrega"
        value="94.8%"
        icon={CheckCircle}
        change={{ value: 2.1, trend: "up" }}
      />
      <MetricCard
        title="Conversões"
        value="156"
        icon={TrendingUp}
        change={{ value: 5.3, trend: "down" }}
      />
    </div>
  );
}
