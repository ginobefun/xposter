const els = {
  run: document.getElementById("run"),
  openSidePanel: document.getElementById("openSidePanel"),
  openArticles: document.getElementById("openArticles"),
  copyJson: document.getElementById("copyJson"),
  target: document.getElementById("target"),
  route: document.getElementById("route"),
  content: document.getElementById("content"),
  main: document.getElementById("main"),
  editor: document.getElementById("editor"),
  upload: document.getElementById("upload"),
  article: document.getElementById("article"),
  contentRisk: document.getElementById("contentRisk"),
  vault: document.getElementById("vault"),
  gateList: document.getElementById("gateList"),
  details: document.getElementById("details")
};

let latestResult = null;

function hasChromeRuntime() {
  return typeof chrome !== "undefined" && Boolean(chrome.runtime?.sendMessage);
}

function setSummary(result) {
  const content = result?.content;
  const main = content?.main;
  const vault = content?.vault;
  const targetContext = content?.targetContext;
  const editorLength = Number(targetContext?.editorTextLength || 0);
  els.target.textContent = result?.tab?.isX ? "X tab" : "Not X";
  els.route.textContent = content?.isEditorRoute ? "Editor" : content?.isArticleRoute ? "Articles" : "Other";
  els.content.textContent = content?.ok ? "Ready" : "Missing";
  els.main.textContent = main?.ok && main.mainWorld ? "Ready" : "Missing";
  els.editor.textContent = main?.hasDraftStateNode ? "Draft.js" : content?.hasEditorElement ? "DOM only" : "Not found";
  els.upload.textContent = main?.hasOnFilesAdded ? "Ready" : "Missing";
  els.article.textContent = main?.articleId ? main.articleId : content?.isEditorRoute ? "Missing id" : "Not open";
  els.contentRisk.textContent = editorLength ? `${editorLength} chars` : targetContext?.hasEditor ? "Empty" : "None";
  els.vault.textContent = vault?.configured ? (vault.permission === "granted" ? "Ready" : "Permission") : "Optional";
  renderGate(result);
}

function buildGate(result) {
  const content = result?.content;
  const main = content?.main;
  const vault = content?.vault;
  const targetContext = content?.targetContext;
  const editorLength = Number(targetContext?.editorTextLength || 0);
  return [
    {
      label: "Target",
      ok: Boolean(result?.tab?.isX),
      detail: result?.tab?.isX ? "Active tab is X/Twitter." : "Open x.com before running import checks."
    },
    {
      label: "Route",
      ok: Boolean(content?.isArticleRoute),
      detail: content?.isArticleRoute ? "X Articles route is active." : "Use the X Articles composer route."
    },
    {
      label: "Content script",
      ok: Boolean(content?.ok && content.contentScript),
      detail: content?.ok ? "Content bridge is responding." : content?.error || "Content script is not reachable."
    },
    {
      label: "MAIN bridge",
      ok: Boolean(main?.ok && main.mainWorld),
      detail: main?.mainWorld ? "MAIN-world script is responding." : main?.error || "MAIN-world bridge did not respond."
    },
    {
      label: "Draft.js editor",
      ok: Boolean(main?.hasDraftStateNode),
      detail: main?.hasDraftStateNode ? "Draft.js state node is reachable." : "Open or create an article draft first."
    },
    {
      label: "Target context",
      ok: Boolean(targetContext?.isArticleRoute),
      detail: targetContext?.isEditorRoute
        ? `Editor target${targetContext.articleId ? ` ${targetContext.articleId}` : ""}; sample: ${targetContext.editorSample || "empty"}`
        : targetContext?.isArticleRoute
          ? "X Articles list is active; no existing editor target is open."
          : "No X Articles target context is available."
    },
    {
      label: "Existing content",
      ok: editorLength === 0,
      detail: editorLength
        ? `Editor already has ${editorLength} character(s); confirm before importing.`
        : targetContext?.hasEditor
          ? "Target editor is empty."
          : "No open editor content to overwrite."
    },
    {
      label: "Upload handler",
      ok: Boolean(main?.hasOnFilesAdded),
      detail: main?.hasOnFilesAdded ? "X media upload handler is reachable." : "Required for images and rendered tables."
    },
    {
      label: "Local vault",
      ok: !vault?.configured || vault.permission === "granted",
      detail: vault?.configured ? `${vault.name || "Selected folder"}: ${vault.permission || "unknown"}.` : "Optional unless Markdown uses relative images."
    }
  ];
}

function renderGate(result) {
  const checks = buildGate(result);
  els.gateList.innerHTML = checks
    .map((check) => {
      const tone = check.ok ? "ok" : "error";
      return `<li data-tone="${tone}"><strong>${escapeHtml(check.label)}</strong><span>${escapeHtml(check.detail)}</span></li>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function runDiagnostics() {
  if (!hasChromeRuntime()) {
    els.run.disabled = true;
    els.openSidePanel.disabled = true;
    els.openArticles.disabled = true;
    els.copyJson.disabled = true;
    els.target.textContent = "Extension only";
    els.route.textContent = "Unavailable";
    els.content.textContent = "Unavailable";
    els.main.textContent = "Unavailable";
    els.editor.textContent = "Unavailable";
    els.upload.textContent = "Unavailable";
    els.article.textContent = "Unavailable";
    els.contentRisk.textContent = "Unavailable";
    els.vault.textContent = "Unavailable";
    els.details.textContent = "Load xPoster as an unpacked Chrome extension to run active-tab diagnostics.";
    return;
  }

  els.run.disabled = true;
  els.run.textContent = "Checking...";
  try {
    const result = await chrome.runtime.sendMessage({ type: "xposter:diagnose-active-tab" });
    latestResult = result;
    setSummary(result);
    els.details.textContent = JSON.stringify(result, null, 2);
    els.copyJson.disabled = false;
  } catch (error) {
    els.details.textContent = error?.message || String(error);
  } finally {
    els.run.disabled = false;
    els.run.textContent = "Check active X tab";
  }
}

async function openArticles() {
  if (!hasChromeRuntime()) return;
  try {
    await chrome.runtime.sendMessage({ type: "xposter:open-articles" });
    window.setTimeout(runDiagnostics, 500);
  } catch (error) {
    els.details.textContent = error?.message || String(error);
  }
}

async function openSidePanel() {
  if (!hasChromeRuntime()) return;
  els.openSidePanel.disabled = true;
  els.openSidePanel.textContent = "Opening...";
  try {
    await chrome.runtime.sendMessage({ type: "xposter:open-side-panel" });
  } catch (error) {
    els.details.textContent = error?.message || String(error);
  } finally {
    els.openSidePanel.disabled = false;
    els.openSidePanel.textContent = "Open side panel";
  }
}

async function copyJson() {
  if (!latestResult) return;
  const text = JSON.stringify(latestResult, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    els.copyJson.textContent = "Copied";
    window.setTimeout(() => {
      els.copyJson.textContent = "Copy JSON";
    }, 1000);
  } catch {
    els.details.focus?.();
  }
}

els.run.addEventListener("click", runDiagnostics);
els.openSidePanel.addEventListener("click", openSidePanel);
els.openArticles.addEventListener("click", openArticles);
els.copyJson.addEventListener("click", copyJson);
runDiagnostics();
