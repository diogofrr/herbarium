import { Fragment, type ReactNode } from "react";

/** Inline: **negrito** e *itálico* (sem HTML cru, tudo vira nó React). */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const token = m[0];
    out.push(
      token.startsWith("**") ? (
        <strong key={i++}>{token.slice(2, -2)}</strong>
      ) : (
        <em key={i++}>{token.slice(1, -1)}</em>
      ),
    );
    last = idx + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Parágrafos separados por linha em branco e listas com "- ". */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="prose">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        // Bloco misto: parágrafo seguido de lista.
        const firstList = lines.findIndex((l) => l.trim().startsWith("- "));
        if (firstList > 0) {
          const head = lines.slice(0, firstList).join(" ");
          const items = lines.slice(firstList);
          return (
            <Fragment key={bi}>
              <p>{inline(head)}</p>
              <ul>
                {items.map((l, li) => (
                  <li key={li}>{inline(l.trim().replace(/^- /, ""))}</li>
                ))}
              </ul>
            </Fragment>
          );
        }
        return <p key={bi}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
