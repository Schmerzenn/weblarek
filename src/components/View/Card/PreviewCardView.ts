import { ensureElement } from "../../../helpers/helper";
import { IInventoryItemSchema } from "../../../types";
import { Card, ICard } from "./CardView";
import { categoryMap } from "../../../helpers/const";
import { IEvents } from "../../base/Events";

type CategoryKey = keyof typeof categoryMap;

// Карточка предпросмотра товара в модальном окне
class PreviewCardView extends Card<ICard> {
    protected previewImage: HTMLImageElement;
    protected categoryNode: HTMLElement;
    protected descriptionNode: HTMLElement;
    protected actionTrigger: HTMLButtonElement;
    protected isInCart = false;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.previewImage = ensureElement<HTMLImageElement>(".card__image", this.container);
        this.categoryNode = ensureElement<HTMLElement>(".card__category", this.container);
        this.descriptionNode = ensureElement<HTMLElement>(".card__text", this.container);
        this.actionTrigger = ensureElement<HTMLButtonElement>(".card__button", this.container);

        // Переключаем состояние кнопки и отправляем соответствующее событие
        this.actionTrigger.addEventListener("click", () => {
            const identifier = this.readIdentifier();
            if (!identifier) {
                return;
            }

            this.isInCart = !this.isInCart;
            this.actionTrigger.textContent = this.isInCart ? "Удалить из корзины" : "Купить";

            const eventInCart = this.isInCart ? "card:add-product" : "card:remove-product";
            this.events.emit(eventInCart, { id: identifier });
        });
    }

    protected setDisabledState(): void {
        this.actionTrigger.disabled = true;
        this.actionTrigger.textContent = "Недоступно";
    }

    protected setActiveState(): void {
        this.actionTrigger.disabled = false;
        this.actionTrigger.textContent = this.isInCart ? "Удалить из корзины" : "Купить";
    }

    // При рендеринге заполняем поля и настраиваем кнопку
    render(data: IInventoryItemSchema, inCart = false): HTMLElement {
        this.assignIdentifier(data.id);
        this.isInCart = inCart;
        this.title = data.title;
        this.price = data.price;
        this.category = data.category;
        this.image = data.image;
        this.description = data.description;

        if (data.price === null) {
            this.setDisabledState();
        } else {
            this.setActiveState();
        }

        return super.render(data);
    }

    // Обновляем класс категории в соответствии с типом
    set category(value: string) {
        this.categoryNode.textContent = String(value);

        for (const key in categoryMap) {
            this.categoryNode.classList.toggle(
                categoryMap[key as CategoryKey],
                key === value
            );
        }
    }

    set image(value: string) {
        this.setImage(this.previewImage, value, this.title);
    }

    set description(value: string) {
        this.descriptionNode.textContent = String(value);
    }
}

export { PreviewCardView as CardPreview };
