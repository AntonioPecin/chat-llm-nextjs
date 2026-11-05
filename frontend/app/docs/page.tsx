import type { Metadata } from "next";
import Link from "next/link";
import { listDocs } from "./lib";

export const metadata: Metadata = { title: "Docs · POC LLM" };

export default function DocsIndex() {
  return (
    <div className="wrap">
      <h1>Documentação</h1>
      <p>Como uma LLM funciona e como esta POC conversa com ela. Mesmo conteúdo da pasta docs/ do repositório.</p>
      <ol>
        {listDocs().map((d) => (
          <li key={d.slug}>
            <Link href={`/docs/${d.slug}`}>{d.title}</Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
