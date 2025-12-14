import { useEffect, useState } from "react";
import { api } from "./api";
import "./index.css";

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadIdeas() {
    const res = await api.get("/ideas");
    setIdeas(res.data);
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdea(id) {
    setSelectedId(id);
    const res = await api.get(`/idea/${id}`);
    setSelectedIdea(res.data);
  }

  async function submitIdea() {
    if (!prompt.trim()) return;
    setLoading(true);
    await api.post("/idea", { idea: prompt });
    setPrompt("");
    setLoading(false);
    loadIdeas();
  }

  async function deleteIdea(id) {
    const confirm = window.confirm("Delete this idea?");
    if (!confirm) return;

    await api.delete(`/idea/${id}`);

    if (selectedId === id) {
      setSelectedId(null);
      setSelectedIdea(null);
    }

    loadIdeas();
  }

  const filteredIdeas = ideas.filter(i =>
    i.prompt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <h2>💡 Ideas</h2>

        <input
          className="search"
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="new-idea">
          <textarea
            placeholder="New startup idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button onClick={submitIdea} disabled={loading}>
            {loading ? "Thinking..." : "Add"}
          </button>
        </div>

        <ul className="idea-list">
          {filteredIdeas.map(i => (
            <li
              key={i._id}
              className={selectedId === i._id ? "active" : ""}
            >
              <span onClick={() => loadIdea(i._id)}>
                {i.prompt}
              </span>

              <button
                className="delete-btn"
                onClick={() => deleteIdea(i._id)}
              >
                🗑
              </button>
            </li>
          ))}

          {filteredIdeas.length === 0 && (
            <li className="empty-list">No results</li>
          )}
        </ul>
      </aside>

      {/* RIGHT CHAT PANEL */}
      <main className="chat">
        {!selectedIdea ? (
          <div className="empty">
            Select an idea from the left 👈
          </div>
        ) : (
          <ChatView idea={selectedIdea} />
        )}
      </main>
    </div>
  );
}

/* ---------- CHAT VIEW ---------- */
function ChatView({ idea }) {
  const r = idea.response || {};

  return (
    <div className="chat-content">
      <div className="bubble user">{idea.prompt}</div>

      <div className="bubble ai">
        <Section title="Problem" value={r.problem} />
        <Section title="Customer" value={r.customer} />
        <Section title="Market" value={r.market} />
        <Section title="Risk Level" value={r.risk_level} />
        <Section title="Profitability" value={`${r.profitability_score}/100`} />

        <Section title="Tech Stack">
          {Array.isArray(r.tech_stack) ? r.tech_stack.join(", ") : "N/A"}
        </Section>

        <Section title="Competitors">
          <ul>
            {Array.isArray(r.competitor)
              ? r.competitor.map((c, i) => (
                  <li key={i}>
                    <b>{c.name}</b>: {c.differentiation}
                  </li>
                ))
              : "N/A"}
          </ul>
        </Section>

        <Section title="Justification" value={r.justification} />
      </div>
    </div>
  );
}

function Section({ title, value, children }) {
  return (
    <div className="section">
      <strong>{title}</strong>
      <div>{children || value || "N/A"}</div>
    </div>
  );
}
