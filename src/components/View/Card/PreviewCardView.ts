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

        // Сообщаем презентеру о желаемом действии
        this.actionTrigger.addEventListener("click", () => {
            const identifier = this.readIdentifier();
            if (!identifier) {
                return;
            }

            const eventName = this.isInCart ? "card:remove-product" : "card:add-product";
            this.events.emit(eventName, { id: identifier });
        });
    }

    protected setDisabledState(): void {
        this.actionTrigger.disabled = true;
        this.actionTrigger.textContent = "Недоступно";
    }

    protected setActiveState(): void {
        this.actionTrigger.disabled = false;
        this.updateActionLabel();
    }

    // При рендеринге заполняем поля и настраиваем кнопку
    render(data: IInventoryItemSchema, inCart = false): HTMLElement {
        this.assignIdentifier(data.id);
        this.setCartState(inCart);
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
        const normalizedValue = String(value).trim().toLowerCase();

        for (const key in categoryMap) {
            const className = categoryMap[key as CategoryKey];
            const shouldApply = key.toLowerCase() === normalizedValue;
            this.categoryNode.classList.toggle(className, shouldApply);
        }
    }

    set image(value: string) {
        this.setImage(this.previewImage, value, this.getTitle());
    }

    set description(value: string) {
        this.descriptionNode.textContent = String(value);
    }

    setCartState(value: boolean): void {
        this.isInCart = value;
        if (!this.actionTrigger.disabled) {
            this.updateActionLabel();
        }
    }

    protected updateActionLabel(): void {
        this.actionTrigger.textContent = this.isInCart ? "Удалить из корзины" : "Купить";
    }
}

export { PreviewCardView as CardPreview };
