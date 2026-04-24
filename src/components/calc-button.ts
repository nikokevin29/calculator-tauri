import { handleInput } from "../core/engine";

export type ButtonType =
  | "number"
  | "operator"
  | "equals"
  | "clear"
  | "function"
  | "memory";

class CalcButton extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute("label") ?? "";
    const type = (this.getAttribute("type") ?? "number") as ButtonType;
    const wide = this.hasAttribute("wide");
    const kbd = this.getAttribute("kbd") ?? "";

    this.innerHTML = `
      <button
        class="btn btn--${type} ${wide ? "btn--wide" : ""}"
        aria-label="${label}"
        ${kbd ? `data-kbd="${kbd}"` : ""}
      >${label}</button>
    `;

    this.querySelector("button")?.addEventListener("click", () => {
      handleInput(label);
    });
  }
}

customElements.define("calc-button", CalcButton);
