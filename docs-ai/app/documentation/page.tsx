"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, FileText, GitBranch, LoaderCircle, Search, Sparkles } from "lucide-react";
import Link from "next/link";

type DocFile = { path: string; name: string; title: string };

export default function DocumentationPage() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selected, setSelected] = useState("");
  const [content, setContent] = useState("");
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/docs/tree")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Не удалось загрузить документацию");
        return data.files as DocFile[];
      })
      .then((items) => {
        setFiles(items);
        if (items[0]) setSelected(items[0].path);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTree(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingFile(true);
    setError("");
    fetch("/api/docs/file?path=" + encodeURIComponent(selected))
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Не удалось загрузить страницу");
        return data.content as string;
      })
      .then(setContent)
      .catch((e) => setError(e.message))
      .finally(() => setLoadingFile(false));
  }, [selected]);

  const visible = useMemo(
    () => files.filter((f) => f.path.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );

  return (
    <main className="docs-shell">
      <header className="docs-topbar">
        <div>
          <Link href="/" className="back"><ArrowLeft /> Обзор</Link>
          <h1>Документация</h1>
          <p>Реальные файлы из <b>InstructionsQR / QR-Passport</b> · <b>main</b></p>
        </div>
        <div className="readonly"><GitBranch /> Только чтение</div>
      </header>

      {error && <div className="docs-error"><AlertCircle />{error}</div>}

      <div className="docs-workspace">
        <aside className="docs-tree">
          <div className="tree-title"><b>docs/ru</b><span>{files.length}</span></div>
          <div className="search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти страницу" /></div>
          {loadingTree ? (
            <div className="loading"><LoaderCircle className="spin" />Загрузка…</div>
          ) : (
            <div className="tree-list">
              {visible.map((file) => (
                <button key={file.path} className={selected === file.path ? "tree-item selected" : "tree-item"} onClick={() => setSelected(file.path)}>
                  <FileText /> <span>{file.title}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="doc-view">
          {loadingFile ? (
            <div className="loading"><LoaderCircle className="spin" />Загрузка страницы…</div>
          ) : selected ? (
            <>
              <div className="doc-head">
                <div><span className="doc-path">{selected}</span><h2>{files.find((f) => f.path === selected)?.title}</h2></div>
                <button className="ai-button" disabled title="Подключим на следующем этапе"><Sparkles /> Проверить страницу</button>
              </div>
              <pre className="markdown">{content}</pre>
            </>
          ) : (
            <div className="empty">Выберите страницу слева.</div>
          )}
        </section>
      </div>
    </main>
  );
}
