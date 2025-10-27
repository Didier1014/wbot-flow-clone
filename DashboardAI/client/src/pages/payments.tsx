import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

//todo: remove mock functionality
const mockPaymentHistory = [
  { id: 1, date: "2024-10-20", status: "success", amount: "R$ 49,90" },
  { id: 2, date: "2024-09-20", status: "success", amount: "R$ 49,90" },
  { id: 3, date: "2024-08-20", status: "success", amount: "R$ 49,90" },
];

export default function Payments() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setUploadedFile(file);
      console.log("File uploaded:", file.name);
    } else {
      alert("Arquivo muito grande. Máximo 5MB.");
    }
  };

  const handleSubmit = () => {
    if (uploadedFile) {
      console.log("Submitting proof:", uploadedFile.name);
      alert("Comprovante enviado com sucesso!");
      setUploadedFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comprovantes de Pagamento</h1>
        <p className="text-muted-foreground mt-1">
          Envie seus comprovantes para ativação
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Comprovante</CardTitle>
            <CardDescription>
              Faça upload do print do pagamento (PNG ou JPG, máx. 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="proof-upload">Comprovante</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate">
                {uploadedFile ? (
                  <div className="space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                      data-testid="button-remove-proof"
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Clique para fazer upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG ou JPG até 5MB
                      </p>
                    </div>
                  </div>
                )}
                <Input
                  id="proof-upload"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleFileUpload}
                  data-testid="input-upload-proof"
                />
                {!uploadedFile && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById("proof-upload")?.click()}
                    data-testid="button-select-file"
                  >
                    Selecionar Arquivo
                  </Button>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!uploadedFile}
              onClick={handleSubmit}
              data-testid="button-submit-proof"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Enviar Comprovante
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Comprovantes enviados anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPaymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                  data-testid={`payment-${payment.id}`}
                >
                  <div>
                    <p className="font-medium">{payment.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <StatusBadge status={payment.status as "success"}>
                    Aprovado
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
