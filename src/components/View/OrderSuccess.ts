import { ensureElement } from "../../helpers/helper";
import { Component } from "../base/Component";
import { ISuccessEventBindings } from "../../types";

export interface ISpentTotal {
    total: number;
}

// Представление успешного заказа и итоговой суммы
class OrderSuccessPanel extends Component<ISpentTotal> {
    protected spendSummary: HTMLElement;
    protected closeTrigger: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ISuccessEventBindings) {
        super(container);

        this.spendSummary = ensureElement<HTMLElement>(".order-success__description", this.container);
        this.closeTrigger = ensureElement<HTMLButtonElement>(".order-success__close", this.container);

        // Подключаем обработчик закрытия, если он передан
        if (actions?.onOrdered) {
            this.closeTrigger.addEventListener("click", actions.onOrdered);
        }
    }

    // Отображаем итоговую сумму списания
    set total(value: number) {
        this.spendSummary.textContent = `Списано ${value} синапсов`;
    }
}

export { OrderSuccessPanel as Success };
