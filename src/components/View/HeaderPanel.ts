import { Component } from "../base/Component";
import { ensureElement } from "../../helpers/helper";
import { IEvents } from "../base/Events";

interface TCartCounterState {
    count: number;
}

// Представление шапки с индикатором корзины
class HeaderPanel extends Component<TCartCounterState> {
    protected counterBadge: HTMLElement;
    protected basketTrigger: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.counterBadge = ensureElement<HTMLElement>(".header__basket-counter", this.container);
        this.basketTrigger = ensureElement<HTMLButtonElement>(".header__basket", this.container);

        // Извещаем приложение о запросе на открытие корзины
        this.basketTrigger.addEventListener("click", () => {
            this.events.emit("cart:open");
        });
    }

    set counter(value: number) {
        this.counterBadge.textContent = String(value);
    }
}

export { HeaderPanel as Header };
