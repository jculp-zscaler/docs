/*
  Self-contained, non-evaluating JSX sandbox for the ZDS Modal.
  The overlay stays inside the result surface instead of covering the docs.
*/

export const ModalSandbox = () => {
  const initialSource = `<Modal open={false} title="Delete firewall rule?">
  This removes the rule from all 42 locations. You can't undo this action.
  <Modal.Footer>
    <Button variant="secondary">Cancel</Button>
    <Button variant="danger">Delete rule</Button>
  </Modal.Footer>
</Modal>`;

  const initialItems = [
    {
      open: false,
      title: "Delete firewall rule?",
      body: "This removes the rule from all 42 locations. You can't undo this action.",
      dismissible: true,
      footer: [
        {
          variant: "secondary",
          size: "md",
          disabled: false,
          loading: false,
          label: "Cancel",
        },
        {
          variant: "danger",
          size: "md",
          disabled: false,
          loading: false,
          label: "Delete rule",
        },
      ],
    },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [openValues, setOpenValues] = useState({});
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Modal> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Modal> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      ["open", "dismissible", "disabled", "loading"].forEach((prop) => {
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
      throw new Error("Variables and event handlers are not run here. Use literal props.");
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

  const validateProps = (node, componentName, allowedProps) => {
    Array.from(node.attributes).forEach((attribute) => {
      if (!allowedProps.includes(attribute.name)) {
        throw new Error(
          componentName + ' does not support the "' + attribute.name + '" prop here.'
        );
      }
    });
  };

  const parseFooterButton = (node) => {
    if (node.tagName !== "Button") {
      throw new Error("Modal.Footer supports Button elements only.");
    }
    validateProps(node, "Button", ["variant", "size", "disabled", "loading"]);
    if (node.children.length) throw new Error("Button children must be plain text.");

    const variants = ["primary", "secondary", "ghost", "danger"];
    const sizes = ["sm", "md", "lg"];
    const variant = node.getAttribute("variant") || "primary";
    const size = node.getAttribute("size") || "md";
    if (!variants.includes(variant)) throw new Error('Unknown Button variant "' + variant + '".');
    if (!sizes.includes(size)) throw new Error('Unknown Button size "' + size + '".');
    const label = node.textContent.replace(/\s+/g, " ").trim();
    if (!label) throw new Error("Every Button needs a text label.");

    return {
      variant,
      size,
      disabled: readBoolean(node, "disabled", false),
      loading: readBoolean(node, "loading", false),
      label,
    };
  };

  const parseSource = (value) => {
    try {
      const normalized = normalizeSource(value);
      const parsed = new DOMParser().parseFromString(
        "<SandboxRoot>" + normalized + "</SandboxRoot>",
        "application/xml"
      );
      if (parsed.querySelector("parsererror")) {
        throw new Error("Check that every Modal tag, footer, and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Only <Modal> elements are supported at the top level.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Modal> element.");

      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Modal") {
          throw new Error("Only <Modal> elements are supported on this page.");
        }
        validateProps(node, "Modal", ["open", "title", "dismissible"]);

        const title = node.getAttribute("title") || "";
        if (!title.trim()) throw new Error("Every Modal needs a title prop.");

        const bodyParts = [];
        let footer = [];
        let hasFooter = false;
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3) {
            if (child.textContent.trim()) bodyParts.push(child.textContent);
            return;
          }
          if (child.nodeType !== 1 || child.tagName !== "Modal.Footer") {
            throw new Error("Modal children must be text plus an optional Modal.Footer.");
          }
          if (hasFooter) throw new Error("A Modal can contain only one Modal.Footer.");
          hasFooter = true;
          if (child.attributes.length) throw new Error("Modal.Footer does not accept props here.");
          const hasLooseFooterText = Array.from(child.childNodes).some(
            (footerChild) => footerChild.nodeType === 3 && footerChild.textContent.trim()
          );
          if (hasLooseFooterText) throw new Error("Modal.Footer supports Button elements only.");
          footer = Array.from(child.children).map(parseFooterButton);
        });

        const body = bodyParts.join(" ").replace(/\s+/g, " ").trim();
        if (!body) throw new Error("Every Modal needs body text.");

        return {
          open: readBoolean(node, "open", false),
          title,
          body,
          dismissible: readBoolean(node, "dismissible", true),
          footer,
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Modal markup could not be read." };
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
      setOpenValues({});
      setError("");
    }, 180);
    return () => clearTimeout(timer);
  }, [source]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setOpenValues((current) => {
        const next = { ...current };
        let changed = false;
        items.forEach((item, index) => {
          const isOpen = Object.prototype.hasOwnProperty.call(current, index)
            ? current[index]
            : item.open;
          if (isOpen && item.dismissible) {
            next[index] = false;
            changed = true;
          }
        });
        return changed ? next : current;
      });
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [items]);

  const updateSource = (event) => {
    setSource(event.target.value);
    setCopyStatus("");
  };
  const resetSource = () => {
    setSource(initialSource);
    setOpenValues({});
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
        <span className="zds-code-sandbox__filename">Modal.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="modal-sandbox-source">
            Editable Modal JSX
          </label>
          <textarea
            id="modal-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="modal-sandbox-help modal-sandbox-status"
            spellCheck={false}
          />
          <p id="modal-sandbox-help" className="zds-code-sandbox__help">
            Modal.Footer accepts Button children; literal open values set the initial state.
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
                const isOpen = Object.prototype.hasOwnProperty.call(openValues, index)
                  ? openValues[index]
                  : item.open;
                const setOpen = (nextOpen) =>
                  setOpenValues((current) => ({ ...current, [index]: nextOpen }));

                return (
                  <div
                    key={index + "-" + item.title}
                    className="zds-code-sandbox__modal-example"
                  >
                    {!isOpen ? (
                      <button
                        type="button"
                        className="zds-btn zds-btn--primary zds-btn--md"
                        onClick={() => setOpen(true)}
                      >
                        Open {item.title}
                      </button>
                    ) : (
                      <div
                        className="zds-modal-overlay"
                        onClick={() => item.dismissible && setOpen(false)}
                      >
                        <div
                          className="zds-modal"
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby={"modal-sandbox-title-" + index}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="zds-modal__header">
                            <p
                              id={"modal-sandbox-title-" + index}
                              className="zds-modal__title"
                            >
                              {item.title}
                            </p>
                            {item.dismissible ? (
                              <button
                                type="button"
                                className="zds-modal__close"
                                aria-label="Close"
                                onClick={() => setOpen(false)}
                              >
                                ×
                              </button>
                            ) : null}
                          </div>
                          <div className="zds-modal__body">{item.body}</div>
                          {item.footer.length ? (
                            <div className="zds-modal__footer">
                              {item.footer.map((button, buttonIndex) => (
                                <button
                                  type="button"
                                  key={buttonIndex + "-" + button.label}
                                  className={
                                    "zds-btn zds-btn--" +
                                    button.variant +
                                    " zds-btn--" +
                                    button.size +
                                    (button.loading ? " zds-btn--loading" : "")
                                  }
                                  disabled={button.disabled}
                                  aria-busy={button.loading ? "true" : undefined}
                                  onClick={() => setOpen(false)}
                                >
                                  {button.label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div
        id="modal-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
