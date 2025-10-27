import { StatusBadge } from '../status-badge';

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-4 p-8 bg-background">
      <StatusBadge status="active">Ativo</StatusBadge>
      <StatusBadge status="pending">Aguardando Pagamento</StatusBadge>
      <StatusBadge status="inactive">Inativo</StatusBadge>
      <StatusBadge status="success">Enviado</StatusBadge>
      <StatusBadge status="error">Falhou</StatusBadge>
    </div>
  );
}
