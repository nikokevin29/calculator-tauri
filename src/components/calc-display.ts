import { subscribe, type CalcState } from "../core/state";

class CalcDisplay extends HTMLElement {
  private unsubscribe?: () => void;

  connectedCallback() {
    this.render("0", "");
    this.unsubscribe = subscribe((state: CalcState) => {
      this.render(state.display, state.expression, state.isError, state.memory);
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  private render(
    display: string,
    expression: string,
    isError = false,
    memory = 0
  ) {
    this.innerHTML = `
      <div class="display">
        <div class="display__memory">${memory !== 0 ? "M" : ""}</div>
        <div class="display__expr">${expression || "&nbsp;"}</div>
        <div class="display__main ${isError ? "display__main--error" : ""}">
          ${this.formatDisplay(display)}
        </div>
      </div>
    `;
  }

  private formatDisplay(value: string): string {
    if (value.length > 15) return value;
    const num = parseFloat(value);
    if (!isNaN(num) && !value.includes(".")) {
      return num.toLocaleString("en-US");
    }
    return value;
  }
}

customElements.define("calc-display", CalcDisplay);
