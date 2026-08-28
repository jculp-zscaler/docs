/*
  Interactive token relationship graph for /foundations/design-tokens.
  Primitive → semantic alias → every documented consumer.
  Data lives inside the export — the JSX sandbox does not keep
  module-level bindings in scope when it evals the component.
*/

export const TokenTree = () => {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("All");
  const [selectedId, setSelectedId] = useState("--zds-blue-500");
  const [selectedAlias, setSelectedAlias] = useState("--zds-color-primary");

  const groups = ["All", "Brand", "Neutral", "Status"];

  const graph = [
  {
    primitive: "--zds-blue-50",
    hex: "#eef4fe",
    group: "Brand",
    aliases: [
      {
        name: "--zds-color-primary-subtle",
        role: "Tinted brand surface",
        consumers: [
          { name: "Button", href: "/components/button", role: "Ghost hover background" },
          { name: "Badge", href: "/components/badge", role: "Brand background" },
          { name: "Alert", href: "/components/alert", role: "Tinted info background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-blue-500",
    hex: "#2066ee",
    group: "Brand",
    aliases: [
      {
        name: "--zds-color-primary",
        role: "Brand and interactive fill",
        consumers: [
          { name: "Button", href: "/components/button", role: "Primary background" },
          { name: "Input", href: "/components/input", role: "Focus border" },
          { name: "Select", href: "/components/select", role: "Focus border" },
          { name: "Toggle", href: "/components/toggle", role: "Checked track" },
          { name: "Alert", href: "/components/alert", role: "Info accent" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-blue-600",
    hex: "#1a55c4",
    group: "Brand",
    aliases: [
      {
        name: "--zds-color-primary-hover",
        role: "Brand hover fill",
        consumers: [
          { name: "Button", href: "/components/button", role: "Primary hover background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-0",
    hex: "#ffffff",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-bg-surface",
        role: "Raised surface",
        consumers: [
          { name: "Card", href: "/components/card", role: "Card background" },
          { name: "Modal", href: "/components/modal", role: "Panel background" },
          { name: "Button", href: "/components/button", role: "Secondary background" },
          { name: "Alert", href: "/components/alert", role: "Default background" },
          { name: "Input", href: "/components/input", role: "Field background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-50",
    hex: "#f7faff",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-bg-subtle",
        role: "Recessed surface",
        consumers: [
          { name: "Card", href: "/components/card", role: "Footer background" },
          { name: "Modal", href: "/components/modal", role: "Footer background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-100",
    hex: "#eef2f9",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-bg-muted",
        role: "Muted fill",
        consumers: [
          { name: "Badge", href: "/components/badge", role: "Neutral background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-200",
    hex: "#dce3ef",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-border",
        role: "Default border",
        consumers: [
          { name: "Card", href: "/components/card", role: "Card border" },
          { name: "Alert", href: "/components/alert", role: "Outline" },
          { name: "Modal", href: "/components/modal", role: "Header and footer rules" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-300",
    hex: "#c2ccdd",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-border-strong",
        role: "Strong border",
        consumers: [
          { name: "Input", href: "/components/input", role: "Resting border" },
          { name: "Select", href: "/components/select", role: "Resting border" },
          { name: "Toggle", href: "/components/toggle", role: "Unchecked track" },
          { name: "Button", href: "/components/button", role: "Secondary border" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-500",
    hex: "#6e7d96",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-text-muted",
        role: "Tertiary text",
        consumers: [
          { name: "Input", href: "/components/input", role: "Placeholder and hint" },
          { name: "Modal", href: "/components/modal", role: "Close control" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-600",
    hex: "#4e5b72",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-text-secondary",
        role: "Secondary text",
        consumers: [
          { name: "Alert", href: "/components/alert", role: "Body copy" },
          { name: "Card", href: "/components/card", role: "Description" },
          { name: "Modal", href: "/components/modal", role: "Body copy" },
          { name: "Badge", href: "/components/badge", role: "Neutral and outline label" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-neutral-900",
    hex: "#0f1b31",
    group: "Neutral",
    aliases: [
      {
        name: "--zds-color-text",
        role: "Primary text",
        consumers: [
          { name: "Button", href: "/components/button", role: "Secondary label" },
          { name: "Alert", href: "/components/alert", role: "Title" },
          { name: "Card", href: "/components/card", role: "Title" },
          { name: "Input", href: "/components/input", role: "Value and label" },
          { name: "Modal", href: "/components/modal", role: "Title" },
          { name: "Toggle", href: "/components/toggle", role: "Label" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-green-100",
    hex: "#d7f2e7",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-success-subtle",
        role: "Success surface",
        consumers: [
          { name: "Badge", href: "/components/badge", role: "Success background" },
          { name: "Alert", href: "/components/alert", role: "Tinted success background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-green-500",
    hex: "#0e9f6e",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-success",
        role: "Success accent",
        consumers: [
          { name: "Alert", href: "/components/alert", role: "Success accent" },
          { name: "Badge", href: "/components/badge", role: "Success label" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-green-600",
    hex: "#0b7f58",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-success-hover",
        role: "Success hover",
        consumers: [],
      },
    ],
  },
  {
    primitive: "--zds-amber-100",
    hex: "#fbeeda",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-warning-subtle",
        role: "Warning surface",
        consumers: [
          { name: "Badge", href: "/components/badge", role: "Warning background" },
          { name: "Alert", href: "/components/alert", role: "Tinted warning background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-amber-500",
    hex: "#d97706",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-warning",
        role: "Warning accent",
        consumers: [
          { name: "Alert", href: "/components/alert", role: "Warning accent" },
          { name: "Badge", href: "/components/badge", role: "Warning label" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-amber-600",
    hex: "#b45f04",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-warning-hover",
        role: "Warning hover",
        consumers: [],
      },
    ],
  },
  {
    primitive: "--zds-red-100",
    hex: "#fbdde3",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-danger-subtle",
        role: "Danger surface",
        consumers: [
          { name: "Badge", href: "/components/badge", role: "Danger background" },
          { name: "Alert", href: "/components/alert", role: "Tinted danger background" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-red-500",
    hex: "#dc2643",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-danger",
        role: "Danger accent",
        consumers: [
          { name: "Button", href: "/components/button", role: "Danger background" },
          { name: "Input", href: "/components/input", role: "Error border and text" },
          { name: "Alert", href: "/components/alert", role: "Danger accent" },
          { name: "Badge", href: "/components/badge", role: "Danger label" },
        ],
      },
    ],
  },
  {
    primitive: "--zds-red-600",
    hex: "#b21e36",
    group: "Status",
    aliases: [
      {
        name: "--zds-color-danger-hover",
        role: "Danger hover",
        consumers: [
          { name: "Button", href: "/components/button", role: "Danger hover background" },
        ],
      },
    ],
  },
];

  const matchesQuery = (node, q) => {
    if (!q) return true;
    if (node.primitive.indexOf(q) !== -1 || node.hex.indexOf(q) !== -1) return true;
    return node.aliases.some(
      (a) =>
        a.name.indexOf(q) !== -1 ||
        a.role.toLowerCase().indexOf(q) !== -1 ||
        a.consumers.some(
          (c) => c.name.toLowerCase().indexOf(q) !== -1 || c.role.toLowerCase().indexOf(q) !== -1
        )
    );
  };

  const uniqueCount = (aliases) => {
    const seen = {};
    let n = 0;
    aliases.forEach((a) => {
      a.consumers.forEach((c) => {
        if (!seen[c.name]) {
          seen[c.name] = true;
          n += 1;
        }
      });
    });
    return n;
  };

  const plural = (n, one, many) => n + " " + (n === 1 ? one : many);

  const q = query.trim().toLowerCase();
  const visible = graph.filter((node) => (group === "All" || node.group === group) && matchesQuery(node, q));
  const selected = graph.filter((node) => node.primitive === selectedId)[0] || graph[1];
  const aliases = selected.aliases;
  const activeAliases = selectedAlias
    ? aliases.filter((a) => a.name === selectedAlias)
    : aliases;
  const consumers = [];
  activeAliases.forEach((a) => {
    a.consumers.forEach((c) =>
      consumers.push({ alias: a.name, name: c.name, href: c.href, role: c.role })
    );
  });
  const aliasCount = aliases.length;
  const consumerCount = uniqueCount(activeAliases);

  const pickPrimitive = (id) => {
    const node = graph.filter((n) => n.primitive === id)[0];
    setSelectedId(id);
    setSelectedAlias(node && node.aliases.length === 1 ? node.aliases[0].name : "");
  };

  const pickGroup = (next) => {
    setGroup(next);
    const nextVisible = graph.filter(
      (node) => (next === "All" || node.group === next) && matchesQuery(node, q)
    );
    if (nextVisible.length && !nextVisible.some((n) => n.primitive === selectedId)) {
      pickPrimitive(nextVisible[0].primitive);
    }
  };

  const onQuery = (next) => {
    setQuery(next);
    const lowered = next.trim().toLowerCase();
    const nextVisible = graph.filter(
      (node) => (group === "All" || node.group === group) && matchesQuery(node, lowered)
    );
    if (nextVisible.length && !nextVisible.some((n) => n.primitive === selectedId)) {
      pickPrimitive(nextVisible[0].primitive);
    }
  };

  const toggleAlias = (name) => {
    setSelectedAlias(selectedAlias === name && aliases.length > 1 ? "" : name);
  };

  return (
    <div className="not-prose">
      <div className="zds-token-tree">
        <div className="zds-token-tree__toolbar">
          <input
            className="zds-input"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search primitives, aliases, or components…"
            aria-label="Search the token graph"
          />
          <div className="zds-token-filter" role="group" aria-label="Filter primitives">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                className={"zds-token-filter__btn" + (group === g ? " zds-token-filter__btn--on" : "")}
                aria-pressed={group === g}
                onClick={() => pickGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="zds-token-tree__summary">
          <span className="zds-token-preview" style={{ background: selected.hex }} />
          <p>
            <code>{selected.primitive}</code> aliases{" "}
            <strong>{plural(aliasCount, "semantic token", "semantic tokens")}</strong> used by{" "}
            <strong>{plural(consumerCount, "component", "components")}</strong>
            <span className="zds-token-tree__hex">{selected.hex}</span>
          </p>
        </div>

        <div className="zds-token-tree__cols">
          <div className="zds-token-tree__col">
            <div className="zds-token-tree__col-head">
              <span>Primitive</span>
              <span>{visible.length}</span>
            </div>
            <div className="zds-token-tree__col-body">
              {visible.map((node) => (
                <button
                  key={node.primitive}
                  type="button"
                  className={
                    "zds-token-node" + (node.primitive === selected.primitive ? " zds-token-node--selected" : "")
                  }
                  aria-current={node.primitive === selected.primitive ? "true" : undefined}
                  onClick={() => pickPrimitive(node.primitive)}
                >
                  <span className="zds-token-preview" style={{ background: node.hex }} />
                  <span className="zds-token-node__text">
                    <span className="zds-token-node__name">{node.primitive}</span>
                    <span className="zds-token-node__meta">{node.hex}</span>
                  </span>
                </button>
              ))}
              {visible.length === 0 ? (
                <p className="zds-token-tree__empty">No primitives match that search.</p>
              ) : null}
            </div>
          </div>

          <div className="zds-token-tree__col">
            <div className="zds-token-tree__col-head">
              <span>Semantic</span>
              <span>{aliasCount}</span>
            </div>
            <div className="zds-token-tree__col-body">
              {aliases.map((alias) => (
                <button
                  key={alias.name}
                  type="button"
                  className={"zds-token-node" + (alias.name === selectedAlias ? " zds-token-node--selected" : "")}
                  aria-pressed={alias.name === selectedAlias}
                  onClick={() => toggleAlias(alias.name)}
                >
                  <span className="zds-token-preview" style={{ background: "var(" + alias.name + ")" }} />
                  <span className="zds-token-node__text">
                    <span className="zds-token-node__name">{alias.name}</span>
                    <span className="zds-token-node__meta">
                      {alias.role}
                      {" · "}
                      {plural(alias.consumers.length, "consumer", "consumers")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="zds-token-tree__col">
            <div className="zds-token-tree__col-head">
              <span>Consumers</span>
              <span>{consumers.length}</span>
            </div>
            <div className="zds-token-tree__col-body">
              {consumers.map((c) => (
                <a key={c.name + c.role} className="zds-token-consumer" href={c.href}>
                  <span className="zds-token-node__text">
                    <span className="zds-token-node__name">{c.name}</span>
                    <span className="zds-token-node__meta">{c.role}</span>
                  </span>
                  <span className="zds-token-consumer__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              ))}
              {consumers.length === 0 ? (
                <p className="zds-token-tree__empty">
                  No components consume this alias yet. It still remaps in dark mode.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
