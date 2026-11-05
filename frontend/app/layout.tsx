import type { Metadata } from "next";
import "./app.css";

export const metadata: Metadata = {
  title: "ChatBot MS · Suporte Cidadão e Servidor",
  description: "POC de atendimento com IA para serviços públicos: base de conhecimento + LLM com streaming.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="gov-header">
          <div className="wrap gov-header__inner">
            <div className="gov-brand">
              <span className="gov-badge">MS</span>
              <div className="gov-titles">
                <strong>Assistente de Serviços Públicos</strong>
                <span className="gov-sub">POC · LLM + base de conhecimento</span>
              </div>
            </div>
            <div className="gov-status">
              <span className="status-dot"></span>
              <span className="status-text">Sistema Conectado</span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
