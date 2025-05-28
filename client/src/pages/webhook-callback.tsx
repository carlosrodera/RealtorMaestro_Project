import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function WebhookCallback() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Get query parameters
    const params = new URLSearchParams(window.location.search);
    const transformationId = params.get('transformationId');
    const descriptionId = params.get('descriptionId');
    const imageUrl = params.get('imageUrl');
    const text = params.get('text');
    const error = params.get('error');
    const type = params.get('type');
    
    // Process webhook data
    if (type === 'transformation' && transformationId) {
      // Dispatch event for transformation complete
      window.dispatchEvent(new CustomEvent('n8n-webhook-response', {
        detail: {
          transformationId,
          imageUrl,
          error
        }
      }));
      
      // Also post message for iframe scenarios
      window.parent.postMessage({
        type: 'n8n-transformation-complete',
        payload: {
          transformationId,
          imageUrl,
          error
        }
      }, '*');
      
      // Redirect to home after processing
      setTimeout(() => {
        setLocation('/transformations');
      }, 1000);
      
    } else if (type === 'description' && descriptionId) {
      // Dispatch event for description complete
      window.dispatchEvent(new CustomEvent('n8n-webhook-response', {
        detail: {
          descriptionId,
          text,
          error
        }
      }));
      
      // Also post message for iframe scenarios
      window.parent.postMessage({
        type: 'n8n-description-complete',
        payload: {
          descriptionId,
          text,
          error
        }
      }, '*');
      
      // Redirect to home after processing
      setTimeout(() => {
        setLocation('/descriptions');
      }, 1000);
    } else {
      // Invalid webhook, redirect to home
      setLocation('/');
    }
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Procesando respuesta</h2>
          <p className="text-gray-600">Recibiendo datos del servidor...</p>
        </div>
      </div>
    </div>
  );
}