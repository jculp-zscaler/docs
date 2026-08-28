/* Self-contained, non-evaluating JSX sandbox for the ZDS Badge. */

export const BadgeSandbox = () => {
  const initialSource = `<Badge tone="neutral" dot>Neutral</Badge>
<Badge tone="brand" dot>Brand</Badge>
<Badge tone="success" dot>Success</Badge>
<Badge tone="warning" dot>Warning</Badge>
<Badge tone="danger" dot>Danger</Badge>
<Badge tone="outline" dot>Outline</Badge>`;

  const initialItems = [
    { tone: "neutral", dot: true, label: "Neutral" },
    { tone: "brand", dot: true, label: "Brand" },
    { tone: "success", dot: true, label: "Success" },
    { tone: "warning", dot: true, label: "Warning" },
    { tone: "danger", dot: true, label: "Danger" },
    { tone: "outline", dot: true, label: "Outline" },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Badge> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Badge> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      normalizedTag = normalizedTag.replace(
        /(\s)dot(?=\s|\/?>)(?=(?:[^"]*"[^"]*")*[^"]*$)(?=(?:[^']*'[^']*')*[^']*$)/g,
        '$1dot="true"'
      );
      return normalizedTag;
    });
    if (/[{}]/.test(normalized)) {
      throw new Error("Only quoted strings and literal true/false values are supported.");
    }
    return normalized.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, "&amp;");
  };

  const readBoolean = (node, name, fallback) => {
    if (!node.hasAttribute(name)) return fallback;
    const value = node.getAttribute(name);
    if (value === "" || value === "true") return true;
    if (value === "false") return false;
    throw new Error('The "' + name + '" prop must be true or false.');
  };

  const parseSource = (value) => {
    try {
      const normalized = normalizeSource(value);
      const parsed = new DOMParser().parseFromString(
        "<SandboxRoot>" + normalized + "</SandboxRoot>",
        "application/xml"
      );
      if (parsed.querySelector("parsererror")) {
        throw new Error("Check that every Badge tag and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Place all text inside a <Badge> element.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Badge> element.");

      const allowedProps = ["tone", "dot"];
      const tones = ["neutral", "brand", "success", "warning", "danger", "outline"];
      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Badge") {
          throw new Error("Only <Badge> elements are supported on this page.");
        }
        if (node.children.length) throw new Error("Badge children must be plain text.");

        Array.from(node.attributes).forEach((attribute) => {
          if (!allowedProps.includes(attribute.name)) {
            throw new Error('Badge does not support the "' + attribute.name + '" prop here.');
          }
        });

        const tone = node.getAttribute("tone") || "neutral";
        if (!tones.includes(tone)) throw new Error('Unknown Badge tone "' + tone + '".');

        const label = node.textContent.replace(/\s+/g, " ").trim();
        if (!label) throw new Error("Every Badge needs text.");

        return { tone, dot: readBoolean(node, "dot", false), label };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Badge markup could not be read." };
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof DOMParser === "undefined") return;
      const result = parseSource(source);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems(result.items);
      setError("");
    }, 180);
    return () => clearTimeout(timer);
  }, [source]);

  const updateSource = (event) => {
    setSource(event.target.value);
    setCopyStatus("");
  };
  const resetSource = () => {
    setSource(initialSource);
    setCopyStatus("");
  };
  const copySource = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      setCopyStatus("Copy is unavailable in this browser.");
      return;
    }
    navigator.clipboard
      .writeText(source)
      .then(() => setCopyStatus("Copied JSX to the clipboard."))
      .catch(() => setCopyStatus("Copy failed. Select the code and copy it manually."));
  };

  const statusText = error
    ? error + " The last valid result remains visible."
    : copyStatus || items.length + (items.length === 1 ? " example rendered." : " examples rendered.");

  return (
    <div className="zds-code-sandbox not-prose">
      <div className="zds-code-sandbox__toolbar">
        <span className="zds-code-sandbox__filename">Badge.jsx</span>
        <span className="zds-code-sandbox__actions">
          <button type="button" className="zds-code-sandbox__action" onClick={resetSource}>
            Reset
          </button>
          <button type="button" className="zds-code-sandbox__action" onClick={copySource}>
            Copy code
          </button>
        </span>
      </div>
      <div className="zds-code-sandbox__workspace">
        <div className="zds-code-sandbox__editor-pane">
          <label className="zds-code-sandbox__label" htmlFor="badge-sandbox-source">
            Editable Badge JSX
          </label>
          <textarea
            id="badge-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="badge-sandbox-help badge-sandbox-status"
            spellCheck={false}
          />
          <p id="badge-sandbox-help" className="zds-code-sandbox__help">
            Supports text children plus the documented tone and dot props.
          </p>
        </div>
        <div className="zds-code-sandbox__result-pane">
          <div className="zds-code-sandbox__result-header">
            <span>Result</span>
            <span>{items.length}</span>
          </div>
          <div className="zds-code-sandbox__preview zds-preview">
            <div className="zds-code-sandbox__examples">
              {items.map((item, index) => (
                <span key={index + "-" + item.label} className={"zds-badge zds-badge--" + item.tone}>
                  {item.dot ? <span className="zds-badge__dot" /> : null}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        id="badge-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
