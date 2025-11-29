
import { FieldType, FormField, GeneratedRecord } from '../types';

// Helper function to fetch HTML with fallback proxies
const fetchFormHTML = async (url: string): Promise<string> => {
  let targetUrl = url;
  
  // Clean URL and ensure viewform
  try {
    const urlObj = new URL(url);
    // If it points to formResponse (submission) or analytics, switch to viewform (schema)
    if (urlObj.pathname.includes('/formResponse')) {
        urlObj.pathname = urlObj.pathname.replace('/formResponse', '/viewform');
    } else if (urlObj.pathname.includes('/viewanalytics')) {
        urlObj.pathname = urlObj.pathname.replace('/viewanalytics', '/viewform');
    }
    // If user pasted an edit link, try to switch to viewform
    if (urlObj.pathname.includes('/edit')) {
         urlObj.pathname = urlObj.pathname.replace('/edit', '/viewform');
    }
    // Remove parameters that might confuse proxies or google
    urlObj.search = '';
    targetUrl = urlObj.toString();
  } catch (e) {
    // Invalid URL format, proceed with original string
  }

  const encodedUrl = encodeURIComponent(targetUrl);
  const timestamp = Date.now();

  // PRIORITIZE JSON-WRAPPED PROXIES
  // Raw proxies often strip headers or get blocked by Google's strict framing policies.
  // JSON-wrapped proxies return the HTML as a string inside a JSON object, which usually bypasses these blocks.
  const proxies = [
    // Strategy 1: AllOrigins JSON (Most reliable)
    { url: `https://api.allorigins.win/get?url=${encodedUrl}&disableCache=true`, name: "AllOrigins JSON", isJson: true },
    // Strategy 2: CodeTabs (Reliable)
    { url: `https://api.codetabs.com/v1/proxy?quest=${encodedUrl}`, name: "CodeTabs", isJson: false },
    // Strategy 3: CorsProxy.io (Fast but often blocked)
    { url: `https://corsproxy.io/?${encodedUrl}`, name: "CorsProxy", isJson: false },
    // Strategy 4: ThingProxy (Fallback)
    { url: `https://thingproxy.freeboard.io/fetch/${encodedUrl}`, name: "ThingProxy", isJson: false },
  ];

  let lastError;

  for (const proxy of proxies) {
    try {
      // console.log(`Attempting proxy: ${proxy.name}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(proxy.url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
          console.warn(`Proxy ${proxy.name} returned status ${response.status}`);
          continue;
      }

      let text = '';
      if (proxy.isJson) {
          const data = await response.json();
          text = data.contents; // AllOrigins uses 'contents'
      } else {
          text = await response.text();
      }
      
      if (!text || text.length < 500) continue; // Too short to be valid

      // Check for specific Google Form error messages indicating private forms
      if (text.includes('docs-google-forms-error-message') || text.includes('You need permission')) {
         throw new Error("Form is private. Please check sharing settings.");
      }

      // Basic validation that we got the form data
      if (text.includes('FB_PUBLIC_LOAD_DATA_')) {
          return text;
      } else {
          // console.warn(`Proxy ${proxy.name} returned content but no FB_PUBLIC_LOAD_DATA_ found.`);
      }
    } catch (e: any) {
      lastError = e;
      if (e.message && e.message.includes("Form is private")) {
          throw e; // Stop trying other proxies if we know it's private
      }
      // console.warn(`Proxy ${proxy.name} failed:`, e.message);
    }
  }

  throw new Error("Unable to fetch form content. The form might be private or blocking automated access. Try opening the form in an Incognito window to ensure it is public.");
};

export const analyzeGoogleForm = async (formUrl: string): Promise<FormField[]> => {
  try {
    const html = await fetchFormHTML(formUrl);
    
    // Robust Regex to find the data array.
    // Google sometimes minifies this as: var FB_PUBLIC_LOAD_DATA_=[null,[...
    // We look for the variable assignment and capture until the terminating semicolon or new line.
    const scriptMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]+?\])\s*;/);
    
    let jsonString = '';
    
    if (scriptMatch && scriptMatch[1]) {
        jsonString = scriptMatch[1];
    } else {
        // Fallback regex for cases without semicolon
        const fallbackMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]+?\])\s*$/m);
        if (fallbackMatch && fallbackMatch[1]) {
            jsonString = fallbackMatch[1];
        }
    }

    if (!jsonString) {
      throw new Error("Could not parse Google Form structure. Is this a valid public form?");
    }

    let formData;
    try {
        formData = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse error on form data", e);
        throw new Error("Failed to parse form JSON data.");
    }

    if (!formData || !formData[1] || !formData[1][1]) {
        throw new Error("Form appears to be empty or closed.");
    }

    const questions = formData[1][1];
    const mappedFields: FormField[] = [];

    questions.forEach((q: any) => {
      if (!q) return;
      
      // q[1]: Label
      // q[3]: Type ID
      // q[4]: Details -> [ [EntryID, Options, ...] ]
      const label = q[1];
      const typeId = q[3];
      const details = q[4];

      if (!label || !details || !details[0]) return;

      const entryId = details[0][0]; // entry.123456
      const rawOptions = details[0][1]; 

      let fieldType = FieldType.TEXT;
      let options: string[] = [];

      // Smart Label Detection for Text fields
      const labelLower = label.toLowerCase();

      switch (typeId) {
        case 0: // Short Answer
          if (labelLower.includes('email')) fieldType = FieldType.EMAIL;
          else if (labelLower.includes('number') || labelLower.includes('age') || labelLower.includes('count') || labelLower.includes('roll') || labelLower.includes('year')) fieldType = FieldType.NUMBER;
          else if (labelLower.includes('date') || labelLower.includes('dob')) fieldType = FieldType.DATE;
          else if (labelLower.includes('time')) fieldType = FieldType.TIME;
          else fieldType = FieldType.TEXT;
          break;
        case 1: // Paragraph
          fieldType = FieldType.PARAGRAPH;
          break;
        case 2: // Multiple Choice
        case 3: // Dropdown
          fieldType = FieldType.SELECT;
          if (rawOptions && Array.isArray(rawOptions)) {
             options = rawOptions.map((o: any) => o[0]).filter((s: any) => typeof s === 'string' && s !== '');
          }
          break;
        case 4: // Checkboxes
          fieldType = FieldType.CHECKBOX;
          if (rawOptions && Array.isArray(rawOptions)) {
             options = rawOptions.map((o: any) => o[0]).filter((s: any) => typeof s === 'string' && s !== '');
          }
          break;
        case 5: // Linear Scale
          fieldType = FieldType.LINEAR_SCALE;
          break;
        case 7: // Grid (Not fully supported, treating as Text for safety)
          fieldType = FieldType.TEXT; 
          break;
        case 9: // Date
          fieldType = FieldType.DATE;
          break;
        case 10: // Time
          fieldType = FieldType.TIME;
          break;
        default:
          fieldType = FieldType.TEXT;
      }

      mappedFields.push({
        id: `field_${entryId}`,
        label: label,
        type: fieldType,
        options: options.length > 0 ? options : undefined,
        googleEntryId: entryId
      });
    });

    return mappedFields;

  } catch (error) {
    console.error("Form Analysis Error:", error);
    throw error;
  }
};

export const submitToGoogleForm = async (
  formUrl: string, 
  record: GeneratedRecord, 
  fields: FormField[]
): Promise<boolean> => {
  try {
    let submitUrl = formUrl;
    // Ensure we post to formResponse
    if (formUrl.includes('/viewform')) {
        submitUrl = formUrl.replace(/\/viewform.*/, '/formResponse');
    } else if (formUrl.includes('/d/e/') && !formUrl.endsWith('/formResponse')) {
        // Ensure we don't double slash
        if (submitUrl.endsWith('/')) submitUrl = submitUrl.slice(0, -1);
        submitUrl += '/formResponse';
    }
    // Fallback: replace viewanalytics if present
    submitUrl = submitUrl.replace(/\/viewanalytics.*/, '/formResponse');

    const formData = new FormData();
    
    fields.forEach(field => {
      if (field.googleEntryId) {
        const value = record[field.id];
        const entryKey = `entry.${field.googleEntryId}`;
        
        if (Array.isArray(value)) {
            value.forEach(v => formData.append(entryKey, v));
        } else {
             formData.append(entryKey, String(value));
        }
      }
    });

    await fetch(submitUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });

    return true;
  } catch (error) {
    console.error("Submission Failed:", error);
    return false;
  }
};

export const submitToGoogleSheet = async (url: string, record: GeneratedRecord): Promise<boolean> => {
  try {
    // Warn if the user provides a standard Sheet URL, as it won't accept POST
    if (url.includes('docs.google.com/spreadsheets')) {
        console.warn("Standard Google Sheet URLs do not accept POST data directly. Use a Google Apps Script Web App URL for best results.");
    }

    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Important for Google Apps Script Web Apps
      // headers: { 'Content-Type': 'application/json' }, // Not allowed in no-cors, script must parse body
      body: JSON.stringify(record),
    });
    
    return true; 
  } catch (error) {
    console.error("Sheet Submission Failed:", error);
    return false;
  }
};

/**
 * Generates a standalone JavaScript snippet that the user can paste 
 * into the browser console on the Google Form page to bypass CORS/Proxy issues.
 */
export const generateConsoleScript = (fields: FormField[], count: number): string => {
  // Filter only linked fields to keep script clean
  const linkedFields = fields.filter(f => f.googleEntryId);
  
  return `
// ==========================================
// FORMQA AUTO-SUBMITTER SCRIPT
// Instructions:
// 1. Open your Google Form in a new tab.
// 2. Press F12 to open Developer Tools.
// 3. Go to the "Console" tab.
// 4. Paste this entire code and press Enter.
// ==========================================

(async function() {
  const CONFIG = {
    targetCount: ${count},
    delayMs: 1000,
    fields: ${JSON.stringify(linkedFields.map(f => ({
      label: f.label,
      type: f.type,
      options: f.options,
      googleEntryId: f.googleEntryId
    })))}
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  
  const firsts = ["Aarav", "Vihaan", "Aditya", "Arjun", "Rohan", "Diya", "Ananya", "Saanvi", "Priya", "Neha"];
  const lasts = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Nair"];
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai"];
  const domains = ["gmail.com", "yahoo.co.in", "outlook.com"];

  console.log("%c🤖 FormQA Starting...", "color: #8b5cf6; font-weight: bold; font-size: 16px;");
  console.log("Target: " + CONFIG.targetCount + " records");

  let successCount = 0;

  for(let i=0; i<CONFIG.targetCount; i++) {
    const formData = new FormData();
    
    CONFIG.fields.forEach(field => {
      let value = "";
      const label = field.label.toLowerCase();
      
      if(field.options && field.options.length) {
        value = pick(field.options);
      } else if (field.type === 'Email' || label.includes('email')) {
        value = \`\${pick(firsts).toLowerCase()}.\${pick(lasts).toLowerCase()}\${randInt(1,99)}@\${pick(domains)}\`;
      } else if (field.type === 'Number' || label.includes('phone') || label.includes('mobile')) {
        value = randInt(6000000000, 9999999999);
      } else if (label.includes('roll')) {
        value = randInt(102203000, 102505999);
      } else if (label.includes('name')) {
        value = \`\${pick(firsts)} \${pick(lasts)}\`;
      } else if (label.includes('city') || label.includes('address')) {
        value = pick(cities);
      } else if (field.type === 'Date') {
         value = \`2024-\${String(randInt(1,12)).padStart(2,'0')}-\${String(randInt(1,28)).padStart(2,'0')}\`;
      } else {
        value = \`Answer \${randInt(100,999)}\`;
      }
      
      formData.append('entry.' + field.googleEntryId, value);
    });

    // Use current location but ensure we hit formResponse
    const action = window.location.href.replace(/\\/viewform.*/, '/formResponse')
                                       .replace(/\\/viewanalytics.*/, '/formResponse')
                                       .replace(/\\/edit.*/, '/formResponse');

    try {
      await fetch(action, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      successCount++;
      console.log(\`%c✅ Record \${i+1}/\${CONFIG.targetCount} sent\`, "color: #10b981");
    } catch(e) {
      console.error("Failed to send record", e);
    }
    
    // Random delay to be nice
    await new Promise(r => setTimeout(r, CONFIG.delayMs + Math.random() * 500));
  }
  
  console.log(\`%c🎉 Job Complete! Sent \${successCount} records.\`, "color: #8b5cf6; font-weight: bold; font-size: 16px");
  alert(\`FormQA: Generated and sent \${successCount} responses!\`);
})();
`;
};
