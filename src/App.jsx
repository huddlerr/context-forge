import { useState, useEffect, useMemo, useCallback } from "react";
import { globalStyles } from "./tokens";
import { LS } from "./data/localStorage";
import { genFiles, calcConf } from "./engines";
import { useIsMobile } from "./hooks/useIsMobile";
import { Particles, SettingsPanel, ExportMenu } from "./components";
import { Mobile } from "./layouts/Mobile";
import { Desktop } from "./layouts/Desktop";

export default function App() {
  const isMobile = useIsMobile();
  const [cq, setCq] = useState(0);
  const [answers, setAnswers] = useState(() => LS.get("answers", Array(10).fill("")));
  const [files, setFiles] = useState(null);
  const [sel, setSel] = useState("soul.md");
  const [ptcl, setPtcl] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [integrations, setIntegrations] = useState(() => LS.get("integrations", {}));

  useEffect(() => { LS.set("answers", answers); }, [answers]);
  useEffect(() => { LS.set("integrations", integrations); }, [integrations]);

  const conf = useMemo(() => calcConf(answers), [answers]);
  const canGen = answers.filter(a => a.trim()).length >= 3;
  const live = useMemo(() => genFiles(answers), [answers]);

  const gen = useCallback(() => {
    const f = genFiles(answers);
    setFiles(f);
    setSel("soul.md");
    setPtcl(true);
    setTimeout(() => setPtcl(false), 1200);
  }, [answers]);

  const props = {
    answers, setAnswers, cq, setCq, files, setFiles, sel, setSel,
    conf, live, canGen, gen, ptcl,
    showSettings: () => setSettingsOpen(true),
    showExport: () => setExportOpen(true),
  };

  return (
    <>
      <style>{globalStyles}</style>
      <Particles on={ptcl} />
      <SettingsPanel show={settingsOpen} onClose={() => setSettingsOpen(false)} integrations={integrations} setIntegrations={setIntegrations} />
      <ExportMenu show={exportOpen} onClose={() => setExportOpen(false)} files={files || live} answers={answers} integrations={integrations} />
      {isMobile ? <Mobile {...props} /> : <Desktop {...props} />}
    </>
  );
}
