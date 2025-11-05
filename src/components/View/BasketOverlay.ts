import { Component } from "../base/Component";
import { ensureElement } from "../../helpers/helper";
import { IEvents } from "../base/Events";

interface TBasketViewState {
    products: HTMLElement[];
    total: number;
}

// Корзина с выбранными товарами
class BasketOverlay extends Component<TBasketViewState> {
    protected titleNode: HTMLElement;
    protected itemsHost: HTMLElement;
    protected submitTrigger: HTMLButtonElement;
    protected totalLabel: HTMLElement;

    constructor(container: HTMLElement, protected events?: IEvents) {
        super(container);

        // Сохраняем ссылки на основные элементы, чтобы обновлять их позже
        this.titleNode = ensureElement<HTMLElement>(".modal__title", this.container);
        this.itemsHost = ensureElement<HTMLElement>(".basket__list", this.container);
        this.submitTrigger = ensureElement<HTMLButtonElement>(".basket__button", this.container);
        this.totalLabel = ensureElement<HTMLElement>(".basket__price", this.container);

        // По нажатию отправляем событие оформления заказа
        this.submitTrigger.addEventListener("click", () => {
            this.events?.emit("cart:order");
        });
    }

    protected enableActionButton(): void {
        this.submitTrigger.disabled = false;
    }

    protected disableActionButton(): void {
        this.submitTrigger.disabled = true;
    }

    // Показываем заглушку, если корзина пуста
    protected renderEmptyState(): void {
        const emptyCart = document.createElement("p");
        emptyCart.textContent = "Корзина пуста";
        this.itemsHost.replaceChildren(emptyCart);
    }

    set buttonText(value: string) {
        this.submitTrigger.textContent = String(value);
    }

    set buttonDisabled(value: boolean) {
        this.submitTrigger.disabled = value;
    }

    // Обновляем список товаров и состояние кнопки
    set basket(items: HTMLElement[]) {
        if (items.length > 0) {
            this.enableActionButton();
            this.buttonText = "Оформить";
            this.itemsHost.replaceChildren(...items);
        } else {
            this.disableActionButton();
            this.buttonText = "Оформить";
            this.renderEmptyState();
        }
    }

    set total(value: number) {
        this.totalLabel.textContent = `${value} синапсов`;
    }
}

export { BasketOverlay as Basket };
