import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  workspaceName?: string;
  userName?: string;
  userAvatar?: string;
  status?: "active" | "pending";
}

export function Header({ 
  workspaceName = "Meu Workspace",
  userName = "Usuário",
  userAvatar,
  status = "pending"
}: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div>
          <h1 className="text-lg font-semibold">{workspaceName}</h1>
          <StatusBadge status={status}>
            {status === "active" ? "Ativo" : "Aguardando Pagamento"}
          </StatusBadge>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
            3
          </Badge>
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
          <Avatar data-testid="avatar-user">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
