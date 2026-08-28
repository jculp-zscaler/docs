/* Self-contained, non-evaluating JSX sandbox for the ZDS Toggle. */

export const ToggleSandbox = () => {
  const initialSource = `<Toggle checked>On</Toggle>
<Toggle>Off</Toggle>
<Toggle checked size="sm">Small</Toggle>
<Toggle checked disabled>Disabled</Toggle>`;

  const initialItems = [
    { checked: true, size: "md", disabled: false, label: "On" },
    { checked: false, size: "md", disabled: false, label: "Off" },
    { checked: true, size: "sm", disabled: false, label: "Small" },
    { checked: true, size: "md", disabled: true, label: "Disabled" },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [checkedValues, setCheckedValues] = useState({});
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Toggle> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Toggle> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      ["checked", "disabled"].forEach((prop) => {
        normalizedTag = normalizedTag.replace(
          new RegExp(
            "(\\s)" +
              prop +
              "(?=\\s|\\/?>)(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)(?=(?:[^']*'[^']*')*[^']*$)",
            "g"
          ),
          '$1' + prop + '="true"'
        );
      });
      return normalizedTag;
    });
    if (/[{}]/.test(normalized)) {
      throw new Error("Variables and event handlers are not run here. Use literal true/false values.");
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
        throw new Error("Check that every Toggle tag and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Place all text inside a <Toggle> element.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Toggle> element.");

      const allowedProps = ["checked", "size", "disabled"];
      const sizes = ["md", "sm"];
      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Toggle") {
          throw new Error("Only <Toggle> elements are supported on this page.");
        }
        if (node.children.length) throw new Error("Toggle children must be plain text.");

        Array.from(node.attributes).forEach((attribute) => {
          if (!allowedProps.includes(attribute.name)) {
            throw new Error('Toggle does not support the "' + attribute.name + '" prop here.');
          }
        });

        const size = node.getAttribute("size") || "md";
        if (!sizes.includes(size)) throw new Error('Unknown Toggle size "' + size + '".');
        const label = node.textContent.replace(/\s+/g, " ").trim();
        if (!label) throw new Error("Every Toggle needs a visible text label.");

        return {
          checked: readBoolean(node, "checked", false),
          size,
          disabled: readBoolean(node, "disabled", false),
          label,
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Toggle markup could not be read." };
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
      setCheckedValues({});
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
    setCheckedValues({});
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
        <span className="zds-code-sandbox__filename">Toggle.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="toggle-sandbox-source">
            Editable Toggle JSX
          </label>
          <textarea
            id="toggle-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="toggle-sandbox-help toggle-sandbox-status"
            spellCheck={false}
          />
          <p id="toggle-sandbox-help" className="zds-code-sandbox__help">
            Literal checked values set the initial state; the rendered toggles remain interactive.
          </p>
        </div>
        <div className="zds-code-sandbox__result-pane">
          <div className="zds-code-sandbox__result-header">
            <span>Result</span>
            <span>{items.length}</span>
          </div>
          <div className="zds-code-sandbox__preview zds-preview">
            <div className="zds-code-sandbox__examples">
              {items.map((item, index) => {
                const checked = Object.prototype.hasOwnProperty.call(checkedValues, index)
                  ? checkedValues[index]
                  : item.checked;
                const classes = [
                  "zds-toggle",
                  item.size === "sm" ? "zds-toggle--sm" : "",
                  item.disabled ? "zds-toggle--disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <label key={index + "-" + item.label} className={classes}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={item.disabled}
                      onChange={(event) =>
                        setCheckedValues((current) => ({
                          ...current,
                          [index]: event.target.checked,
                        }))
                      }
                    />
                    <span className="zds-toggle__track" />
                    <span>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div
        id="toggle-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
