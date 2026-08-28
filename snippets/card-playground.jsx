/* Self-contained, non-evaluating JSX sandbox for the ZDS Card. */

export const CardSandbox = () => {
  const initialSource = `<Card title="Traffic insights" interactive>
  Weekly summary of policy hits across all locations.
  <Card.Footer>
    <Badge tone="success" dot>Live</Badge>
    <Button variant="ghost" size="sm">View report</Button>
  </Card.Footer>
</Card>
<Card title="Default">
  Border and level-1 shadow.
</Card>
<Card title="Elevated" elevated>
  Borderless, level-3 shadow.
</Card>`;

  const initialItems = [
    {
      title: "Traffic insights",
      body: "Weekly summary of policy hits across all locations.",
      interactive: true,
      elevated: false,
      footer: [
        { type: "Badge", tone: "success", dot: true, label: "Live" },
        {
          type: "Button",
          variant: "ghost",
          size: "sm",
          disabled: false,
          loading: false,
          label: "View report",
        },
      ],
    },
    {
      title: "Default",
      body: "Border and level-1 shadow.",
      interactive: false,
      elevated: false,
      footer: [],
    },
    {
      title: "Elevated",
      body: "Borderless, level-3 shadow.",
      interactive: false,
      elevated: true,
      footer: [],
    },
  ];

  const [source, setSource] = useState(initialSource);
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const normalizeSource = (value) => {
    let normalized = value.trim();
    if (!normalized) throw new Error("Enter at least one <Card> element.");
    if (/^\s*(import|export)\b/m.test(normalized)) {
      throw new Error("Imports and exports are not supported here. Enter <Card> markup only.");
    }

    normalized = normalized.replace(/<[^>]*>/g, (tag) => {
      let normalizedTag = tag.replace(/=\s*\{\s*(true|false)\s*\}/g, '="$1"');
      ["interactive", "elevated", "dot", "disabled", "loading"].forEach((prop) => {
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
      throw new Error(
        "Variables, event handlers, and ReactNode props are not run here. Use literal props."
      );
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

  const parseFooterItem = (node) => {
    if (node.tagName === "Badge") {
      validateProps(node, "Badge", ["tone", "dot"]);
      if (node.children.length) throw new Error("Badge children must be plain text.");
      const tones = ["neutral", "brand", "success", "warning", "danger", "outline"];
      const tone = node.getAttribute("tone") || "neutral";
      if (!tones.includes(tone)) throw new Error('Unknown Badge tone "' + tone + '".');
      const label = node.textContent.replace(/\s+/g, " ").trim();
      if (!label) throw new Error("Every Badge needs text.");
      return { type: "Badge", tone, dot: readBoolean(node, "dot", false), label };
    }

    if (node.tagName === "Button") {
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
        type: "Button",
        variant,
        size,
        disabled: readBoolean(node, "disabled", false),
        loading: readBoolean(node, "loading", false),
        label,
      };
    }

    throw new Error("Card.Footer supports Badge and Button elements only.");
  };

  const parseSource = (value) => {
    try {
      const normalized = normalizeSource(value);
      const parsed = new DOMParser().parseFromString(
        "<SandboxRoot>" + normalized + "</SandboxRoot>",
        "application/xml"
      );
      if (parsed.querySelector("parsererror")) {
        throw new Error("Check that every Card tag, footer, and quoted prop is complete.");
      }

      const root = parsed.documentElement;
      const hasLooseText = Array.from(root.childNodes).some(
        (node) => node.nodeType === 3 && node.textContent.trim()
      );
      if (hasLooseText) throw new Error("Only <Card> elements are supported at the top level.");

      const nodes = Array.from(root.children);
      if (!nodes.length) throw new Error("Enter at least one <Card> element.");

      const nextItems = nodes.map((node) => {
        if (node.tagName !== "Card") {
          throw new Error("Only <Card> elements are supported on this page.");
        }
        validateProps(node, "Card", ["title", "interactive", "elevated"]);

        const title = node.getAttribute("title") || "";
        if (!title.trim()) throw new Error("Every Card needs a title prop.");

        const bodyParts = [];
        let footer = [];
        let hasFooter = false;
        Array.from(node.childNodes).forEach((child) => {
          if (child.nodeType === 3) {
            if (child.textContent.trim()) bodyParts.push(child.textContent);
            return;
          }
          if (child.nodeType !== 1 || child.tagName !== "Card.Footer") {
            throw new Error("Card children must be text plus an optional Card.Footer.");
          }
          if (hasFooter) throw new Error("A Card can contain only one Card.Footer.");
          hasFooter = true;
          if (child.attributes.length) throw new Error("Card.Footer does not accept props here.");
          const hasLooseFooterText = Array.from(child.childNodes).some(
            (footerChild) => footerChild.nodeType === 3 && footerChild.textContent.trim()
          );
          if (hasLooseFooterText) {
            throw new Error("Card.Footer supports Badge and Button elements only.");
          }
          footer = Array.from(child.children).map(parseFooterItem);
        });

        return {
          title,
          body: bodyParts.join(" ").replace(/\s+/g, " ").trim(),
          interactive: readBoolean(node, "interactive", false),
          elevated: readBoolean(node, "elevated", false),
          footer,
        };
      });

      return { items: nextItems, error: "" };
    } catch (parseError) {
      return { items: null, error: parseError.message || "The Card markup could not be read." };
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
        <span className="zds-code-sandbox__filename">Card.jsx</span>
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
          <label className="zds-code-sandbox__label" htmlFor="card-sandbox-source">
            Editable Card JSX
          </label>
          <textarea
            id="card-sandbox-source"
            className="zds-code-sandbox__editor"
            value={source}
            onChange={updateSource}
            aria-describedby="card-sandbox-help card-sandbox-status"
            spellCheck={false}
          />
          <p id="card-sandbox-help" className="zds-code-sandbox__help">
            Card.Footer accepts Badge and Button children with literal props.
          </p>
        </div>
        <div className="zds-code-sandbox__result-pane">
          <div className="zds-code-sandbox__result-header">
            <span>Result</span>
            <span>{items.length}</span>
          </div>
          <div className="zds-code-sandbox__preview zds-preview">
            <div className="zds-code-sandbox__examples zds-code-sandbox__examples--cards">
              {items.map((item, index) => {
                const classes = [
                  "zds-card",
                  "zds-code-sandbox__card",
                  item.interactive ? "zds-card--interactive" : "",
                  item.elevated ? "zds-card--elevated" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div key={index + "-" + item.title} className={classes}>
                    <div className="zds-card__body">
                      <p className="zds-card__title">{item.title}</p>
                      {item.body ? <p className="zds-card__desc">{item.body}</p> : null}
                    </div>
                    {item.footer.length ? (
                      <div className="zds-card__footer">
                        {item.footer.map((footerItem, footerIndex) =>
                          footerItem.type === "Badge" ? (
                            <span
                              key={footerIndex + "-" + footerItem.label}
                              className={"zds-badge zds-badge--" + footerItem.tone}
                            >
                              {footerItem.dot ? <span className="zds-badge__dot" /> : null}
                              {footerItem.label}
                            </span>
                          ) : (
                            <button
                              type="button"
                              key={footerIndex + "-" + footerItem.label}
                              className={
                                "zds-btn zds-btn--" +
                                footerItem.variant +
                                " zds-btn--" +
                                footerItem.size +
                                (footerItem.loading ? " zds-btn--loading" : "")
                              }
                              disabled={footerItem.disabled}
                              aria-busy={footerItem.loading ? "true" : undefined}
                            >
                              {footerItem.label}
                            </button>
                          )
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div
        id="card-sandbox-status"
        className={"zds-code-sandbox__status" + (error ? " zds-code-sandbox__status--error" : "")}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {statusText}
      </div>
    </div>
  );
};
