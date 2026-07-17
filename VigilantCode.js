const vscode = require("vscode");
const axios = require("axios");
const marked = require("marked");

const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("VigilantCode: API_KEY not found in environment variables.");
} else {
  console.log("VigilantCode: API Key loaded securely.");
}

/** @type {vscode.WebviewPanel | null} */
let panel;

async function analyzeCode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("VigilantCode: No active editor found.");
    return;
  }

  const codeSnippet = editor.document.getText(editor.selection);

  showSidebarPanel("🔄 VigilantCode is analyzing code... Please wait.");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            "role": "user",
            parts: [
              { text: "Analyze this code for security vulnerabilities and provide detailed fix recommendations:\n\n" + codeSnippet }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from VigilantCode AI.";

    const aiResponseHtml = await marked.parse(aiResponse);
    showSidebarPanel(aiResponseHtml);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let errorData = errorMessage;
    if (error instanceof Error && 'response' in error) {
      const axiosError = /** @type {any} */ (error);
      const apiError = axiosError.response?.data?.error?.message || JSON.stringify(axiosError.response?.data);
      errorData = apiError || error.message;
    }

    vscode.window.showErrorMessage("VigilantCode Error: " + errorData);
    console.error("VigilantCode Error Details:", errorData);
  }
}

/**
 * @param {string} responseText - The HTML content to display in the webview panel
 */
function showSidebarPanel(responseText) {
  if (!panel) {
    panel = vscode.window.createWebviewPanel(
      "vigilantCodeSidebar",
      "VigilantCode Security Insights",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    panel.onDidDispose(() => {
      panel = null;
    });

    panel.webview.onDidReceiveMessage(message => {
      if (message.command === "close" && panel) {
        panel.dispose();
        panel = null;
      }
    });
  }

  panel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>VigilantCode AI Security Analysis</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@400;600;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #0b0d11;
      --surface:   #12151c;
      --border:    #1e2330;
      --accent:    #e8ff47; /* Changed accent color for branding */
      --accent2:   #ff4d6d;
      --text:      #d6dae6;
      --muted:     #5a607a;
      --code-bg:   #0e1018;
      --radius:    10px;
    }

    html, body {
      height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: 'Syne', sans-serif;
      font-size: 14px;
      line-height: 1.65;
    }

    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.35;
      pointer-events: none;
    }

    .shell {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      min-height: 100vh;
      padding: 20px 18px 28px;
      gap: 18px;
    }

    .header {
      display: flex; align-items: center; gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }

    .shield-icon {
      width: 38px; height: 38px; flex-shrink: 0;
      background: var(--accent);
      border-radius: 8px;
      display: grid; place-items: center;
      font-size: 18px;
      box-shadow: 0 0 18px rgba(71,255,204,0.35);
    }

    .header-text { flex: 1; }

    .header-text h1 {
      font-size: 15px; font-weight: 800; letter-spacing: 0.04em;
      color: #fff;
      text-transform: uppercase;
    }

    .header-text span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.08em;
    }

    .badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px; font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid var(--accent);
      color: var(--accent);
    }

    .status-bar {
      display: flex; align-items: center; gap: 8px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius);
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--muted);
    }

    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--accent);
      animation: pulse 1.8s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(71,255,204,0.4); }
      50%       { opacity: 0.6; box-shadow: 0 0 0 5px rgba(71,255,204,0); }
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 18px;
      flex: 1;
      animation: fadeUp 0.35s ease both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .md h1, .md h2, .md h3 {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      color: #fff;
      margin: 1.2em 0 0.5em;
      line-height: 1.3;
    }
    .md h1 { font-size: 1.25em; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
    .md h2 { font-size: 1.1em; }
    .md h3 { font-size: 0.97em; color: var(--accent); }

    .md p  { margin-bottom: 0.85em; }
    .md a  { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }

    .md strong { color: #fff; font-weight: 600; }
    .md em     { color: #b0b8d4; font-style: italic; }

    .md ul, .md ol {
      padding-left: 1.4em;
      margin-bottom: 0.85em;
    }
    .md li { margin-bottom: 0.35em; }

    .md blockquote {
      border-left: 3px solid var(--accent2);
      padding: 8px 14px;
      margin: 1em 0;
      background: rgba(255,77,109,0.07);
      border-radius: 0 6px 6px 0;
      color: #c0c8e0;
      font-style: italic;
    }

    .md pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px;
      overflow-x: auto;
      margin: 1em 0;
    }
    .md pre code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: transparent;
      padding: 0;
      color: #a8b4d4;
    }
    .md code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      background: rgba(255,255,255,0.06);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .md table {
      width: 100%; border-collapse: collapse; margin: 1em 0;
      font-size: 13px;
    }
    .md th {
      background: rgba(71,255,204,0.08);
      color: var(--accent);
      padding: 8px 12px;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    .md td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    .md tr:last-child td { border-bottom: none; }

    .footer {
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px;
    }

    .meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--muted);
    }

    .btn-close {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      background: transparent;
      color: var(--accent2);
      border: 1px solid var(--accent2);
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.18s, color 0.18s, box-shadow 0.18s;
    }
    .btn-close:hover {
      background: var(--accent2);
      color: #fff;
      box-shadow: 0 0 16px rgba(255,77,109,0.4);
    }
  </style>
</head>
<body>
  <div class="shell">

    <header class="header">
      <div class="shield-icon">🛡️</div>
      <div class="header-text">
        <h1>Security Analysis</h1>
        <span>VIGILANTCODE VS · GEMINI 1.5 FLASH</span>
      </div>
      <div class="badge">SECURE</div>
    </header>

    <div class="status-bar">
      <div class="status-dot"></div>
      <span>Analysis complete · VigilantCode found insights</span>
    </div>

    <div class="card">
      <div class="md">${responseText}</div>
    </div>

    <footer class="footer">
      <span class="meta">VigilantCode VS · v0.0.1</span>
      <button class="btn-close" onclick="closePanel()">✕ &nbsp;Dismiss</button>
    </footer>

  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function closePanel() {
      vscode.postMessage({ command: "close" });
    }
  </script>
</body>
</html>`;
}

module.exports = {
  activate(context) {
    let disposable = vscode.commands.registerCommand("vigilantcode.analyzeCode", analyzeCode);
    context.subscriptions.push(disposable);
  },
  deactivate() { }
};
