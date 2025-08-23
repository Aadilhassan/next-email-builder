import { EmailNode } from '../types';
import { uid } from '../core';
import { ChatAdapter } from './ChatPanel';

export type OpenAIConfig = {
  apiKey: string;
  model: string;
  baseURL?: string;
};

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export function createOpenAIAdapter(cfg: OpenAIConfig, seedSystem?: string): ChatAdapter {
  const baseURL = cfg.baseURL ?? 'https://api.openai.com/v1';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cfg.apiKey}`,
  } as const;

  const system = seedSystem ?? `You are an email layout assistant. Input: current email JSON tree and a user request. Output: ONLY a JSON object with an "actions" array. Do not include any prose.

Schema:
{
  "actions": [
    {"type":"insert","parentId":"...","index":0,"node":{"type":"text|image|button|spacer|column|section","id?":"string","props":{},"children?":[]}},
    {"type":"update","id":"...","props":{}},
    {"type":"remove","id":"..."},
    {"type":"select","id":"..."},
    {"type":"replace","root": {"type":"section","id?":"string","props":{},"children":[]}}
  ]
}

Rules:
- Use only these block types: section, column, text, image, button, spacer.
- Provide a single section root for replace.
- ids are optional; they will be auto-generated.
- When user asks to create a template from scratch, return a single replace with a full tree.
- No extra keys, no markdown fences.`;

  async function call(messages: Message[]): Promise<string> {
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${text}`);
    }
    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? '{"actions":[]}';
    return content;
  }

  return {
    async send({ root, message }) {
      const prompt = `Current email JSON: ${JSON.stringify(root)}\nUser request: ${message}\nReturn ONLY a JSON object with an actions array.`;
      const reply = await call([
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ]);
      // Robust parse: accept object { actions: [...] } or extract JSON from fences
      const tryParse = (text: string): any => {
        let t = text.trim();
        // strip code fences if present
        const fence = t.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
        if (fence) t = fence[1].trim();
        // if it looks like an array, wrap it
        if (t.startsWith('[')) t = `{"actions": ${t}}`;
        try { return JSON.parse(t); } catch {}
        // last resort: substring between first { and last }
        const first = t.indexOf('{');
        const last = t.lastIndexOf('}');
        if (first >= 0 && last > first) {
          try { return JSON.parse(t.slice(first, last + 1)); } catch {}
        }
        return null;
      };

  let parsed = tryParse(reply);
  let actions = Array.isArray(parsed?.actions) ? parsed.actions : Array.isArray(parsed) ? parsed : [];

      // Sanitize: ensure nodes have ids recursively
      const ensureIds = (node: any): EmailNode => ({
        id: node.id ?? uid(),
        type: node.type,
        props: node.props ?? {},
        children: node.children?.map(ensureIds),
      });

      let clean = (actions as any[]).flatMap((a) => {
        if (!a || typeof a !== 'object' || typeof a.type !== 'string') return [];
        if (a.type === 'insert' && a.node) return [{ ...a, node: ensureIds(a.node) }];
        if (a.type === 'replace' && a.root) return [{ ...a, root: ensureIds(a.root) }];
        if (a.type === 'update' && a.id) return [a];
        if (a.type === 'remove' && a.id) return [a];
        if (a.type === 'select') return [a];
        return [];
      });

      // Fallback: if user intent indicates creation and model returned nothing, ask once more with stricter instruction
  if (clean.length === 0 && /\b(create|generate|make|build)\b/i.test(message)) {
        const stricter = `User requested to CREATE a new marketing email template. Return exactly one replace action with a compelling layout: hero headline, supporting body text, primary CTA, tasteful spacing, and brand-consistent colors. JSON only.
{"actions":[{"type":"replace","root":{"type":"section","props":{"backgroundColor":"#ffffff","padding":"24px 24px"},"children":[{"type":"column","props":{"width":"100%","padding":"0px"},"children":[{"type":"text","props":{"content":"Welcome to Our Marketing Email!","align":"center","color":"#0f172a","fontSize":"22px","lineHeight":"1.5"}},{"type":"spacer","props":{"height":"12px"}},{"type":"text","props":{"content":"Discover our latest products and offers.","align":"center","color":"#475569","fontSize":"14px","lineHeight":"1.6"}},{"type":"spacer","props":{"height":"20px"}},{"type":"button","props":{"label":"Shop Now","href":"#","backgroundColor":"#0f172a","color":"#ffffff","padding":"12px 18px","borderRadius":"6px"}}]}]}}]}`;
        const second = await call([
          { role: 'system', content: system },
          { role: 'user', content: stricter },
        ]);
        parsed = tryParse(second);
        actions = Array.isArray(parsed?.actions) ? parsed.actions : Array.isArray(parsed) ? parsed : [];
        clean = (actions as any[]).flatMap((a) => {
          if (!a || typeof a !== 'object' || typeof a.type !== 'string') return [];
          if (a.type === 'replace' && a.root) return [{ ...a, root: ensureIds(a.root) }];
          return [];
        });
      }

      const summary = (() => {
        if (clean.find(a => a.type === 'replace')) return 'Created a complete marketing email template.';
        const counts = clean.reduce<Record<string, number>>((m: any, a: any) => (m[a.type] = (m[a.type] ?? 0) + 1, m), {});
        const parts = Object.entries(counts).map(([t, n]) => `${n} ${t}`);
        return parts.length ? `Applied: ${parts.join(', ')}.` : 'No changes.';
      })();

      // If we still have no actions and the prompt looks conversational, return a natural reply
      let replyText: string | undefined = undefined;
      if (clean.length === 0 && /\b(hi|hello|hey|who are you|what can you do|help)\b/i.test(message)) {
        const conv = await fetch(`${baseURL}/chat/completions`, {
          method: 'POST', headers, body: JSON.stringify({
            model: cfg.model,
            messages: [
              { role: 'system', content: 'You are a helpful email design assistant. Answer briefly and politely.' },
              { role: 'user', content: message }
            ],
            temperature: 0.5
          })
        });
        if (conv.ok) {
          const j = await conv.json();
          replyText = j.choices?.[0]?.message?.content;
        }
      }

      return { actions: clean as Array<
        | { type: 'insert'; parentId: string; index?: number; node: EmailNode }
        | { type: 'update'; id: string; props: Record<string, unknown> }
        | { type: 'remove'; id: string }
        | { type: 'select'; id?: string }
        | { type: 'replace'; root: EmailNode }
      >, summary, reply: replyText };
    },
  };
}
