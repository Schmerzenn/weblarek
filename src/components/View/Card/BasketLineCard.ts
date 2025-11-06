import { ensureElement } from "../../../helpers/helper";
import { Card, ICard } from "./CardView";
import { IInventoryItemSchema } from "../../../types";

interface IBasketCardActions {
    onRemove?(id: string): void;
}

// Представление товара в списке корзины
class BasketLineCard extends Card<ICard> {
    protected indexNode: HTMLElement;
    protected deleteTrigger: HTMLButtonElement;
    protected actions?: IBasketCardActions;

    constructor(container: HTMLElement, actions?: IBasketCardActions) {
        super(container);
        this.actions = actions;

        this.indexNode = ensureElement<HTMLElement>(".basket__item-index", this.container);
        this.deleteTrigger = ensureElement<HTMLButtonElement>(".basket__item-delete", this.container);

        // Удаляем товар
        this.deleteTrigger.addEventListener("click", () => {
            const identifier = this.readIdentifier();
            if (!identifier) {
                return;
            }

            this.actions?.onRemove?.(identifier);
        });
    }

    set index(value: number) {
        this.indexNode.textContent = String(value);
    }

    render(data: IInventoryItemSchema) {
        this.assignIdentifier(data.id);
        return super.render(data);
    }
}

export { BasketLineCard as CardBasket };
