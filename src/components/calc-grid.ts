import { handleInput } from "../core/engine";

class CalcGrid extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="grid">

        <!-- Row 1: Memory -->
        <div class="grid__row grid__row--memory">
          <calc-button label="MC"  type="memory"></calc-button>
          <calc-button label="MR"  type="memory"></calc-button>
          <calc-button label="M+"  type="memory"></calc-button>
          <calc-button label="M-"  type="memory"></calc-button>
        </div>

        <!-- Row 2: Functions -->
        <div class="grid__row">
          <calc-button label="%"   type="function"></calc-button>
          <calc-button label="CE"  type="function"></calc-button>
          <calc-button label="C"   type="clear"    kbd="Escape"></calc-button>
          <calc-button label="⌫"   type="clear"    kbd="Backspace"></calc-button>
        </div>

        <!-- Row 3 -->
        <div class="grid__row">
          <calc-button label="1/x" type="function"></calc-button>
          <calc-button label="x²"  type="function"></calc-button>
          <calc-button label="√"   type="function"></calc-button>
          <calc-button label="/"   type="operator" kbd="/"></calc-button>
        </div>

        <!-- Row 4 -->
        <div class="grid__row">
          <calc-button label="7" type="number" kbd="7"></calc-button>
          <calc-button label="8" type="number" kbd="8"></calc-button>
          <calc-button label="9" type="number" kbd="9"></calc-button>
          <calc-button label="*" type="operator" kbd="*"></calc-button>
        </div>

        <!-- Row 5 -->
        <div class="grid__row">
          <calc-button label="4" type="number" kbd="4"></calc-button>
          <calc-button label="5" type="number" kbd="5"></calc-button>
          <calc-button label="6" type="number" kbd="6"></calc-button>
          <calc-button label="-" type="operator" kbd="-"></calc-button>
        </div>

        <!-- Row 6 -->
        <div class="grid__row">
          <calc-button label="1" type="number" kbd="1"></calc-button>
          <calc-button label="2" type="number" kbd="2"></calc-button>
          <calc-button label="3" type="number" kbd="3"></calc-button>
          <calc-button label="+" type="operator" kbd="+"></calc-button>
        </div>

        <!-- Row 7 -->
        <div class="grid__row">
          <calc-button label="+/-" type="function"></calc-button>
          <calc-button label="0"   type="number"   kbd="0"></calc-button>
          <calc-button label="."   type="number"   kbd="."></calc-button>
          <calc-button label="="   type="equals"   kbd="Enter"></calc-button>
        </div>

      </div>
    `;

    // Keyboard support
    this.setupKeyboard();
  }

  private setupKeyboard() {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const key = e.key;
      const map: Record<string, string> = {
        "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
        "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
        "+": "+", "-": "-", "*": "*", "/": "/",
        ".": ".", ",": ".",
        "Enter": "=", "=": "=",
        "Backspace": "⌫",
        "Escape": "C",
      };
      if (map[key]) {
        e.preventDefault();
        handleInput(map[key]);
        // Visual feedback
        const btn = this.querySelector(`[data-kbd="${key}"]`) as HTMLButtonElement;
        btn?.classList.add("btn--pressed");
        setTimeout(() => btn?.classList.remove("btn--pressed"), 100);
      }
    });
  }
}

customElements.define("calc-grid", CalcGrid);
