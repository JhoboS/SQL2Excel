
import { GoogleGenAI } from "@google/genai";
import { DBFile } from "../types";

export const analyzeDatabaseSchema = async (dbFile: DBFile): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const schemaDescription = dbFile.tables.map(t => 
      `Table: ${t.name} (${t.rowCount} rows). Columns: ${t.columns.join(', ')}`
    ).join('\n');

    const prompt = `
      You are a database expert. I have an SQLite file named "${dbFile.name}".
      Here is its schema:
      ${schemaDescription}
      
      Please provide a brief, professional summary (2-3 sentences) of what this database likely contains based on the table names and columns. 
      Identify any particularly interesting tables for export. 
      Respond in Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "无法生成分析。请确保您已在部署环境中配置了 API_KEY。";
  }
};
