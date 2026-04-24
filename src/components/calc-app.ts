class CalcApp extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="app">
        <div class="app__titlebar">
          <span class="app__title">Calculator</span>
          <calc-history></calc-history>
        </div>
        <calc-display></calc-display>
        <calc-grid></calc-grid>
      </div>
    `;
  }
}

customElements.define("calc-app", CalcApp);
