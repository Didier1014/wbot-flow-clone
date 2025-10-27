import { MetricCard } from "@/components/metric-card";
import { Users, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

//todo: remove mock functionality
const mockChartData = [
  { name: "Dom", value: 120 },
  { name: "Seg", value: 245 },
  { name: "Ter", value: 189 },
  { name: "Qua", value: 312 },
  { name: "Qui", value: 278 },
  { name: "Sex", value: 356 },
  { name: "Sáb", value: 164 },
];

const mockRecentBroadcasts = [
  { id: 1, name: "Promoção Semanal", sent: 856, delivered: 812, time: "2h atrás" },
  { id: 2, name: "Lançamento Produto", sent: 1243, delivered: 1189, time: "5h atrás" },
  { id: 3, name: "Newsletter Mensal", sent: 2547, delivered: 2401, time: "1d atrás" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das suas campanhas e métricas
          </p>
        </div>
        <Button size="lg" className="bg-status-online hover:bg-status-online/90" data-testid="button-new-broadcast">
          <MessageSquare className="h-5 w-5 mr-2" />
          Novo Disparo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Disparos da Semana</CardTitle>
            <CardDescription>Total de mensagens enviadas por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Entrega</CardTitle>
            <CardDescription>Comparativo de envio vs entrega</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disparos Recentes</CardTitle>
          <CardDescription>Últimas campanhas enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentBroadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover-elevate"
                data-testid={`broadcast-${broadcast.id}`}
              >
                <div>
                  <h4 className="font-semibold">{broadcast.name}</h4>
                  <p className="text-sm text-muted-foreground">{broadcast.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">
                    <span className="text-status-online">{broadcast.delivered}</span>
                    <span className="text-muted-foreground"> / {broadcast.sent}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((broadcast.delivered / broadcast.sent) * 100).toFixed(1)}% entregue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
