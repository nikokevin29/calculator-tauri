import { getState, setState } from "./state";

// Tauri IPC — invoke Rust backend
// Falls back to JS eval in browser dev mode
async function evalExpression(expr: string): Promise<number> {
  try {
    // Production: call Rust backend via Tauri
    const { invoke } = await import("@tauri-apps/api/core");
    return await invoke<number>("calculate", { expr });
  } catch {
    // Dev fallback: safe JS eval
    return devEval(expr);
  }
}

// Safe JS eval for development (no Tauri runtime)
function devEval(expr: string): number {
  const sanitized = expr
    .replace(/[^0-9+\-*/.() ]/g, "")
    .replace(/÷/g, "/")
    .replace(/×/g, "*");
  try {
    const result = Function(`"use strict"; return (${sanitized})`)() as number;
    if (!isFinite(result)) throw new Error("Not finite");
    return result;
  } catch {
    throw new Error("Invalid expression");
  }
}

// Format number — avoid float artifacts
function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toPrecision(12)).toString();
}

// ─── Public API ──────────────────────────────────────────

export const handleInput = (value: string): void => {
  const s = getState();

  switch (value) {
    case "C":
      setState({ display: "0", expression: "", isResult: false, isError: false });
      break;

    case "CE":
      setState({ display: "0", isError: false });
      break;

    case "⌫":
      if (s.isResult) {
        setState({ display: "0", expression: "", isResult: false });
      } else {
        const next = s.display.slice(0, -1) || "0";
        setState({ display: next });
      }
      break;

    case "=":
      handleEquals();
      break;

    case "+/-":
      if (s.display !== "0") {
        const toggled = s.display.startsWith("-")
          ? s.display.slice(1)
          : "-" + s.display;
        setState({ display: toggled });
      }
      break;

    case "%":
      setState({ display: formatNumber(parseFloat(s.display) / 100) });
      break;

    case "1/x":
      if (parseFloat(s.display) === 0) {
        setState({ display: "Cannot divide by zero", isError: true });
      } else {
        setState({ display: formatNumber(1 / parseFloat(s.display)) });
      }
      break;

    case "x²":
      setState({ display: formatNumber(Math.pow(parseFloat(s.display), 2)) });
      break;

    case "√":
      if (parseFloat(s.display) < 0) {
        setState({ display: "Invalid input", isError: true });
      } else {
        setState({ display: formatNumber(Math.sqrt(parseFloat(s.display))) });
      }
      break;

    case "M+":
      setState({ memory: s.memory + parseFloat(s.display) });
      break;

    case "M-":
      setState({ memory: s.memory - parseFloat(s.display) });
      break;

    case "MR":
      setState({ display: formatNumber(s.memory), isResult: false });
      break;

    case "MC":
      setState({ memory: 0 });
      break;

    case ".":
      if (!s.display.includes(".")) {
        setState({ display: s.display + "." });
      }
      break;

    case "+":
    case "-":
    case "*":
    case "/":
      setState({
        expression: s.display + " " + value + " ",
        display: "0",
        isResult: false,
      });
      break;

    default:
      // Number input
      if (s.isResult || s.isError) {
        setState({ display: value, expression: "", isResult: false, isError: false });
      } else {
        const newDisplay = s.display === "0" ? value : s.display + value;
        setState({ display: newDisplay });
      }
  }
};

async function handleEquals(): Promise<void> {
  const s = getState();
  if (!s.expression) return;

  const fullExpr = s.expression + s.display;
  try {
    const result = await evalExpression(fullExpr);
    const formatted = formatNumber(result);
    setState({
      display: formatted,
      expression: fullExpr + " =",
      history: [`${fullExpr} = ${formatted}`, ...s.history.slice(0, 19)],
      isResult: true,
      isError: false,
    });
  } catch {
    setState({ display: "Error", isError: true, isResult: false });
  }
}
