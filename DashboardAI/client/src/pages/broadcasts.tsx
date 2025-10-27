import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Send, Image as ImageIcon } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

export default function Broadcasts() {
  const [message, setMessage] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setImageFile(file);
      console.log("Image uploaded:", file.name);
    } else {
      alert("Arquivo muito grande. Máximo 5MB.");
    }
  };

  const handleSend = () => {
    console.log("Sending broadcast:", { message, selectedTag, imageFile });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Disparo em Massa</h1>
        <p className="text-muted-foreground mt-1">
          Envie mensagens para múltiplos contatos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Disparo</CardTitle>
              <CardDescription>
                Configure sua mensagem e público-alvo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tag-filter">Público-Alvo</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger id="tag-filter" data-testid="select-target-audience">
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Contatos (2,547)</SelectItem>
                    <SelectItem value="cliente">Clientes (1,234)</SelectItem>
                    <SelectItem value="lead">Leads (856)</SelectItem>
                    <SelectItem value="prospect">Prospects (457)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  className="min-h-32"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  data-testid="textarea-message"
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-upload">Imagem (Opcional)</Label>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    data-testid="button-upload-image"
                  >
                    {imageFile ? (
                      <>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {imageFile.name}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload de Imagem
                      </>
                    )}
                  </Button>
                  {imageFile && (
                    <Button
                      variant="ghost"
                      onClick={() => setImageFile(null)}
                      data-testid="button-remove-image"
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-muted-foreground">
                  PNG ou JPG, máximo 5MB
                </p>
              </div>

              <Button 
                className="w-full bg-status-online hover:bg-status-online/90" 
                size="lg"
                onClick={handleSend}
                disabled={!message}
                data-testid="button-send-broadcast"
              >
                <Send className="h-5 w-5 mr-2" />
                Enfileirar Disparo
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Visualização da mensagem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-4 bg-card/50">
                {imageFile && (
                  <div className="mb-3 rounded-md overflow-hidden bg-muted h-32 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">
                  {message || "Sua mensagem aparecerá aqui..."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Destinatários</span>
                <span className="font-mono font-semibold">2,547</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa estimada</span>
                <span className="font-mono font-semibold text-status-online">~95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tempo estimado</span>
                <span className="font-mono font-semibold">~42 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
