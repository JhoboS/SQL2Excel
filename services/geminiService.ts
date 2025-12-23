
import { GoogleGenAI } from "@google/genai";
import { DBFile } from "../types.ts";

export const analyzeDatabaseSchema = async (dbFile: DBFile): Promise<string> => {
  try {
    // Check if process exists to avoid ReferenceError in some environments
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    if (!apiKey) {
      return "请先配置 API_KEY 环境参数。";
    }

    const ai = new GoogleGenAI({ apiKey });
    
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
    return "无法生成分析。请检查您的网络连接或 API 配置。";
  }
};
