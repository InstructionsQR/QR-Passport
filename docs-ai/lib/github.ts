const API = "https://api.github.com";
const REPOSITORY = process.env.GITHUB_REPOSITORY || "InstructionsQR/QR-Passport";
const REF = process.env.GITHUB_REF || "main";

function headers(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function github<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: headers(), next: { revalidate: 30 } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

export type DocFile = {
  path: string;
  name: string;
  title: string;
};

type TreeItem = { path: string; type: "blob" | "tree"; size?: number };

function titleFromPath(path: string) {
  const name = path.split("/").pop()!.replace(/\.md$/i, "");
  return name === "index" ? path.split("/").at(-2) || "Документация" : name;
}

export async function getDocsTree(): Promise<DocFile[]> {
  const data = await github<{ tree: TreeItem[] }>(
    `${API}/repos/${REPOSITORY}/git/trees/${encodeURIComponent(REF)}?recursive=1`
  );

  return data.tree
    .filter((item) => item.type === "blob" && item.path.startsWith("docs/ru/") && item.path.endsWith(".md"))
    .map((item) => ({
      path: item.path,
      name: item.path.split("/").pop()!.replace(/\.md$/i, ""),
      title: titleFromPath(item.path),
    }))
    .sort((a, b) => a.path.localeCompare(b.path, "ru"));
}

export async function getDocFile(path: string) {
  if (!path.startsWith("docs/ru/") || !path.endsWith(".md") || path.includes("..")) {
    throw new Error("Недопустимый путь к документу");
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const data = await github<{ content?: string; encoding?: string; path: string }>(
    `${API}/repos/${REPOSITORY}/contents/${encodedPath}?ref=${encodeURIComponent(REF)}`
  );

  if (!data.content || data.encoding !== "base64") {
    throw new Error("GitHub не вернул содержимое файла");
  }

  return {
    path: data.path,
    content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8"),
  };
}
