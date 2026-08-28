/* Self-contained, non-evaluating JSX sandbox for the ZDS Alert. */

export const AlertSandbox = () => {
  const initialSource = `<Alert severity="info" title="Policy update scheduled">
  Changes take effect at the next sync window.
</Alert>
<Alert severity="success" title="Rule deployed">
  All 42 locations received the update.
</Alert>
<Alert severity="warning" title="Certificate expiring" tinted>
  The signing certificate expires in 14 days.
</Alert>
<Alert severity="danger" title="Sync failed">
  The last policy sync could not complete.
</Alert>`;

  const initialItems = [
    {
      severity: "info",
      title: "Policy update scheduled",
      body: "Changes take effect at the next sync window.",
      tinted: false,
    },
    {
      severity: "success",
      title: "Rule deployed",
      body: "All 42 locations received the update.",
      tinted: false,
    },
    {
      severity: "warning",
      title: "Certificate expiring",
      body: "The signing certificate expires in 14 days.",
      tinted: true,
    },
    {
      severity: "danger",
      title: "Sync failed",
      body: "The last policy sync could not complete.",
      tinted: false,
    },
  ];

  const iconPaths = {
    info: "M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    success: "m9 12 2 2 4-4m7 2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    warning:
      "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
    danger: "M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  };

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Alert> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Alert> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      normalizedTag = normalizedTag.replace(
        /(\s)tinted(?=\s|\/?>)(?=(?:[^"]*"[^"]*")*[^"]*$)(?=(?:[^']*'[^']*')*[^']*$)/g,
        '$1tinted="true"'
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
        throw new Error("Check that every Alert tag and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Place all text inside an <Alert> element.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Alert> element.");

      const allowedProps = ["severity", "title", "tinted"];
      const severities = ["info", "success", "warning", "danger"];
      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Alert") {
          throw new Error("Only <Alert> elements are supported on this page.");
        }
        if (node.children.length) throw new Error("Alert children must be plain text.");

        Array.from(node.attributes).forEach((attribute) => {
          if (!allowedProps.includes(attribute.name)) {
            throw new Error('Alert does not support the "' + attribute.name + '" prop here.');
          }
        });

        const severity = node.getAttribute("severity") || "info";
        if (!severities.includes(severity)) {
          throw new Error('Unknown Alert severity "' + severity + '".');
        }
        const title = node.getAttribute("title") || "";
        if (!title.trim()) throw new Error("Every Alert needs a title prop.");
        const body = node.textContent.replace(/\s+/g, " ").trim();
        if (!body) throw new Error("Every Alert needs supporting text.");

        return {
          severity,
          title,
          body,
          tinted: readBoolean(node, "tinted", false),
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Alert markup could not be read." };
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
        <span className="zds-code-sandbox__filename">Alert.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="alert-sandbox-source">
            Editable Alert JSX
          </label>
          <textarea
            id="alert-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="alert-sandbox-help alert-sandbox-status"
            spellCheck={false}
          />
          <p id="alert-sandbox-help" className="zds-code-sandbox__help">
            Supports text children plus the documented severity, title, and tinted props.
          </p>
        </div>
        <div className="zds-code-sandbox__result-pane">
          <div className="zds-code-sandbox__result-header">
            <span>Result</span>
            <span>{items.length}</span>
          </div>
          <div className="zds-code-sandbox__preview zds-preview">
            <div className="zds-code-sandbox__examples zds-code-sandbox__examples--stack">
              {items.map((item, index) => {
                const classes = [
                  "zds-alert",
                  "zds-alert--" + item.severity,
                  item.tinted ? "zds-alert--tinted" : "",
                  "zds-code-sandbox__alert",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div key={index + "-" + item.title} className={classes} role="alert">
                    <span className="zds-alert__icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={iconPaths[item.severity]} />
                      </svg>
                    </span>
                    <span>
                      <p className="zds-alert__title">{item.title}</p>
                      <p className="zds-alert__body">{item.body}</p>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div
        id="alert-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
