import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, RefreshCw, Download } from "lucide-react";

export default function DebugPage() {
  const [webhookResponses, setWebhookResponses] = useState<any[]>([]);
  const [transformations, setTransformations] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      try {
        const responses = JSON.parse(localStorage.getItem('realtor360_webhook_responses') || '[]');
        setWebhookResponses(responses);
        
        const trans = JSON.parse(localStorage.getItem('realtor360_transformations') || '[]');
        setTransformations(trans);
      } catch (error) {
        console.error('Error loading debug data:', error);
      }
    };
    
    loadData();
  }, [refreshKey]);

  const clearWebhookResponses = () => {
    localStorage.removeItem('realtor360_webhook_responses');
    setRefreshKey(k => k + 1);
  };

  const clearTestResponses = () => {
    const responses = JSON.parse(localStorage.getItem('realtor360_webhook_responses') || '[]');
    const filtered = responses.filter((r: any) => r.transformationId !== 'test123');
    localStorage.setItem('realtor360_webhook_responses', JSON.stringify(filtered));
    setRefreshKey(k => k + 1);
  };

  const exportData = () => {
    const data = {
      webhookResponses,
      transformations,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realtor360-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Debug & Utilities</h1>

      <div className="mb-6 flex gap-4">
        <Button onClick={() => setRefreshKey(k => k + 1)} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button onClick={exportData} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Webhook Responses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Webhook Responses ({webhookResponses.length})</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearTestResponses}
                disabled={!webhookResponses.some(r => r.transformationId === 'test123')}
              >
                Clear Test Data
              </Button>
              <Button size="sm" variant="destructive" onClick={clearWebhookResponses}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {webhookResponses.length === 0 ? (
            <Alert>
              <AlertDescription>No webhook responses stored</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {webhookResponses.map((response, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <div className="font-mono text-sm">
                    <div><strong>ID:</strong> {response.transformationId}</div>
                    <div><strong>Image URL:</strong> {response.imageUrl || 'null'}</div>
                    <div><strong>Error:</strong> {response.error || 'null'}</div>
                    <div><strong>Timestamp:</strong> {new Date(response.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transformations */}
      <Card>
        <CardHeader>
          <CardTitle>Transformations ({transformations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {transformations.length === 0 ? (
            <Alert>
              <AlertDescription>No transformations stored</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {transformations.map((trans) => (
                <div key={trans.id} className="p-4 bg-muted rounded-lg">
                  <div className="font-mono text-sm">
                    <div><strong>ID:</strong> {trans.id}</div>
                    <div><strong>Status:</strong> <span className={
                      trans.status === 'completed' ? 'text-green-600' :
                      trans.status === 'failed' ? 'text-red-600' :
                      trans.status === 'processing' ? 'text-yellow-600' :
                      'text-gray-600'
                    }>{trans.status}</span></div>
                    <div><strong>Style:</strong> {trans.style}</div>
                    <div><strong>Created:</strong> {new Date(trans.createdAt).toLocaleString()}</div>
                    {trans.errorMessage && (
                      <div><strong>Error:</strong> {trans.errorMessage}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions for n8n */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>N8N Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-2">Para debugear en n8n, agrega estos nodos:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Después del webhook trigger, agrega un nodo <strong>Set</strong> para ver los datos recibidos</li>
                  <li>Antes del HTTP Request final, agrega otro nodo <strong>Set</strong> para ver qué se enviará</li>
                  <li>El callback URL debería construirse así:
                    <pre className="mt-2 p-2 bg-muted rounded text-xs">
{`{{$json.callbackUrl}}&transformationId={{$json.transformationId}}&imageUrl={{encodeURIComponent($json.imageUrl)}}`}
                    </pre>
                  </li>
                  <li>Asegúrate de que el método HTTP sea GET y no POST para el callback</li>
                </ol>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <p className="font-semibold mb-2">Datos esperados del webhook:</p>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
{`{
  "transformationId": "trans_XXXXXXXXXXXXX",
  "imageUrl": "https://drive.google.com/...",
  "callbackUrl": "https://silly-pothos-e6feaa.netlify.app/webhook-callback?type=transformation"
}`}
                </pre>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}