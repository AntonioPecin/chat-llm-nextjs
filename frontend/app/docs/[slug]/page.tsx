import type { Metadata } from "next";
import Link from "next/link";
import { listDocs, toHtml } from "../lib";

export const dynamicParams = false;

export function generateStaticParams() {
  return listDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${listDocs().find((d) => d.slug === slug)?.title} · Docs` };
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const docs = listDocs();
  const i = docs.findIndex((d) => d.slug === slug);
  const doc = docs[i];
  const prev = docs[i - 1];
  const next = docs[i + 1];

  return (
    <div className="wrap docs">
      <nav className="docs__nav" aria-label="Documentação">
        <ol>
          {docs.map((d) => (
            <li key={d.slug}>
              <Link href={`/docs/${d.slug}`} aria-current={d.slug === slug ? "page" : undefined}>
                {d.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <article>
        <h1>{doc.title}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: toHtml(doc.markdown) }} />
        <div className="docs__pager">
          {prev ? <Link href={`/docs/${prev.slug}`}>← {prev.title}</Link> : <span />}
          {next && <Link href={`/docs/${next.slug}`}>{next.title} →</Link>}
        </div>
      </article>
    </div>
  );
}
