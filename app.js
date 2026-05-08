const DATA_BASE = "./data";

// global state to keep task statuses in memory + localStorage
let state = {
  dsa: null,
  java: null,
  cat: null,
  overrides: {}, // { "type:id": "Done" }
};

function loadOverrides() {
  try {
    const raw = localStorage.getItem("vyomTaskOverrides");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (_) {
    return {};
  }
}

function saveOverrides() {
  try {
    localStorage.setItem("vyomTaskOverrides", JSON.stringify(state.overrides));
  } catch (_) {
    // ignore
  }
}

function overrideKey(kind, id) {
  return `${kind}:${id}`;
}

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

function applyStatus(kind, id, originalStatus) {
  const key = overrideKey(kind, id);
  return state.overrides[key] || originalStatus || "Not Started";
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

/* ---------- RENDERERS: TABLE STYLE + SELECT ---------- */

function renderDSA() {
  const dsa = state.dsa;
  const container = document.getElementById("dsaContainer");
  if (!container || !dsa || !Array.isArray(dsa.steps)) return;

  let html = `
    <table class="task-table">
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Step / Description</th>
          <th style="width:120px;">Tags</th>
          <th style="width:120px;">Status</th>
          <th style="width:200px;">Links</th>
        </tr>
      </thead>
      <tbody>
  `;

  dsa.steps.forEach((step, idx) => {
    const id = step.id || idx;
    const status = applyStatus("dsa", id, step.status);
    const res = step.resources || {};
    const links = [];
    if (res.sheet) links.push(`<a href="${res.sheet}" target="_blank" rel="noreferrer">Sheet</a>`);
    if (res.playlist) links.push(`<a href="${res.playlist}" target="_blank" rel="noreferrer">Playlist</a>`);
    if (res.extraPlaylist) links.push(`<a href="${res.extraPlaylist}" target="_blank" rel="noreferrer">Extra</a>`);
    const tags = safeList(step.tags).map((t) => `<span class="chip">${t}</span>`).join("");

    html += `
      <tr data-kind="dsa" data-id="${id}">
        <td>${idx + 1}</td>
        <td>
          <strong>${step.name}</strong><br>
          <small>${step.description || ""}</small>
        </td>
        <td>
          <div class="chip-row">${tags || ""}</div>
        </td>
        <td>
          <select class="status-select">
            <option value="Not Started"${status === "Not Started" ? " selected" : ""}>Not Started</option>
            <option value="In Progress"${status === "In Progress" ? " selected" : ""}>In Progress</option>
            <option value="Done"${status === "Done" ? " selected" : ""}>Done</option>
          </select>
          <div style="margin-top:4px;">${statusBadge(status)}</div>
        </td>
        <td>
          <div class="link-row">${links.join(" ")}</div>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function renderJava() {
  const java = state.java;
  const container = document.getElementById("javaContainer");
  if (!container || !java || !Array.isArray(java.modules)) return;

  let html = `
    <table class="task-table">
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Module / Description</th>
          <th style="width:120px;">Tags</th>
          <th style="width:120px;">Status</th>
          <th style="width:200px;">Links</th>
        </tr>
      </thead>
      <tbody>
  `;

  java.modules.forEach((m, idx) => {
    const id = m.id || idx;
    const status = applyStatus("java", id, m.status);
    const links = [];
    safeList(m.resources).forEach((r) => {
      if (r.url) links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Link"}</a>`);
    });
    const tags = safeList(m.tags).map((t) => `<span class="chip">${t}</span>`).join("");

    html += `
      <tr data-kind="java" data-id="${id}">
        <td>${idx + 1}</td>
        <td>
          <strong>${m.name}</strong><br>
          <small>${m.description || ""}</small>
        </td>
        <td><div class="chip-row">${tags || ""}</div></td>
        <td>
          <select class="status-select">
            <option value="Not Started"${status === "Not Started" ? " selected" : ""}>Not Started</option>
            <option value="In Progress"${status === "In Progress" ? " selected" : ""}>In Progress</option>
            <option value="Done"${status === "Done" ? " selected" : ""}>Done</option>
          </select>
          <div style="margin-top:4px;">${statusBadge(status)}</div>
        </td>
        <td><div class="link-row">${links.join(" ")}</div></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function renderCAT() {
  const cat = state.cat;
  const container = document.getElementById("catContainer");
  if (!container || !cat) return;

  const sections = [
    ["QA", cat.qaTopics],
    ["DILR", cat.dilrTopics],
    ["VARC", cat.varcTopics],
  ];

  let html = "";

  sections.forEach(([label, topics]) => {
    if (!Array.isArray(topics) || !topics.length) return;
    html += `<h2 style="margin:8px 0 4px;font-size:14px;">${label}</h2>`;
    html += `
      <table class="task-table">
        <thead>
          <tr>
            <th style="width:40px;">#</th>
            <th>Topic</th>
            <th style="width:80px;">Weightage</th>
            <th style="width:120px;">Status</th>
            <th style="width:220px;">Links</th>
          </tr>
        </thead>
        <tbody>
    `;
    topics.forEach((t, idx) => {
      const id = t.id || `${label}-${idx}`;
      const status = applyStatus("cat", id, t.status);
      const links = [];
      safeList(t.youtube).forEach((r) => r.url && links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Video"}</a>`));
      safeList(t.practice).forEach((r) => r.url && links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Practice"}</a>`));
      safeList(t.reading).forEach((r) => r.url && links.push(`<a href="${r.url}" target="_blank" rel="noreferrer">${r.label || "Reading"}</a>`));

      html += `
        <tr data-kind="cat" data-id="${id}">
          <td>${idx + 1}</td>
          <td>${t.topic}</td>
          <td>${t.weightage || "-"}</td>
          <td>
            <select class="status-select">
              <option value="Not Started"${status === "Not Started" ? " selected" : ""}>Not Started</option>
              <option value="In Progress"${status === "In Progress" ? " selected" : ""}>In Progress</option>
              <option value="Done"${status === "Done" ? " selected" : ""}>Done</option>
            </select>
            <div style="margin-top:4px;">${statusBadge(status)}</div>
          </td>
          <td><div class="link-row">${links.join(" ")}</div></td>
        </tr>
      `;
    });
    html += "</tbody></table>";
  });

  container.innerHTML = html;
}

function renderMocks(mocks) {
  const container = document.getElementById("mocksContainer");
  if (!container || !mocks) return;
  const all = [
    ...(Array.isArray(mocks.catMocks) ? mocks.catMocks : []),
    ...(Array.isArray(mocks.placementMocks) ? mocks.placementMocks : []),
  ];
  if (!all.length) {
    container.textContent = "No mocks configured yet.";
    return;
  }
  let html = `
    <table class="task-table">
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Mock Name</th>
          <th style="width:120px;">Provider</th>
          <th style="width:120px;">Status</th>
          <th style="width:200px;">Link</th>
        </tr>
      </thead>
      <tbody>
  `;
  all.forEach((m, idx) => {
    const id = m.id || idx;
    const status = applyStatus("mock", id, m.status);
    html += `
      <tr data-kind="mock" data-id="${id}">
        <td>${idx + 1}</td>
        <td>${m.name}</td>
        <td>${m.provider || "-"}</td>
        <td>${statusBadge(status)}</td>
        <td>
          <div class="link-row">
            ${m.url ? `<a href="${m.url}" target="_blank" rel="noreferrer">Open</a>` : ""}
          </div>
        </td>
      </tr>
    `;
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

function renderResources(resources) {
  const container = document.getElementById("resourcesContainer");
  if (!container || !Array.isArray(resources.items)) return;
  const items = resources.items;
  if (!items.length) {
    container.textContent = "No resources configured yet.";
    return;
  }
  let html = `
    <table class="task-table">
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Resource</th>
          <th style="width:100px;">Track</th>
          <th style="width:260px;">Link</th>
        </tr>
      </thead>
      <tbody>
  `;
  items.forEach((r, idx) => {
    html += `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <strong>${r.name}</strong><br>
          <small>${r.description || ""}</small>
        </td>
        <td>${r.track || "General"}</td>
        <td>
          <div class="link-row">
            ${r.url ? `<a href="${r.url}" target="_blank" rel="noreferrer">Open</a>` : ""}
          </div>
        </td>
      </tr>
    `;
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

/* ---------- SUMMARY + PLAN ---------- */

function computeSummary() {
  const dsa = state.dsa;
  const java = state.java;
  const cat = state.cat;

  const dsaCount = dsa && Array.isArray(dsa.steps) ? dsa.steps.length : 0;
  const dsaDone = dsa && Array.isArray(dsa.steps)
    ? dsa.steps.filter((s, idx) => applyStatus("dsa", s.id || idx, s.status) === "Done").length
    : 0;

  const javaCount = java && Array.isArray(java.modules) ? java.modules.length : 0;
  const javaDone = java && Array.isArray(java.modules)
    ? java.modules.filter((m, idx) => applyStatus("java", m.id || idx, m.status) === "Done").length
    : 0;

  const catTopics = [
    ...(cat && Array.isArray(cat.qaTopics) ? cat.qaTopics : []),
    ...(cat && Array.isArray(cat.dilrTopics) ? cat.dilrTopics : []),
    ...(cat && Array.isArray(cat.varcTopics) ? cat.varcTopics : []),
  ];
  const catCount = catTopics.length;
  const catDone = catTopics.filter((t, idx) =>
    applyStatus("cat", t.id || idx, t.status) === "Done"
  ).length;

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

function generatePlan() {
  const dsa = state.dsa || { steps: [] };
  const java = state.java || { modules: [] };
  const cat = state.cat || { qaTopics: [], dilrTopics: [], varcTopics: [] };

  const hoursInput = document.getElementById("hoursInput");
  const modeSelect = document.getElementById("prioritySelect");
  const planBox = document.getElementById("todayPlan");

  const hours = Math.max(1, Number(hoursInput.value) || 1);
  const mode = modeSelect.value;

  const tasks = [];

  if (Array.isArray(dsa.steps)) {
    dsa.steps
      .map((s, idx) => ({ step: s, idx }))
      .filter(({ step, idx }) => applyStatus("dsa", step.id || idx, step.status) !== "Done")
      .slice(0, 5)
      .forEach(({ step }) => tasks.push({ track: "DSA", label: step.name }));
  }

  if (Array.isArray(java.modules)) {
    java.modules
      .map((m, idx) => ({ mod: m, idx }))
      .filter(({ mod, idx }) => applyStatus("java", mod.id || idx, mod.status) !== "Done")
      .slice(0, 5)
      .forEach(({ mod }) => tasks.push({ track: "Java", label: mod.name }));
  }

  const catTopics = [
    ...(Array.isArray(cat.qaTopics) ? cat.qaTopics.map((t, i) => ({ t, id: `QA-${i}` })) : []),
    ...(Array.isArray(cat.dilrTopics) ? cat.dilrTopics.map((t, i) => ({ t, id: `DILR-${i}` })) : []),
    ...(Array.isArray(cat.varcTopics) ? cat.varcTopics.map((t, i) => ({ t, id: `VARC-${i}` })) : []),
  ];

  catTopics
    .filter(({ t, id }) => applyStatus("cat", t.id || id, t.status) !== "Done")
    .slice(0, 6)
    .forEach(({ t }) => tasks.push({ track: "CAT", label: t.topic }));

  if (!tasks.length) {
    planBox.textContent = "No pending tasks. Either JSON is empty or everything is Done.";
    return;
  }

  let weights = { DSA: 1, Java: 1, CAT: 1 };
  if (mode === "dsa-heavy") weights = { DSA: 2, Java: 1, CAT: 1 };
  if (mode === "cat-heavy") weights = { DSA: 1, Java: 1, CAT: 2 };

  const totalWeight = weights.DSA + weights.Java + weights.CAT;
  const totalMinutes = hours * 60;
  const perWeight = totalMinutes / totalWeight;

  const segments = [
    { track: "DSA", minutes: Math.round(perWeight * weights.DSA) },
    { track: "Java", minutes: Math.round(perWeight * weights.Java) },
    { track: "CAT", minutes: Math.round(perWeight * weights.CAT) },
  ];

  const lines = segments.map((seg) => {
    const segTasks = tasks.filter((t) => t.track === seg.track).slice(0, 3);
    if (!segTasks.length) return `${seg.track}: ${seg.minutes} min (no tasks pending)`;
    const list = segTasks.map((t) => `- ${t.label}`).join("\n");
    return `${seg.track}: ~${seg.minutes} min\n${list}`;
  });

  planBox.innerHTML = lines.join("\n\n").replace(/\n/g, "<br>");
}

/* ---------- EVENT BINDING & INIT ---------- */

function bindStatusChange() {
  // delegated listener for all status-select elements
  document.addEventListener("change", (e) => {
    const select = e.target;
    if (!select.classList.contains("status-select")) return;
    const tr = select.closest("tr");
    if (!tr) return;
    const kind = tr.dataset.kind;
    const id = tr.dataset.id;
    if (!kind || id === undefined) return;

    const value = select.value;
    cons