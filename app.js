const DATA_BASE = "./data";

async function loadJson(name) {
  try {
    const res = await fetch(`${DATA_BASE}/${name}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("Failed to load", name, e);
    return null;
  }
}

function setActiveView(viewId) {
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("view-active", v.id === viewId);
  });
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
}

function statusBadge(status) {
  const s = (status || "Not Started").toLowerCase();
  let cls = "status-not-started";
  if (s === "done") cls = "status-done";
  else if (s === "in progress") cls = "status-progress";
  return `<span class="badge ${cls}">${status || "Not Started"}</span>`;
}

function safeList(arr) {
  return Array.isArray(arr) ? arr : [];
}

function renderDSA(dsa) {
  const container = document.getElementById("dsaContainer");
  if (!container || !dsa || !Array.isArray(dsa.steps)) return;
  container.innerHTML = "";
  dsa.steps.forEach((step) => {
    const res = step.resources || {};
    const links = [];
    if (res.sheet) links.push(`<a href="${res.sheet}" target="_blank" rel="noreferrer">Striver A2Z Sheet</a>`);
    if (res.playlist) links.push(`<a href="${res.playlist}" target="_blank" rel="noreferrer">Primary playlist</a>`);
    if (res.extraPlaylist) links.push(`<a href="${res.extraPlaylist}" target="_blank" rel="noreferrer">Extra playlist</a>`);

    const tags = safeList(step.tags).map((t) => `<span class="chip">${t}</span>`).join("");

    const html = `
      <article class="list-item">
        <div class="list-item-header">
          <div>
            <strong>${step.name}</strong>
            <div class="metric-label">${step.description || ""}</div>
          </div>
          ${statusBadge(step.status)}
        </div>
        ${tags ? `<div class="chip-row">${tags}</div>` : ""}
        ${links.length ? `<div class="link-row">${links.join(" ")}</div>` : ""}
      </article>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

function renderJava(java) {
  const container = document.getElementById("javaContainer");
  if (!container || !java || !Array.isArray(java.modules)) return;
  container.innerHTML = "";
  java.modules.forEach((m) => {
    const links = [];
    safeList(m.resources).forEach((r) => {
      if (r.url) links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Link"}</a>`);
    });

    const tags = safeList(m.tags).map((t) => `<span class="chip">${t}</span>`).join("");

    const html = `
      <article class="list-item">
        <div class="list-item-header">
          <div>
            <strong>${m.name}</strong>
            <div class="metric-label">${m.description || ""}</div>
          </div>
          ${statusBadge(m.status)}
        </div>
        ${tags ? `<div class="chip-row">${tags}</div>` : ""}
        ${links.length ? `<div class="link-row">${links.join(" ")}</div>` : ""}
      </article>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

function renderCAT(cat) {
  const container = document.getElementById("catContainer");
  if (!container || !cat) return;
  container.innerHTML = "";
  [
    ["QA", cat.qaTopics],
    ["DILR", cat.dilrTopics],
    ["VARC", cat.varcTopics],
  ].forEach(([section, topics]) => {
    if (!Array.isArray(topics) || !topics.length) return;
    const heading = `<h2 style="margin:8px 0 4px;font-size:14px;">${section}</h2>`;
    container.insertAdjacentHTML("beforeend", heading);
    topics.forEach((t) => {
      const links = [];
      safeList(t.youtube).forEach((r) => {
        if (r.url) links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Video"}</a>`);
      });
      safeList(t.practice).forEach((r) => {
        if (r.url) links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Practice"}</a>`);
      });
      safeList(t.reading).forEach((r) => {
        if (r.url) links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Reading"}</a>`);
      });

      const html = `
        <article class="list-item">
          <div class="list-item-header">
            <div>
              <strong>${t.topic}</strong>
              <div class="metric-label">Weightage: ${t.weightage || "-"}</div>
            </div>
            ${statusBadge(t.status)}
          </div>
          ${links.length ? `<div class="link-row">${links.join(" ")}</div>` : ""}
        </article>
      `;
      container.insertAdjacentHTML("beforeend", html);
    });
  });
}

function renderMocks(mocks) {
  const container = document.getElementById("mocksContainer");
  if (!container || !mocks) return;
  container.innerHTML = "";
  const all = [
    ...(Array.isArray(mocks.catMocks) ? mocks.catMocks : []),
    ...(Array.isArray(mocks.placementMocks) ? mocks.placementMocks : []),
  ];
  all.forEach((m) => {
    const html = `
      <article class="list-item">
        <div class="list-item-header">
          <div>
            <strong>${m.name}</strong>
            <div class="metric-label">Provider: ${m.provider || "-"}</div>
          </div>
          ${statusBadge(m.status)}
        </div>
        <div class="link-row">
          ${m.url ? `<a href="${m.url}" target="_blank" rel="noreferrer">Open</a>` : ""}
        </div>
      </article>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

function renderResources(resources) {
  const container = document.getElementById("resourcesContainer");
  if (!container || !Array.isArray(resources.items)) return;
  container.innerHTML = "";
  resources.items.forEach((r) => {
    const html = `
      <article class="list-item">
        <div class="list-item-header">
          <div>
            <strong>${r.name}</strong>
            <div class="metric-label">${r.description || ""}</div>
          </div>
          <span class="badge">${r.track || "General"}</span>
        </div>
        <div class="link-row">
          ${r.url ? `<a href="${r.url}" target="_blank" rel="noreferrer">Open</a>` : ""}
        </div>
      </article>
    `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

function computeSummary(dsa, java, cat) {
  const dsaCount = dsa && Array.isArray(dsa.steps) ? dsa.steps.length : 0;
  const dsaDone = dsa && Array.isArray(dsa.steps) ? dsa.steps.filter((s) => (s.status || "").toLowerCase() === "done").length : 0;

  const javaCount = java && Array.isArray(java.modules) ? java.modules.length : 0;
  const javaDone = java && Array.isArray(java.modules) ? java.modules.filter((m) => (m.status || "").toLowerCase() === "done").length : 0;

  const catTopics = [
    ...(cat && Array.isArray(cat.qaTopics) ? cat.qaTopics : []),
    ...(cat && Array.isArray(cat.dilrTopics) ? cat.dilrTopics : []),
    ...(cat && Array.isArray(cat.varcTopics) ? cat.varcTopics : []),
  ];
  const catCount = catTopics.length;
  const catDone = catTopics.filter((t) => (t.status || "").toLowerCase() === "done").length;

  document.getElementById("dsaSummary").innerHTML = `
    <h2>DSA</h2>
    <div class="metric-row">
      <span class="metric-label">Steps</span>
      <span class="metric-value">${dsaDone}/${dsaCount}</span>
    </div>
  `;
  document.getElementById("javaSummary").innerHTML = `
    <h2>Java / Spring</h2>
    <div class="metric-row">
      <span class="metric-label">Modules</span>
      <span class="metric-value">${javaDone}/${javaCount}</span>
    </div>
  `;
  document.getElementById("catSummary").innerHTML = `
    <h2>CAT</h2>
    <div class="metric-row">
      <span class="metric-label">Topics</span>
      <span class="metric-value">${catDone}/${catCount}</span>
    </div>
  `;
}

function generatePlan(dsa, java, cat) {
  const hoursInput = document.getElementById("hoursInput");
  const modeSelect = document.getElementById("prioritySelect");
  const planBox = document.getElementById("todayPlan");
  const hours = Math.max(1, Number(hoursInput.value) || 1);
  const mode = modeSelect.value;

  const tasks = [];

  if (dsa && Array.isArray(dsa.steps)) {
    dsa.steps
      .filter((s) => (s.status || "").toLowerCase() !== "done")
      .slice(0, 5)
      .forEach((s) => tasks.push({ track: "DSA", label: s.name }));
  }

  if (java && Array.isArray(java.modules)) {
    java.modules
      .filter((m) => (m.status || "").toLowerCase() !== "done")
      .slice(0, 5)
      .forEach((m) => tasks.push({ track: "Java", label: m.name }));
  }

  const catTopics = [
    ...(cat && Array.isArray(cat.qaTopics) ? cat.qaTopics : []),
    ...(cat && Array.isArray(cat.dilrTopics) ? cat.dilrTopics : []),
    ...(cat && Array.isArray(cat.varcTopics) ? cat.varcTopics : []),
  ];
  catTopics
    .filter((t) => (t.status || "").toLowerCase() !== "done")
    .slice(0, 6)
    .forEach((t) => tasks.push({ track: "CAT", label: t.topic }));

  if (!tasks.length) {
    planBox.textContent = "No tasks defined yet. Add items in JSON under data/.";
    return;
  }

  let weights = { DSA: 1, Java: 1, CAT: 1 };
  if (mode === "dsa-heavy") weights = { DSA: 2, Java: 1, CAT: 1 };
  if (mode === "cat-heavy") weights = { DSA: 1, Java: 1, CAT: 2 };

  const totalWeight = weights.DSA + weights.Java + weights.CAT;
  const slotMinutes = hours * 60;
  const perWeight = slotMinutes / totalWeight;

  const segments = [
    { track: "DSA", minutes: Math.round(perWeight * weights.DSA) },
    { track: "Java", minutes: Math.round(perWeight * weights.Java) },
    { track: "CAT", minutes: Math.round(perWeight * weights.CAT) },
  ];

  const lines = segments.map((seg) => {
    const segTasks = tasks.filter((t) => t.track === seg.track).slice(0, 3);
    if (!segTasks.length) return `${seg.track}: ${seg.minutes} min (no tasks defined)`;
    const list = segTasks.map((t) => `- ${t.label}`).join("\n");
    return `${seg.track}: ~${seg.minutes} min\n${list}`;
  });

  planBox.innerHTML = lines.join("\n\n").replace(/\n/g, "<br>");
}

async function init() {
  const [dsa, java, cat, mocks, resources] = await Promise.all([
    loadJson("dsa_topics"),
    loadJson("java_topics"),
    loadJson("cat_topics"),
    loadJson("mock_tests"),
    loadJson("resources"),
  ]);

  renderDSA(dsa || { steps: [] });
  renderJava(java || { modules: [] });
  renderCAT(cat || { qaTopics: [], dilrTopics: [], varcTopics: [] });
  renderMocks(mocks || { catMocks: [], placementMocks: [] });
  renderResources(resources || { items: [] });
  computeSummary(dsa || { steps: [] }, java || { modules: [] }, cat || {});

  generatePlan(dsa || { steps: [] }, java || { modules: [] }, cat || {});

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setActiveView(btn.dataset.view));
  });

  document.getElementById("generatePlanBtn").addEventListener("click", () => {
    generatePlan(dsa || { steps: [] }, java || { modules: [] }, cat || {});
  });
}

window.addEventListener("DOMContentLoaded", init);
