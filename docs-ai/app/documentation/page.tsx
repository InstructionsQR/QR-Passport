"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, Check, FileText, GitBranch, LoaderCircle, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";

type DocFile = { path: string; name: string; title: string };
type Finding = {
  category: "error" | "style" | "terminology" | "suggestion";
  severity: "high" | "medium" | "low";
  title: string;
  original: string;
  suggestion: string;
  explanation: string;
};

const categoryLabels = { error: "Ошибка", style: "Стиль", terminology: "Терминология", suggestion: "Предложение" };

export default function DocumentationPage() {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [selected, setSelected] = useState("");
  const [content, setContent] = useState("");
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [decision, setDecision] = useState<Record<number, "accepted" | "rejected">>({});

  useEffect(() => {
    fetch("/api/docs/tree").then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.error); return d.files as DocFile[]; })
      .then(items => { setFiles(items); if(items[0]) setSelected(items[0].path); })
      .catch(e => setError(e.message)).finally(() => setLoadingTree(false));
  }, []);

  useEffect(() => {
    if(!selected) return;
    setLoadingFile(true); setError(""); setFindings([]); setDecision({});
    fetch("/api/docs/file?path="+encodeURIComponent(selected)).then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.error); return d.content as string; })
      .then(setContent).catch(e => setError(e.message)).finally(() => setLoadingFile(false));
  }, [selected]);

  const checkPage = async () => {
    setChecking(true); setError(""); setFindings([]); setDecision({});
    try {
      const r=await fetch("/api/ai/review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({content})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error || "Не удалось проверить страницу"); setFindings(d.findings || []);
    } catch(e) { setError(e instanceof Error ? e.message : "Не удалось проверить страницу"); }
    finally { setChecking(false); }
  };

  const visible = useMemo(() => files.filter(f => f.path.toLowerCase().includes(query.toLowerCase())), [files,query]);

  return <main className="docs-shell">
    <header className="docs-topbar"><div><Link href="/" className="back"><ArrowLeft/> Обзор</Link><h1>Документация</h1><p>Реальные файлы из <b>InstructionsQR / QR-Passport</b> · <b>main</b></p></div><div className="readonly"><GitBranch/> Только чтение</div></header>
    {error && <div className="docs-error"><AlertCircle/>{error}</div>}
    <div className={findings.length ? "docs-workspace with-review" : "docs-workspace"}>
      <aside className="docs-tree"><div className="tree-title"><b>docs/ru</b><span>{files.length}</span></div><div className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти страницу"/></div>
        {loadingTree ? <div className="loading"><LoaderCircle className="spin"/>Загрузка…</div> : <div className="tree-list">{visible.map(file=><button key={file.path} className={selected===file.path?"tree-item selected":"tree-item"} onClick={()=>setSelected(file.path)}><FileText/><span>{file.title}</span></button>)}</div>}
      </aside>
      <section className="doc-view">{loadingFile ? <div className="loading"><LoaderCircle className="spin"/>Загрузка страницы…</div> : selected ? <>
        <div className="doc-head"><div><span className="doc-path">{selected}</span><h2>{files.find(f=>f.path===selected)?.title}</h2></div><button className="ai-button" onClick={checkPage} disabled={checking}>{checking?<LoaderCircle className="spin"/>:<Sparkles/>}{checking?"Проверяем…":"Проверить страницу"}</button></div>
        <pre className="markdown">{content}</pre>
      </> : <div className="empty">Выберите страницу слева.</div>}</section>
      {findings.length ? <aside className="review-panel"><div className="review-head"><div><b>Проверка AI</b><span>{findings.length} замеч.</span></div><button className="close-review" onClick={()=>setFindings([])}><X/></button></div><div className="review-list">
        {findings.map((f,i)=>{const state=decision[i]; return <article className={`finding ${state||""}`} key={i}><div className="finding-meta"><span className={`finding-category ${f.category}`}>{categoryLabels[f.category]}</span><span>{f.severity}</span></div><h3>{f.title}</h3><div className="finding-original">{f.original}</div><div className="finding-suggestion"><span>→</span>{f.suggestion}</div><p>{f.explanation}</p>{!state?<div className="finding-actions"><button onClick={()=>setDecision(d=>({...d,[i]:"accepted"}))}><Check/> Принять</button><button onClick={()=>setDecision(d=>({...d,[i]:"rejected"}))}><X/> Отклонить</button></div>:<div className="decision">{state==="accepted"?"Принято":"Отклонено"}</div>}</article>})}
      </div></aside> : <aside className="review-placeholder"><Sparkles/><b>Проверка AI</b><p>Нажмите «Проверить страницу», чтобы найти ошибки, стилистические проблемы и спорные формулировки.</p></aside>}
    </div>
  </main>;
}
