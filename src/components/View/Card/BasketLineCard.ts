import { ensureElement } from "../../../helpers/helper";
import { Card, ICard } from "./CardView";
import { IEvents } from "../../base/Events";
import { IInventoryItemSchema } from "../../../types";

// Представление товара в списке корзины
class BasketLineCard extends Card<ICard> {
    protected indexNode: HTMLElement;
    protected deleteTrigger: HTMLButtonElement;

    constructor(container: HTMLElement, protected events?: IEvents) {
        super(container);

        this.indexNode = ensureElement<HTMLElement>(".basket__item-index", this.container);
        this.deleteTrigger = ensureElement<HTMLButtonElement>(".basket__item-delete", this.container);

        // Удаляем товар и повторно открываем корзину
        this.deleteTrigger.addEventListener("click", () => {
            const identifier = this.readIdentifier();
            if (!identifier) {
                return;
            }

            this.events?.emit("card:remove-product", { id: identifier });
            this.events?.emit("cart:open");
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
