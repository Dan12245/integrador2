import { Hono } from 'hono';

const ocrRouter = new Hono<{ Bindings: { GOOGLE_APPLICATION_CREDENTIALS: string } }>();

// Helper to sign JWT using Web Crypto API for Google Service Accounts
async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const credentials = JSON.parse(serviceAccountJson);
  const { client_email, private_key } = credentials;
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  const base64UrlEncode = (obj: any) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const jwtHeader = base64UrlEncode(header);
  const jwtClaim = base64UrlEncode(claim);
  const unsignedJwt = `${jwtHeader}.${jwtClaim}`;
  
  // Extract and decode private key
  const pemHeader = '-----BEGIN PRIVATE KEY-----';
  const pemFooter = '-----END PRIVATE KEY-----';
  if (!private_key.includes(pemHeader)) throw new Error('Invalid private key format');
  
  const pemContents = private_key.substring(
    private_key.indexOf(pemHeader) + pemHeader.length,
    private_key.indexOf(pemFooter)
  ).replace(/\s/g, '');
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedJwt)
  );
  
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  const jwt = `${unsignedJwt}.${signature}`;
  
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  
  const tokenData = await tokenResponse.json() as any;
  if (!tokenData.access_token) {
    throw new Error('Failed to get Google access token: ' + JSON.stringify(tokenData));
  }
  
  return tokenData.access_token;
}

ocrRouter.post('/scan-receipt', async (c) => {
  try {
    const { imageBase64 } = await c.req.json();

    if (!imageBase64) {
      return c.json({ error: 'No image provided' }, 400);
    }

    const credentialsJson = c.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentialsJson) {
      return c.json({ error: 'Server configuration error: Missing Google credentials' }, 500);
    }

    const token = await getGoogleAccessToken(credentialsJson);

    // Call Google Vision REST API directly
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION' }]
          }
        ]
      })
    });

    const result = await visionResponse.json() as any;

    if (result.error) {
      return c.json({ error: 'Google Vision API Error', details: result.error.message }, 500);
    }

    const annotations = result.responses?.[0]?.textAnnotations;
    
    if (!annotations || annotations.length === 0) {
      return c.json({ error: 'No text found' }, 400);
    }

    // Consolidated full text extracted from the receipt
    const fullText = annotations[0].description;

    // --- REGEX PROCESSING FOR THE RECEIPT (Example: JMAS Chihuahua) ---
    const contractMatch = fullText?.match(/(?:Contrato|CONTRATO)[:\s]+([A-Za-z0-9\-]+)/i);
    const userTypeMatch = fullText?.match(/(?:Clase\s+Usuario)[:\s]+([^\r\n]+)/i);
    const serviceDateMatch = fullText?.match(/(?:Fecha\s+Servicio)[:\s]+([^\r\n]+)/i);
    const nameMatch = fullText?.match(/(?:Nombre)[:\s]+([^\r\n]+)/i);
    const addressMatch = fullText?.match(/(?:Direcci[oó]n)[:\s]+([^\r\n]+)/i);
    const consumptionMatch = fullText?.match(/\bConsumo[:\s]+(\d+)/i);

    return c.json({
      success: true,
      rawData: fullText, // Useful for verifying the full text in console/logs
      extractedFields: {
        contract_number: contractMatch ? contractMatch[1].trim() : null,
        user_type: userTypeMatch ? userTypeMatch[1].trim() : null,
        service_date: serviceDateMatch ? serviceDateMatch[1].trim() : null,
        name: nameMatch ? nameMatch[1].trim() : null,
        address: addressMatch ? addressMatch[1].trim() : null,
        consumption_reading: consumptionMatch ? consumptionMatch[1].trim() : null,
      }
    });

  } catch (error: any) {
    console.error("Error in OCR processing:", error);
    return c.json({ 
      error: 'Internal error in OCR processing', 
      details: error.message 
    }, 500);
  }
});

export default ocrRouter;