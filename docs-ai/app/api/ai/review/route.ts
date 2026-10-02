import { NextRequest, NextResponse } from "next/server";

type Finding = {
  category: "error" | "style" | "terminology" | "suggestion";
  severity: "high" | "medium" | "low";
  title: string;
  original: string;
  suggestion: string;
  explanation: string;
};

function extractJson(text: string): Finding[] {
  const cleaned = text.trim().replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed) ? parsed : parsed.findings ?? [];
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Не задан OPENAI_API_KEY. Добавьте ключ в docs-ai/.env.local и перезапустите приложение." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const content = body?.content;

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Не передан текст страницы." }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL || "gpt-6-luna";

  const instructions = `Ты — редактор технической документации QR-Passport.
Проверяй текст страницы на русском языке.

Главные правила:
1. Не меняй технический смысл.
2. Не объявляй ошибкой название кнопки, поля, раздела интерфейса, модели, параметра или термина только потому, что тебе кажется, что можно сказать иначе.
3. Не изменяй названия ГОСТ, стандартов, документов, организаций и технических обозначений.
4. Ищи реальные языковые ошибки, канцелярит, тяжёлые конструкции, неоднозначность и несогласованность терминов.
5. Для инструкций предпочитай прямые действия: "откройте", "выберите", "введите", "нажмите", "перейдите".
6. Предпочитай короткие естественные формулировки: "создать" вместо "осуществить создание", "выбрать" вместо "произвести выбор", "чтобы" вместо "в целях".
7. Не придумывай проблемы. Если всё хорошо, верни пустой массив.
8. Если есть спорная терминология, используй category "terminology" и объясни, что нужно проверить согласованность, а не утверждай без контекста, какой вариант единственно правильный.

Верни ТОЛЬКО JSON-массив объектов без Markdown:
[
  {
    "category": "error|style|terminology|suggestion",
    "severity": "high|medium|low",
    "title": "Короткое название",
    "original": "Точная цитата из текста",
    "suggestion": "Предлагаемый вариант",
    "explanation": "Краткое объяснение"
  }
]

Текст страницы:
---BEGIN DOCUMENT---
${content}
---END DOCUMENT---`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions,
        input: "Проверь эту страницу.",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "OpenAI API вернул ошибку." },
        { status: response.status }
      );
    }

    const output = data.output_text;
    if (typeof output !== "string") {
      return NextResponse.json({ error: "OpenAI не вернул текст результата." }, { status: 502 });
    }

    let findings: Finding[];
    try {
      findings = extractJson(output);
    } catch {
      return NextResponse.json({ error: "AI вернул ответ в неожиданном формате." }, { status: 502 });
    }

    return NextResponse.json({ findings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось обратиться к OpenAI." },
      { status: 500 }
    );
  }
}
