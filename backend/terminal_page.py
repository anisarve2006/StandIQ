"""
MaanakAI Minimalist Hacker Terminal for Root Endpoint ('/')
Clean, lightweight, distraction-free monochrome terminal aesthetic.
"""

def get_hacker_terminal_html(version: str = "3.1.0") -> str:
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>maanak-ai :: kernel</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: #080808;
      color: #00ff66;
      font-family: 'SF Mono', Monaco, Menlo, Consolas, 'Courier New', monospace;
      font-size: 13.5px;
      line-height: 1.6;
      padding: 32px 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .term-wrapper {
      max-width: 680px;
      width: 100%;
      margin: 0 auto;
    }

    .title {
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00ff66;
      box-shadow: 0 0 8px #00ff66;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .divider {
      color: #1a4d2e;
      margin: 8px 0 16px 0;
      user-select: none;
    }

    .section-title {
      color: #558866;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    .kv-row {
      display: flex;
      gap: 12px;
    }

    .kv-key {
      color: #558866;
      width: 110px;
      flex-shrink: 0;
    }

    .kv-val {
      color: #d1fae5;
    }

    .kv-val.highlight {
      color: #00ff66;
      font-weight: 600;
    }

    ul.links {
      list-style: none;
      margin: 4px 0 16px 0;
    }

    ul.links li {
      margin-bottom: 4px;
    }

    a {
      color: #00ff66;
      text-decoration: none;
      border-bottom: 1px dotted #00aa44;
      transition: all 0.15s ease;
    }

    a:hover {
      background: #00ff66;
      color: #000000;
      border-bottom-color: transparent;
    }

    .dim {
      color: #558866;
    }

    /* Minimal CLI output & prompt */
    #cli-log {
      margin-top: 16px;
    }

    .cli-response {
      margin: 6px 0;
      padding-left: 12px;
      border-left: 2px solid #1a4d2e;
      color: #a7f3d0;
      font-size: 12.5px;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .prompt-line {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 18px;
    }

    .prompt-label {
      color: #00ff66;
      font-weight: 700;
      user-select: none;
    }

    .prompt-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #ffffff;
      font-family: inherit;
      font-size: inherit;
      caret-color: #00ff66;
    }

    .cursor {
      display: inline-block;
      width: 8px;
      height: 15px;
      background: #00ff66;
      vertical-align: middle;
      animation: cursor-blink 1s step-start infinite;
    }

    @keyframes cursor-blink {
      50% { opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="term-wrapper">
    <div class="title">
      <span class="status-dot"></span>
      <span>maanak-ai :: v""" + version + """</span>
      <span class="dim">[online]</span>
    </div>
    <div class="divider">─────────────────────────────────────────────────────</div>

    <div class="section-title">// system</div>
    <div class="kv-row"><span class="kv-key">status</span><span class="kv-val highlight">200 ok (healthy)</span></div>
    <div class="kv-row"><span class="kv-key">service</span><span class="kv-val">bis standards &amp; tender compliance</span></div>
    <div class="kv-row"><span class="kv-key">engine</span><span class="kv-val">neuro-symbolic (zero-hallucination)</span></div>
    <div class="kv-row"><span class="kv-key">llm</span><span class="kv-val">bharatgpt-3b indic (active)</span></div>
    <div class="kv-row"><span class="kv-key">database</span><span class="kv-val">sqlite3 wal (multi-reader)</span></div>

    <div class="section-title">// endpoints</div>
    <ul class="links">
      <li>&rarr; <a href="/docs">/docs</a> <span class="dim">— interactive swagger api documentation</span></li>
      <li>&rarr; <a href="/redoc">/redoc</a> <span class="dim">— redoc specification</span></li>
      <li>&rarr; <a href="/api/v1/health">/api/v1/health</a> <span class="dim">— corpus stats &amp; health diagnostics</span></li>
      <li>&rarr; <a href="/api/v1/system/metrics">/api/v1/system/metrics</a> <span class="dim">— sre telemetry &amp; latency metrics</span></li>
    </ul>

    <div class="section-title">// terminal</div>
    <div id="cli-log"></div>

    <div class="prompt-line">
      <span class="prompt-label">$</span>
      <input 
        type="text" 
        id="cmd" 
        class="prompt-input" 
        placeholder="type 'help', 'health', 'metrics', or 'clear'..." 
        autocomplete="off" 
        spellcheck="false"
        autofocus
      >
    </div>
  </div>

  <script>
    const input = document.getElementById('cmd');
    const log = document.getElementById('cli-log');

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        if (!cmd) return;

        appendOutput('$ ' + cmd);
        const low = cmd.toLowerCase();

        if (low === 'clear' || low === 'cls') {
          log.innerHTML = '';
          return;
        }

        if (low === 'help') {
          appendOutput('available commands:\\n  health   - query /api/v1/health\\n  metrics  - query /api/v1/system/metrics\\n  docs     - open /docs\\n  redoc    - open /redoc\\n  clear    - clear output');
          return;
        }

        if (low === 'docs') {
          window.location.href = '/docs';
          return;
        }

        if (low === 'redoc') {
          window.location.href = '/redoc';
          return;
        }

        if (low === 'health') {
          try {
            const res = await fetch('/api/v1/health');
            const data = await res.json();
            appendOutput(JSON.stringify(data, null, 2));
          } catch (err) {
            appendOutput('error: ' + err.message);
          }
          return;
        }

        if (low === 'metrics') {
          try {
            const res = await fetch('/api/v1/system/metrics');
            const data = await res.json();
            appendOutput(JSON.stringify(data, null, 2));
          } catch (err) {
            appendOutput('error: ' + err.message);
          }
          return;
        }

        appendOutput("command not found: '" + cmd + "'. try 'help'");
      }
    });

    function appendOutput(text) {
      const el = document.createElement('div');
      el.className = 'cli-response';
      el.textContent = text;
      log.appendChild(el);
      window.scrollTo(0, document.body.scrollHeight);
    }
  </script>
</body>
</html>
"""
