/* Self-contained, non-evaluating JSX sandbox for the ZDS Select. */

export const SelectSandbox = () => {
  const initialSource = `<Select label="Region">
  <Select.Option value="All regions" />
  <Select.Option value="Americas" />
  <Select.Option value="EMEA" />
  <Select.Option value="APAC" />
</Select>
<Select label="Error" error="Select at least one region." required>
  <Select.Option value="All regions" />
</Select>
<Select label="Disabled" disabled>
  <Select.Option value="Managed" />
</Select>`;

  const initialItems = [
    {
      label: "Region",
      error: "",
      required: false,
      disabled: false,
      options: [
        { value: "All regions", label: "All regions" },
        { value: "Americas", label: "Americas" },
        { value: "EMEA", label: "EMEA" },
        { value: "APAC", label: "APAC" },
      ],
    },
    {
      label: "Error",
      error: "Select at least one region.",
      required: true,
      disabled: false,
      options: [{ value: "All regions", label: "All regions" }],
    },
    {
      label: "Disabled",
      error: "",
      required: false,
      disabled: true,
      options: [{ value: "Managed", label: "Managed" }],
    },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [selectedValues, setSelectedValues] = useState({});
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Select> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Select> markup only.");
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
        throw new Error("Check that every Select tag, option, and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Only <Select> elements are supported at the top level.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Select> element.");
      const allowedProps = ["label", "error", "required", "disabled"];

      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Select") {
          throw new Error("Only <Select> elements are supported on this page.");
        }
        Array.from(node.attributes).forEach((attribute) => {
          if (!allowedProps.includes(attribute.name)) {
            throw new Error('Select does not support the "' + attribute.name + '" prop here.');
          }
        });

        const label = node.getAttribute("label") || "";
        if (!label.trim()) throw new Error("Every Select needs a label prop.");

        const hasOptionText = Array.from(node.childNodes).some(
          (child) => child.nodeType === 3 && child.textContent.trim()
        );
        if (hasOptionText) throw new Error("Select children must be <Select.Option /> elements.");

        const options = Array.from(node.children).map((optionNode) => {
          if (optionNode.tagName !== "Select.Option") {
            throw new Error("Select children must be <Select.Option /> elements.");
          }
          Array.from(optionNode.attributes).forEach((attribute) => {
            if (attribute.name !== "value") {
              throw new Error(
                'Select.Option does not support the "' + attribute.name + '" prop here.'
              );
            }
          });
          if (optionNode.children.length) {
            throw new Error("Select.Option cannot contain nested elements.");
          }

          const optionValue = optionNode.getAttribute("value") || "";
          if (!optionValue.trim()) throw new Error("Every Select.Option needs a value prop.");
          const optionLabel =
            optionNode.textContent.replace(/\s+/g, " ").trim() || optionValue;
          return { value: optionValue, label: optionLabel };
        });

        if (!options.length) throw new Error("Every Select needs at least one Select.Option.");

        return {
          label,
          error: node.getAttribute("error") || "",
          required: readBoolean(node, "required", false),
          disabled: readBoolean(node, "disabled", false),
          options,
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Select markup could not be read." };
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
      setSelectedValues({});
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
    setSelectedValues({});
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
        <span className="zds-code-sandbox__filename">Select.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="select-sandbox-source">
            Editable Select JSX
          </label>
          <textarea
            id="select-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="select-sandbox-help select-sandbox-status"
            spellCheck={false}
          />
          <p id="select-sandbox-help" className="zds-code-sandbox__help">
            Add options with self-closing Select.Option elements and literal value props.
          </p>
        </div>
        <div className="zds-code-sandbox__result-pane">
          <div className="zds-code-sandbox__result-header">
            <span>Result</span>
            <span>{items.length}</span>
          </div>
          <div className="zds-code-sandbox__preview zds-preview">
            <div className="zds-code-sandbox__examples zds-code-sandbox__examples--fields">
              {items.map((item, index) => {
                const selected = Object.prototype.hasOwnProperty.call(selectedValues, index)
                  ? selectedValues[index]
                  : item.options[0].value;
                return (
                  <label key={index + "-" + item.label} className="zds-field zds-code-sandbox__field">
                    <span
                      className={
                        "zds-field__label" + (item.required ? " zds-field__label--required" : "")
                      }
                    >
                      {item.label}
                    </span>
                    <select
                      className={"zds-select" + (item.error ? " zds-select--error" : "")}
                      disabled={item.disabled}
                      required={item.required}
                      value={selected}
                      onChange={(event) =>
                        setSelectedValues((current) => ({
                          ...current,
                          [index]: event.target.value,
                        }))
                      }
                      aria-invalid={item.error ? "true" : undefined}
                    >
                      {item.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {item.error ? <span className="zds-field__error">{item.error}</span> : null}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div
        id="select-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
