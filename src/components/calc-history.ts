import { subscribe, type CalcState } from "../core/state";

class CalcHistory extends HTMLElement {
  private unsubscribe?: () => void;
  private isOpen = false;

  connectedCallback() {
    this.render([]);
    this.unsubscribe = subscribe((state: CalcState) => {
      this.updateHistory(state.history);
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  private render(history: string[]) {
    this.innerHTML = `
      <div class="history">
        <button class="history__toggle" aria-label="Toggle history">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          History
        </button>
        <div class="history__panel ${this.isOpen ? "history__panel--open" : ""}">
          ${history.length === 0
            ? '<p class="history__empty">No history yet</p>'
            : history.map(h => `<div class="history__item">${h}</div>`).join("")
          }
        </div>
      </div>
    `;

    this.querySelector(".history__toggle")?.addEventListener("click", () => {
      this.isOpen = !this.isOpen;
      this.querySelector(".history__panel")?.classList.toggle("history__panel--open", this.isOpen);
    });
  }

  private updateHistory(history: string[]) {
    const panel = this.querySelector(".history__panel");
    if (!panel) return;
    panel.innerHTML = history.length === 0
      ? '<p class="history__empty">No history yet</p>'
      : history.map(h => `<div class="history__item">${h}</div>`).join("");
  }
}

customElements.define("calc-history", CalcHistory);
