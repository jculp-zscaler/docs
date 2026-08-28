/*
  Live composition demo for /patterns/forms: Input + Select + Toggle + Button
  working together with real validation. Fully self-contained (see AGENTS.md).
*/

export const FormPatternDemo = () => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [notify, setNotify] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  const nameError =
    submitted && !/^[a-z0-9-]+$/.test(name)
      ? name.trim() === ""
        ? "Tunnel name is required."
        : "Use lowercase letters, numbers, and hyphens only."
      : "";
  const regionError = submitted && region === "" ? "Select a region." : "";

  const submit = () => {
    setSubmitted(true);
    const ok = /^[a-z0-9-]+$/.test(name) && region !== "";
    setSuccess(ok);
  };

  const reset = () => {
    setName("");
    setRegion("");
    setNotify(true);
    setSubmitted(false);
    setSuccess(false);
  };

  return (
    <div className="not-prose">
      <div className="zds-preview" style={{ borderRadius: "16px", border: "1px solid var(--zds-color-border)" }}>
        {success ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <div className="zds-alert zds-alert--success" role="status" style={{ maxWidth: "360px" }}>
              <span>
                <p className="zds-alert__title">Tunnel created</p>
                <p className="zds-alert__body">
                  {name} is provisioning in {region}.{notify ? " You'll be notified on failure." : ""}
                </p>
              </span>
            </div>
            <button className="zds-btn zds-btn--secondary zds-btn--sm" onClick={reset}>
              Start over
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "320px" }}>
            <div className="zds-field">
              <span className="zds-field__label zds-field__label--required">Tunnel name</span>
              <input
                className={"zds-input" + (nameError ? " zds-input--error" : "")}
                placeholder="e.g. hq-primary-gre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(nameError)}
              />
              {nameError ? (
                <span className="zds-field__error">{nameError}</span>
              ) : (
                <span className="zds-field__hint">Lowercase letters, numbers, and hyphens only.</span>
              )}
            </div>
            <div className="zds-field">
              <span className="zds-field__label zds-field__label--required">Region</span>
              <select
                className={"zds-select" + (regionError ? " zds-select--error" : "")}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                aria-invalid={Boolean(regionError)}
              >
                <option value="">Select a region…</option>
                <option>Americas</option>
                <option>EMEA</option>
                <option>APAC</option>
              </select>
              {regionError ? <span className="zds-field__error">{regionError}</span> : null}
            </div>
            <label className="zds-toggle">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
              <span className="zds-toggle__track" />
              <span>Notify me on provisioning failure</span>
            </label>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="zds-btn zds-btn--secondary zds-btn--md" onClick={reset}>
                Cancel
              </button>
              <button className="zds-btn zds-btn--primary zds-btn--md" onClick={submit}>
                Create tunnel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
