
import { Hono } from 'hono';
import vision from '@google-cloud/vision';

const ocrRouter = new Hono();

// Initialize the official Google Cloud Vision client.
// The SDK automatically detects the GOOGLE_APPLICATION_CREDENTIALS environment variable.
const visionClient = new vision.ImageAnnotatorClient();

ocrRouter.post('/scan-receipt', async (c) => {
  try {
    const { imageBase64 } = await c.req.json();

    if (!imageBase64) {
      return c.json({ error: 'No image provided' }, 400);
    }

    // The official SDK processes the Base64 image internally and in an optimized manner
    const [result] = await visionClient.textDetection({
      image: { content: imageBase64 }
    });

    const annotations = result.textAnnotations;
    
    if (!annotations || annotations.length === 0) {
      return c.json({ error: 'No text found' }, 400);
    }

    // Consolidated full text extracted from the receipt
    const fullText = annotations[0].description;

    // --- REGEX PROCESSING FOR THE RECEIPT (Example: JMAS Chihuahua) ---
    const contratoMatch = fullText?.match(/(?:Contrato|CONTRATO)[:\s]+(\d+)/);
    const claseMatch = fullText?.match(/(?:Clase|Tarifa)[:\s]+(Doméstica|Comercial|Industrial)/i);
    const consumoMatch = fullText?.match(/(?:Consumo|Lectura\sActual)[:\s]+(\d+)/i);

    return c.json({
      success: true,
      rawData: fullText, // Useful for verifying the full text in console/logs
      extractedFields: {
        numero_contrato: contratoMatch ? contratoMatch[1] : null,
        clase_usuario: claseMatch ? claseMatch[1] : null,
        lectura_consumo: consumoMatch ? consumoMatch[1] : null,
      }
    });

  } catch (error: any) {
    console.error("Error in Google Vision SDK:", error);
    return c.json({ 
      error: 'Internal error in OCR processing', 
      details: error.message 
    }, 500);
  }
});

export default ocrRouter;