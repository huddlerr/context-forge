import { QS } from "../data/questions";
import { detectStack } from "./detectStack";
import { detectAuth } from "./detectAuth";
import { detectIntegrations } from "./detectIntegrations";
import { parseDataModel } from "./parseDataModel";

export interface ConfResult {
  individual: Record<number, number>;
  overall: number;
  issues: Array<{ q: number; l: string; m: string }>;
}

export function calcConf(answers: string[]): ConfResult {
  const sc: Record<number, number> = {},
    iss: Array<{ q: number; l: string; m: string }> = [];
  QS.forEach((q, i) => {
    const len = (answers[i] || "").trim().length;
    let s =
      len === 0
        ? 0
        : len < 20
          ? 0.3
          : len < 60
            ? 0.6
            : len < 150
              ? 0.85
              : 0.95;
    if (len === 0)
      iss.push({
        q: q.id,
        l: q.label,
        m: "Empty — needed for " + q.out.join(", "),
      });
    else if (len < 20)
      iss.push({ q: q.id, l: q.label, m: "Very brief" });
    if (q.id === 3 && detectStack(answers[i]).types.length)
      s = Math.min(1, s + 0.1);
    if (q.id === 4 && parseDataModel(answers[i]).length)
      s = Math.min(1, s + 0.1);
    if (q.id === 7 && detectAuth(answers[i]).length)
      s = Math.min(1, s + 0.1);
    if (q.id === 8 && detectIntegrations(answers[i]).length)
      s = Math.min(1, s + 0.1);
    sc[q.id] = Math.min(1, s);
  });
  let tw = 0,
    ws = 0;
  QS.forEach((q) => {
    tw += q.w;
    ws += sc[q.id] * q.w;
  });
  return { individual: sc, overall: tw > 0 ? ws / tw : 0, issues: iss };
}
