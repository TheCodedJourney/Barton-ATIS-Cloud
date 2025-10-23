import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/atis/current", async (req, res) => {
    try {
      const data = await storage.getCurrentAtis();
      res.json(data);
    } catch (error) {
      console.error("Error fetching current ATIS:", error);
      res.status(500).json({ error: "Failed to fetch ATIS data" });
    }
  });

  app.get("/api/atis/historical", async (req, res) => {
    try {
      const { from, to } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ error: "Missing from or to parameter" });
      }

      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const data = await storage.getHistoricalData(fromDate, toDate);
      res.json(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  app.post("/api/documents/notams", async (req, res) => {
    try {
      const { categories } = req.body;
      
      if (!categories || !Array.isArray(categories)) {
        return res.status(400).json({ error: "Invalid categories" });
      }

      const notams = await storage.getActiveNotams();
      const filteredNotams = notams.filter(notam => 
        categories.some(cat => notam.category.toLowerCase().includes(cat.toLowerCase()))
      );

      const pdfContent = generateNotamPDF(filteredNotams);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=notams.pdf');
      res.send(Buffer.from(pdfContent));
    } catch (error) {
      console.error("Error generating NOTAM PDF:", error);
      res.status(500).json({ error: "Failed to generate NOTAM PDF" });
    }
  });

  app.post("/api/documents/aerodrome", async (req, res) => {
    try {
      const { sections } = req.body;
      
      if (!sections || !Array.isArray(sections)) {
        return res.status(400).json({ error: "Invalid sections" });
      }

      const pdfContent = generateAerodromePDF(sections);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=aerodrome_info.pdf');
      res.send(Buffer.from(pdfContent));
    } catch (error) {
      console.error("Error generating aerodrome PDF:", error);
      res.status(500).json({ error: "Failed to generate aerodrome PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateNotamPDF(notams: any[]): string {
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 500
>>
stream
BT
/F1 16 Tf
50 750 Td
(BARTON AERODROME - EGCB) Tj
0 -30 Td
/F1 12 Tf
(NOTAM Document) Tj
0 -30 Td
/F1 10 Tf
(Generated: ${new Date().toISOString()}) Tj
0 -40 Td
${notams.map((notam, i) => `
0 -20 Td
(${i + 1}. ${notam.category}: ${notam.content.substring(0, 60)}) Tj
`).join('')}
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
900
%%EOF`;
  return content;
}

function generateAerodromePDF(sections: string[]): string {
  const aerodromeInfo = {
    general: "Barton Aerodrome (EGCB) - General aviation aerodrome",
    runways: "08L/26R: 710m, 08R/26L: 595m, 02/20: 490m, 13/31: 457m",
    frequencies: "Tower: 120.250 MHz, AFIS: 120.250 MHz",
    procedures: "Standard circuit height: 1000ft AAL, Left-hand circuits except where noted",
  };

  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 500
>>
stream
BT
/F1 16 Tf
50 750 Td
(BARTON AERODROME - EGCB) Tj
0 -30 Td
/F1 12 Tf
(Aerodrome Information) Tj
0 -30 Td
/F1 10 Tf
(Generated: ${new Date().toISOString()}) Tj
0 -40 Td
${sections.map((section, i) => `
0 -25 Td
/F1 11 Tf
(${section.toUpperCase()}) Tj
0 -15 Td
/F1 9 Tf
(${aerodromeInfo[section as keyof typeof aerodromeInfo] || 'Information not available'}) Tj
`).join('')}
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
900
%%EOF`;
  return content;
}
