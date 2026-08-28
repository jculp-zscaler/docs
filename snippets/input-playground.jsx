/* Self-contained, non-evaluating JSX sandbox for the ZDS Input. */

export const InputSandbox = () => {
  const initialSource = `<Input
  label="Tunnel name"
  placeholder="e.g. hq-primary-gre"
  hint="Lowercase letters, numbers, and hyphens only."
  required
/>
<Input
  label="Error"
  error="Invalid characters in name."
  required
/>
<Input
  label="Disabled"
  placeholder="Managed by policy"
  hint="Locked by your administrator."
  disabled
/>`;

  const initialItems = [
    {
      label: "Tunnel name",
      placeholder: "e.g. hq-primary-gre",
      hint: "Lowercase letters, numbers, and hyphens only.",
      error: "",
      required: true,
      disabled: false,
    },
    {
      label: "Error",
      placeholder: "",
      hint: "",
      error: "Invalid characters in name.",
      required: true,
      disabled: false,
    },
    {
      label: "Disabled",
      placeholder: "Managed by policy",
      hint: "Locked by your administrator.",
      error: "",
      required: false,
      disabled: true,
    },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [fieldValues, setFieldValues] = useState({});
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Input /> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Input /> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      ["required", "disabled"].forEach((prop) => {
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
        throw new Error("Check that every Input element is self-closing and every prop is quoted.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Only <Input /> elements are supported at the top level.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Input /> element.");
      const allowedProps = ["label", "placeholder", "hint", "error", "required", "disabled"];

      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Input") {
          throw new Error("Only <Input /> elements are supported on this page.");
        }
        if (node.childNodes.length) throw new Error("Input must be self-closing.");

        Array.from(node.attributes).forEach((attribute) => {
          if (!allowedProps.includes(attribute.name)) {
            throw new Error('Input does not support the "' + attribute.name + '" prop here.');
          }
        });

        const label = node.getAttribute("label") || "";
        if (!label.trim()) throw new Error("Every Input needs a label prop.");

        return {
          label,
          placeholder: node.getAttribute("placeholder") || "",
          hint: node.getAttribute("hint") || "",
          error: node.getAttribute("error") || "",
          required: readBoolean(node, "required", false),
          disabled: readBoolean(node, "disabled", false),
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Input markup could not be read." };
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
      setFieldValues({});
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
    setFieldValues({});
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
        <span className="zds-code-sandbox__filename">Input.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="input-sandbox-source">
            Editable Input JSX
          </label>
          <textarea
            id="input-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="input-sandbox-help input-sandbox-status"
            spellCheck={false}
          />
          <p id="input-sandbox-help" className="zds-code-sandbox__help">
            Use self-closing Input elements with documented string and boolean props.
          </p>
        </div>
        <div className="zds-code-sandbox__result-pane">
          <div className="zds-code-sandbox__result-header">
            <span>Result</span>
            <span>{items.length}</span>
          </div>
          <div className="zds-code-sandbox__preview zds-preview">
            <div className="zds-code-sandbox__examples zds-code-sandbox__examples--fields">
              {items.map((item, index) => (
                <label key={index + "-" + item.label} className="zds-field zds-code-sandbox__field">
                  <span
                    className={
                      "zds-field__label" + (item.required ? " zds-field__label--required" : "")
                    }
                  >
                    {item.label}
                  </span>
                  <input
                    className={"zds-input" + (item.error ? " zds-input--error" : "")}
                    placeholder={item.placeholder}
                    disabled={item.disabled}
                    required={item.required}
                    value={fieldValues[index] || ""}
                    onChange={(event) =>
                      setFieldValues((current) => ({
                        ...current,
                        [index]: event.target.value,
                      }))
                    }
                    aria-invalid={item.error ? "true" : undefined}
                  />
                  {item.error ? (
                    <span className="zds-field__error">{item.error}</span>
                  ) : item.hint ? (
                    <span className="zds-field__hint">{item.hint}</span>
                  ) : null}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        id="input-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
