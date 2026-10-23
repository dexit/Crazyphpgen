import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, currentSolution } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY is not set. Using intelligent rule-based template generation.',
      }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a Senior PHP 8.3 Architect and Isomorphic UI BLoC Builder specialist.
Generate a structured JSON configuration for a 12-column grid isomorphic solution.
The JSON must adhere to this structure:
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "databaseDriver": "sqlite" | "mysql" | "pgsql",
  "blocs": [
    {
      "title": "string",
      "slug": "string",
      "type": "metric" | "datagrid" | "form" | "chart" | "filter_bar" | "kanban" | "detail_card",
      "grid": { "colStart": 1-12, "colSpan": 1-12, "rowStart": 1-6, "rowSpan": 1-3 },
      "description": "string",
      "events": [{ "name": "string", "payloadType": "string", "description": "string", "phpHandler": "string" }],
      "stateFields": [{ "name": "string", "type": "string" | "number" | "boolean" | "array" | "object", "initialValue": any }],
      "phpConfig": {
        "className": "string",
        "modelName": "string",
        "tableName": "string",
        "repositoryQuery": "string",
        "validationRules": { "field": "rules" },
        "psrRoute": "string",
        "httpMethod": "GET" | "POST"
      },
      "uiConfig": {
        "accentColor": "indigo" | "emerald" | "amber" | "rose" | "sky" | "purple",
        "icon": "string"
      }
    }
  ]
}
Return ONLY valid JSON. No markdown code fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Create a comprehensive PHP solution scaffold for this user request: "${prompt}". Current context: ${JSON.stringify(currentSolution?.name || 'New Solution')}` },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json({ success: true, solution: parsed });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to generate solution via Gemini',
    }, { status: 500 });
  }
}
