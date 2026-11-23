const routes = [
  ["GET", "/", "Open this API guide", 200],
  ["GET", "/health", "Check that the server and database respond", 200],
  ["GET", "/api/records", "List all library requests", 200],
  ["GET", "/api/records/:id", "Read one request by its ID", 200],
  ["POST", "/api/records", "Create a request", 201],
  ["PUT", "/api/records/:id", "Replace all four editable fields", 200],
  ["DELETE", "/api/records/:id", "Delete a request", 200]
];

function renderGuide(baseUrl) {
  const escapedUrl = String(baseUrl).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const rows = routes.map(([method, path, action, status]) =>
    `<tr><td><span class="method ${method.toLowerCase()}">${method}</span></td><td><code>${path}</code></td><td>${action}</td><td>${status}</td></tr>`
  ).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Library Service Requests API</title>
<style>
:root { color: #272b37; background: #fffdf8; font: 1rem/1.55 system-ui, sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; }
main { width: min(68rem, calc(100% - 2rem)); margin: 2rem auto; }
header { border-left: 5px solid #a9574f; border-radius: 10px; padding: clamp(1.05rem, 4vw, 2.4rem); background: #f9e6d8; }
h1, h2 { margin: 0 0 .65rem; color: #263a64; font: 700 clamp(1.9rem, 4vw, 3.25rem)/1.1 Georgia, serif; }
h2 { font-size: 1.6rem; }
p, ul { margin: .55rem 0; }
nav { display: flex; flex-wrap: wrap; gap: .65rem 1.2rem; margin-top: .9rem; }
a { color: #263a64; font-weight: 675; }
a:focus-visible { outline: 3px solid #3e66b1; outline-offset: 3px; }
.base { overflow-wrap: anywhere; }
section { margin-top: 1.35rem; padding: clamp(1rem, 3vw, 1.4rem); border: 1px solid #ded9d0; border-radius: 10px; background: #fff; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: .6rem .65rem; border-bottom: 1px solid #ded9d0; }
th { background: #f6f3ec; }
td code { white-space: nowrap; }
.method { display: inline-block; border-radius: 4px; padding: .15rem .4rem; font-size: .85rem; font-weight: 750; background: #e9eef8; color: #2a4680; }
.method.post { background: #e5f0e8; color: #2b5c41; }
.method.put { background: #f5ecce; color: #69501a; }
.method.delete { background: #f6e5e2; color: #8a332e; }
pre { padding: .9rem; overflow: auto; background: #f5f3ef; border-radius: 6px; }
@media (max-width: 540px) { main { margin: .75rem auto 1.5rem; } th, td { padding: .45rem; } }
</style>
</head>
<body>
<main>
<header>
  <h1>Library Service Requests API</h1>
  <p>ICT251 · Activity 7 · Student number 202507020</p>
  <p>Track requests for help finding books, borrowing materials, and managing library accounts.</p>
  <p class="base"><strong>Backend base URL</strong> <code>${escapedUrl}</code></p>
  <nav aria-label="API links">
    <a href="/health">Database health</a>
    <a href="/api/records">List requests</a>
    <a href="/api/records/1">Open sample request</a>
  </nav>
</header>
<section aria-labelledby="routes">
  <h2 id="routes">API routes</h2>
  <div class="table-wrap"><table>
    <thead><tr><th scope="col">Method</th><th scope="col">Path</th><th scope="col">Action</th><th scope="col">Success</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
</section>
<section aria-labelledby="request-body">
  <h2 id="request-body">POST and PUT request body</h2>
  <p>Send all four fields as strings with <code>Content-Type: application/json</code>. The database assigns the ID. For PUT, use an existing positive whole-number ID in the URL.</p>
  <ul>
    <li><code>title</code> · 3–80 characters</li>
    <li><code>category</code> · 2–40 characters. Sample categories are Book search, Borrowing, and Account help.</li>
    <li><code>description</code> · 5–300 characters</li>
    <li><code>status</code> · Pending, In progress, or Completed</li>
  </ul>
  <pre><code>{
  "title": "Find an introductory Java textbook",
  "category": "Book search",
  "description": "Help locate a beginner Java book in the catalogue.",
  "status": "Pending"
}</code></pre>
  <p>For a test, create a request with POST and use the returned ID for GET, PUT, and DELETE in Postman or another API client.</p>
</section>
<section aria-labelledby="response">
  <h2 id="response">Responses</h2>
  <p>GET all returns an array. GET one, POST, and PUT return a record with its ID. DELETE returns <code>{"message":"Record deleted."}</code>.</p>
  <p>Errors return JSON with a <code>message</code> field. <strong>400</strong> means invalid input or JSON, <strong>404</strong> means a missing route or record, <strong>500</strong> means an unexpected server error, and <strong>503</strong> means the database is unavailable.</p>
  <p>An idle service may take a moment to respond.</p>
</section>
</main>
</body>
</html>`;
}

module.exports = { renderGuide };
