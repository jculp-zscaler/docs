/*
  Interactive token browser for /foundations/design-tokens.
  Token data is inlined (the JSX sandbox does not allow JSON imports).
  Values mirror styles/zds.css — that file is the source of truth.
  Each row: [name, value, category, alias, usedBy]
  usedBy entries are [label, href] — empty href renders a non-link chip.
*/

export const TokenBrowser = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState("");

  const tokens = [
    ["--zds-blue-50", "#eef4fe", "Color", "", [["--zds-color-primary-subtle", ""]]],
    ["--zds-blue-100", "#d9e6fd", "Color", "", []],
    ["--zds-blue-200", "#b3cdfb", "Color", "", []],
    ["--zds-blue-300", "#7fa9f9", "Color", "", []],
    ["--zds-blue-400", "#4c86f7", "Color", "", []],
    ["--zds-blue-500", "#2066ee", "Color", "", [["--zds-color-primary", ""]]],
    ["--zds-blue-600", "#1a55c4", "Color", "", [["--zds-color-primary-hover", ""]]],
    ["--zds-blue-700", "#134093", "Color", "", []],
    ["--zds-blue-800", "#0d2b62", "Color", "", []],
    ["--zds-blue-900", "#07142e", "Color", "", []],
    ["--zds-neutral-0", "#ffffff", "Color", "", [["--zds-color-bg-surface", ""]]],
    ["--zds-neutral-50", "#f7faff", "Color", "", [["--zds-color-bg-subtle", ""]]],
    ["--zds-neutral-100", "#eef2f9", "Color", "", [["--zds-color-bg-muted", ""]]],
    ["--zds-neutral-200", "#dce3ef", "Color", "", [["--zds-color-border", ""]]],
    ["--zds-neutral-300", "#c2ccdd", "Color", "", [["--zds-color-border-strong", ""]]],
    ["--zds-neutral-400", "#98a5bc", "Color", "", []],
    ["--zds-neutral-500", "#6e7d96", "Color", "", [["--zds-color-text-muted", ""]]],
    ["--zds-neutral-600", "#4e5b72", "Color", "", [["--zds-color-text-secondary", ""]]],
    ["--zds-neutral-700", "#364259", "Color", "", []],
    ["--zds-neutral-800", "#1e2a40", "Color", "", []],
    ["--zds-neutral-900", "#0f1b31", "Color", "", [["--zds-color-text", ""]]],
    ["--zds-neutral-950", "#07142e", "Color", "", []],
    ["--zds-green-100", "#d7f2e7", "Color", "", [["--zds-color-success-subtle", ""]]],
    ["--zds-green-500", "#0e9f6e", "Color", "", [["--zds-color-success", ""]]],
    ["--zds-green-600", "#0b7f58", "Color", "", [["--zds-color-success-hover", ""]]],
    ["--zds-amber-100", "#fbeeda", "Color", "", [["--zds-color-warning-subtle", ""]]],
    ["--zds-amber-500", "#d97706", "Color", "", [["--zds-color-warning", ""]]],
    ["--zds-amber-600", "#b45f04", "Color", "", [["--zds-color-warning-hover", ""]]],
    ["--zds-red-100", "#fbdde3", "Color", "", [["--zds-color-danger-subtle", ""]]],
    ["--zds-red-500", "#dc2643", "Color", "", [["--zds-color-danger", ""]]],
    ["--zds-red-600", "#b21e36", "Color", "", [["--zds-color-danger-hover", ""]]],
    ["--zds-color-primary", "#2066ee", "Semantic", "--zds-blue-500", [
      ["Button", "/components/button"],
      ["Input", "/components/input"],
      ["Select", "/components/select"],
      ["Toggle", "/components/toggle"],
      ["Alert", "/components/alert"],
    ]],
    ["--zds-color-primary-hover", "#1a55c4", "Semantic", "--zds-blue-600", [
      ["Button", "/components/button"],
    ]],
    ["--zds-color-primary-subtle", "#eef4fe", "Semantic", "--zds-blue-50", [
      ["Button", "/components/button"],
      ["Badge", "/components/badge"],
      ["Alert", "/components/alert"],
    ]],
    ["--zds-color-bg-surface", "#ffffff", "Semantic", "--zds-neutral-0", [
      ["Card", "/components/card"],
      ["Modal", "/components/modal"],
      ["Button", "/components/button"],
      ["Alert", "/components/alert"],
      ["Input", "/components/input"],
    ]],
    ["--zds-color-bg-subtle", "#f7faff", "Semantic", "--zds-neutral-50", [
      ["Card", "/components/card"],
      ["Modal", "/components/modal"],
    ]],
    ["--zds-color-bg-muted", "#eef2f9", "Semantic", "--zds-neutral-100", [
      ["Badge", "/components/badge"],
    ]],
    ["--zds-color-border", "#dce3ef", "Semantic", "--zds-neutral-200", [
      ["Card", "/components/card"],
      ["Alert", "/components/alert"],
      ["Modal", "/components/modal"],
    ]],
    ["--zds-color-border-strong", "#c2ccdd", "Semantic", "--zds-neutral-300", [
      ["Input", "/components/input"],
      ["Select", "/components/select"],
      ["Toggle", "/components/toggle"],
      ["Button", "/components/button"],
    ]],
    ["--zds-color-text", "#0f1b31", "Semantic", "--zds-neutral-900", [
      ["Button", "/components/button"],
      ["Alert", "/components/alert"],
      ["Card", "/components/card"],
      ["Input", "/components/input"],
      ["Modal", "/components/modal"],
      ["Toggle", "/components/toggle"],
    ]],
    ["--zds-color-text-secondary", "#4e5b72", "Semantic", "--zds-neutral-600", [
      ["Alert", "/components/alert"],
      ["Card", "/components/card"],
      ["Modal", "/components/modal"],
      ["Badge", "/components/badge"],
    ]],
    ["--zds-color-text-muted", "#6e7d96", "Semantic", "--zds-neutral-500", [
      ["Input", "/components/input"],
      ["Modal", "/components/modal"],
    ]],
    ["--zds-color-text-inverse", "#ffffff", "Semantic", "", [
      ["Button", "/components/button"],
    ]],
    ["--zds-color-success", "#0e9f6e", "Semantic", "--zds-green-500", [
      ["Alert", "/components/alert"],
      ["Badge", "/components/badge"],
    ]],
    ["--zds-color-success-subtle", "#d7f2e7", "Semantic", "--zds-green-100", [
      ["Badge", "/components/badge"],
      ["Alert", "/components/alert"],
    ]],
    ["--zds-color-success-hover", "#0b7f58", "Semantic", "--zds-green-600", []],
    ["--zds-color-warning", "#d97706", "Semantic", "--zds-amber-500", [
      ["Alert", "/components/alert"],
      ["Badge", "/components/badge"],
    ]],
    ["--zds-color-warning-subtle", "#fbeeda", "Semantic", "--zds-amber-100", [
      ["Badge", "/components/badge"],
      ["Alert", "/components/alert"],
    ]],
    ["--zds-color-warning-hover", "#b45f04", "Semantic", "--zds-amber-600", []],
    ["--zds-color-danger", "#dc2643", "Semantic", "--zds-red-500", [
      ["Button", "/components/button"],
      ["Input", "/components/input"],
      ["Alert", "/components/alert"],
      ["Badge", "/components/badge"],
    ]],
    ["--zds-color-danger-subtle", "#fbdde3", "Semantic", "--zds-red-100", [
      ["Badge", "/components/badge"],
      ["Alert", "/components/alert"],
    ]],
    ["--zds-color-danger-hover", "#b21e36", "Semantic", "--zds-red-600", [
      ["Button", "/components/button"],
    ]],
    ["--zds-space-1", "4px", "Spacing", "", []],
    ["--zds-space-2", "8px", "Spacing", "", []],
    ["--zds-space-3", "12px", "Spacing", "", []],
    ["--zds-space-4", "16px", "Spacing", "", []],
    ["--zds-space-5", "20px", "Spacing", "", []],
    ["--zds-space-6", "24px", "Spacing", "", []],
    ["--zds-space-7", "32px", "Spacing", "", []],
    ["--zds-space-8", "40px", "Spacing", "", []],
    ["--zds-space-9", "48px", "Spacing", "", []],
    ["--zds-space-10", "64px", "Spacing", "", []],
    ["--zds-radius-sm", "6px", "Radius", "", [
      ["Button", "/components/button"],
      ["Select", "/components/select"],
    ]],
    ["--zds-radius-md", "10px", "Radius", "", [
      ["Button", "/components/button"],
      ["Alert", "/components/alert"],
    ]],
    ["--zds-radius-lg", "16px", "Radius", "", [
      ["Card", "/components/card"],
      ["Modal", "/components/modal"],
    ]],
    ["--zds-radius-full", "999px", "Radius", "", [
      ["Toggle", "/components/toggle"],
      ["Badge", "/components/badge"],
    ]],
    ["--zds-shadow-1", "0 1px 2px rgba(7,20,46,.08)", "Elevation", "", [
      ["Card", "/components/card"],
    ]],
    ["--zds-shadow-2", "0 2px 8px rgba(7,20,46,.10)", "Elevation", "", []],
    ["--zds-shadow-3", "0 8px 24px rgba(7,20,46,.14)", "Elevation", "", [
      ["Card", "/components/card"],
    ]],
    ["--zds-shadow-4", "0 16px 48px rgba(7,20,46,.20)", "Elevation", "", [
      ["Modal", "/components/modal"],
    ]],
    ["--zds-font-family", "GTHaptikFont", "Typography", "", []],
    ["--zds-font-mono", "ui-monospace", "Typography", "", []],
    ["--zds-ease", "cubic-bezier(.2,0,0,1)", "Motion", "", [
      ["Toggle", "/components/toggle"],
    ]],
    ["--zds-duration", "160ms", "Motion", "", [
      ["Toggle", "/components/toggle"],
    ]],
  ];

  const categories = ["All", "Color", "Semantic", "Spacing", "Radius", "Elevation", "Typography", "Motion"];

  const q = query.trim().toLowerCase();
  const visible = tokens.filter((t) => {
    if (category !== "All" && t[2] !== category) return false;
    if (!q) return true;
    if (t[0].indexOf(q) !== -1 || t[1].toLowerCase().indexOf(q) !== -1) return true;
    if (t[3] && t[3].indexOf(q) !== -1) return true;
    return t[4].some((u) => u[0].toLowerCase().indexOf(q) !== -1);
  });

  const copy = (name) => {
    navigator.clipboard.writeText("var(" + name + ")").then(() => {
      setCopied(name);
      setTimeout(() => setCopied(""), 1200);
    });
  };

  const preview = (t) => {
    const value = t[1];
    const cat = t[2];
    if (cat === "Color" || cat === "Semantic") {
      return <span className="zds-token-preview" style={{ background: value }} />;
    }
    if (cat === "Spacing") {
      return <span className="zds-token-preview" style={{ width: value, background: "var(--zds-color-primary)", border: "none", height: "12px" }} />;
    }
    if (cat === "Radius") {
      return <span className="zds-token-preview" style={{ borderRadius: value, background: "var(--zds-color-primary-subtle)", borderColor: "var(--zds-color-primary)" }} />;
    }
    if (cat === "Elevation") {
      return <span className="zds-token-preview" style={{ boxShadow: value, background: "var(--zds-color-bg-surface)" }} />;
    }
    return <span style={{ fontSize: "11px", color: "var(--zds-color-text-muted)" }}>Aa</span>;
  };

  const usedBy = (items, asCode) => {
    if (!items.length) {
      return <span className="zds-token-alias">—</span>;
    }
    return (
      <div className="zds-token-usedby">
        {items.map((u) =>
          u[1] ? (
            <a key={u[0]} className="zds-token-chip" href={u[1]}>
              {u[0]}
            </a>
          ) : (
            <span key={u[0]} className={"zds-token-chip" + (asCode ? " zds-token-chip--code" : "")}>
              {u[0]}
            </span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="not-prose">
      <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
        <input
          className="zds-input"
          style={{ maxWidth: "260px" }}
          placeholder={"Search " + tokens.length + " tokens…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tokens"
        />
        <select
          className="zds-select"
          style={{ maxWidth: "180px" }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="zds-token-table-wrap">
        <table className="zds-token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Preview</th>
              <th>Value</th>
              <th>Alias</th>
              <th>Used by</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t[0]}>
                <td>{t[0]}</td>
                <td>{preview(t)}</td>
                <td>{t[1]}</td>
                <td className="zds-token-alias">{t[3] ? "var(" + t[3] + ")" : "—"}</td>
                <td>{usedBy(t[4], t[2] === "Color")}</td>
                <td>
                  <button className="zds-token-copy" onClick={() => copy(t[0])}>
                    {copied === t[0] ? "Copied" : "Copy"}
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px" }}>
                  No tokens match "{query}".
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
