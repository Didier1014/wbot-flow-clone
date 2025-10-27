import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

//todo: remove mock functionality
const mockContacts = [
  { id: 1, name: "Maria Silva", phone: "+55 11 98765-4321", tag: "Cliente", lastMessage: "2h atrás" },
  { id: 2, name: "João Santos", phone: "+55 21 99876-5432", tag: "Lead", lastMessage: "5h atrás" },
  { id: 3, name: "Ana Costa", phone: "+55 11 91234-5678", tag: "Cliente", lastMessage: "1d atrás" },
  { id: 4, name: "Pedro Oliveira", phone: "+55 31 98765-1234", tag: "Prospect", lastMessage: "2d atrás" },
  { id: 5, name: "Carla Souza", phone: "+55 41 99123-4567", tag: "Cliente", lastMessage: "3d atrás" },
];

const tagColors: Record<string, string> = {
  Cliente: "bg-status-online/10 text-status-online border-status-online/20",
  Lead: "bg-primary/10 text-primary border-primary/20",
  Prospect: "bg-status-away/10 text-status-away border-status-away/20",
};

export default function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua lista de contatos
          </p>
        </div>
        <Button data-testid="button-add-contact" onClick={() => console.log("Add contact")}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Lista de Contatos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-contacts"
                />
              </div>
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-tag">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Tags</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Última Mensagem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContacts.map((contact) => (
                  <TableRow key={contact.id} data-testid={`row-contact-${contact.id}`}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tagColors[contact.tag]}>
                        {contact.tag}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{contact.lastMessage}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-view-${contact.id}`}
                        onClick={() => console.log("View contact:", contact.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
