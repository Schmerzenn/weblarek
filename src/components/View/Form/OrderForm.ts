import { TPay, IFormEventBindings, IOrderEventBindings } from "../../../types";
import { ensureElement } from "../../../helpers/helper";
import { Form } from "./FormView";
import { IEvents } from "../../base/Events";

export interface IFormOrderActions extends IFormEventBindings, IOrderEventBindings {}
export interface IOrderData {
    payment: TPay;
    address: string;
}

// Форма выбора способа оплаты и адреса
class OrderFormView extends Form {
    protected cardMethodButton: HTMLButtonElement;
    protected cashMethodButton: HTMLButtonElement;
    protected addressField: HTMLInputElement;

    constructor(container: HTMLElement, actions?: IFormOrderActions, protected events?: IEvents) {
        super(container, actions);

        this.cardMethodButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashMethodButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.addressField = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        // При выборе способа оплаты уведомляем модель о выборе
        this.cardMethodButton.addEventListener("click", () => {
            actions?.onPaymentSelect?.("card");
        });

        this.cashMethodButton.addEventListener("click", () => {
            actions?.onPaymentSelect?.("cash");
        });

        // При изменении адреса уведомляем модель
        this.addressField.addEventListener("input", () => {
            if (actions?.onAddressInput) {
                actions.onAddressInput(this.addressField.value);
            }
        });

        // При отправке шага переходим к контактам
        this.submitTrigger.addEventListener("click", () => {
            this.events?.emit("cart:contacts");
        });
    }

    highlightPayment(option: TPay): void {
        this.cardMethodButton.classList.toggle("button_alt-active", option === "card");
        this.cashMethodButton.classList.toggle("button_alt-active", option === "cash");
    }

    set payment(value: TPay) {
        this.highlightPayment(value);
    }

    getPayment(): TPay {
        if (this.cashMethodButton.classList.contains("button_alt-active")) {
            return "cash";
        }
        return "card";
    }

    set address(value: string) {
        this.addressField.value = value;
    }

    getAddress(): string {
        return this.addressField.value;
    }

    isAddressValid(errors?: { [key: string]: string }): void {
        this.checkErrors(errors || {});
    }

    getOrderData(): IOrderData {
        return {
            payment: this.getPayment(),
            address: this.getAddress(),
        };
    }
}

export { OrderFormView as FormOrder };
