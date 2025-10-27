import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Play, Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

//todo: remove mock functionality
const mockFlows = [
  {
    id: 1,
    name: "Boas-vindas Novos Clientes",
    description: "Fluxo automático de boas-vindas",
    status: "active",
    steps: 5,
    lastEdited: "2h atrás",
  },
  {
    id: 2,
    name: "Follow-up Vendas",
    description: "Acompanhamento pós-venda",
    status: "inactive",
    steps: 8,
    lastEdited: "1d atrás",
  },
  {
    id: 3,
    name: "Recuperação de Carrinho",
    description: "Lembrete de carrinho abandonado",
    status: "active",
    steps: 4,
    lastEdited: "3d atrás",
  },
];

export default function Flows() {
  const [flows] = useState(mockFlows);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxos de Automação</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie seus fluxos automatizados
          </p>
        </div>
        <Button data-testid="button-new-flow" onClick={() => console.log("New flow")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Fluxo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <Card key={flow.id} className="hover-elevate" data-testid={`flow-card-${flow.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <CardDescription>{flow.description}</CardDescription>
                </div>
                <StatusBadge status={flow.status as "active" | "inactive"}>
                  {flow.status === "active" ? "Ativo" : "Inativo"}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Etapas</span>
                <span className="font-mono font-semibold">{flow.steps}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Última edição</span>
                <span>{flow.lastEdited}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  data-testid={`button-edit-${flow.id}`}
                  onClick={() => console.log("Edit flow:", flow.id)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`button-test-${flow.id}`}
                  onClick={() => console.log("Test flow:", flow.id)}
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid={`button-delete-${flow.id}`}
                  onClick={() => console.log("Delete flow:", flow.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle>Criar Novo Fluxo</CardTitle>
          <CardDescription>
            Use o builder visual para criar fluxos automatizados complexos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Builder de Fluxos Visual</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Arraste e solte nós para criar fluxos com mensagens de texto, imagens,
              botões, condições e muito mais.
            </p>
            <Button onClick={() => console.log("Open flow builder")}>
              <Plus className="h-4 w-4 mr-2" />
              Abrir Builder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
