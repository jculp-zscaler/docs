/*
  Self-contained, non-evaluating JSX sandbox for the ZDS Button.
  Runtime data and helpers stay inside the named export because Mintlify's
  snippet evaluator does not reliably preserve module-level data bindings.
*/

export const ButtonSandbox = () => {
  const initialSource = `<Button>Deploy policy</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger">Delete rule</Button>
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`;

  const initialItems = [
    { variant: "primary", size: "md", disabled: false, loading: false, label: "Deploy policy" },
    { variant: "secondary", size: "md", disabled: false, loading: false, label: "Save draft" },
    { variant: "ghost", size: "md", disabled: false, loading: false, label: "Cancel" },
    { variant: "danger", size: "md", disabled: false, loading: false, label: "Delete rule" },
    { variant: "primary", size: "md", disabled: true, loading: false, label: "Disabled" },
    { variant: "primary", size: "md", disabled: false, loading: true, label: "Loading" },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Button> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Button> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      ["disabled", "loading"].forEach((prop) => {
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
        throw new Error("Check that every Button tag and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Place all text inside a <Button> element.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Button> element.");

      const allowedProps = ["variant", "size", "disabled", "loading"];
      const variants = ["primary", "secondary", "ghost", "danger"];
      const sizes = ["sm", "md", "lg"];

      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Button") {
          throw new Error("Only <Button> elements are supported on this page.");
        }
        if (node.children.length) {
          throw new Error("Button children must be plain text.");
        }

        Array.from(node.attributes).forEach((attribute) => {
          if (!allowedProps.includes(attribute.name)) {
            throw new Error('Button does not support the "' + attribute.name + '" prop here.');
          }
        });

        const variant = node.getAttribute("variant") || "primary";
        const size = node.getAttribute("size") || "md";
        if (!variants.includes(variant)) {
          throw new Error('Unknown Button variant "' + variant + '".');
        }
        if (!sizes.includes(size)) {
          throw new Error('Unknown Button size "' + size + '".');
        }

        const label = node.textContent.replace(/\s+/g, " ").trim();
        if (!label) throw new Error("Every Button needs a text label.");

        return {
          variant,
          size,
          disabled: readBoolean(node, "disabled", false),
          loading: readBoolean(node, "loading", false),
          label,
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Button markup could not be read." };
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
        <span className="zds-code-sandbox__filename">Button.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="button-sandbox-source">
            Editable Button JSX
          </label>
          <textarea
            id="button-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="button-sandbox-help button-sandbox-status"
            spellCheck={false}
          />
          <p id="button-sandbox-help" className="zds-code-sandbox__help">
            Supports text children and the documented string and boolean props.
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
                const classes = [
                  "zds-btn",
                  "zds-btn--" + item.variant,
                  "zds-btn--" + item.size,
                  item.loading ? "zds-btn--loading" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    type="button"
                    key={index + "-" + item.label}
                    className={classes}
                    disabled={item.disabled}
                    aria-busy={item.loading ? "true" : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        id="button-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
