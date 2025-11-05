import { ensureElement } from "../../../helpers/helper";
import { IInventoryItemSchema } from "../../../types";
import { Card } from "./CardView";
import { categoryMap } from "../../../helpers/const";
import { IEvents } from "../../base/Events";

type CategoryKey = keyof typeof categoryMap;
export type TCardCatalog = Pick<IInventoryItemSchema, "id" | "title" | "image" | "category">;

// Карточка товара в каталоге
class CatalogCardView extends Card<TCardCatalog> {
    protected previewImage: HTMLImageElement;
    protected categoryNode: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.previewImage = ensureElement<HTMLImageElement>(".card__image", this.container);
        this.categoryNode = ensureElement<HTMLElement>(".card__category", this.container);

        // При клике сообщаем о выборе товара
        this.container.addEventListener("click", () => {
            const identifier = this.readIdentifier();
            if (!identifier) {
                return;
            }

            this.events.emit("card:select", { id: identifier });
        });
    }

    render(data: TCardCatalog): HTMLElement {
        this.assignIdentifier(data.id);
        return super.render(data);
    }

    // Обновляем оформление категории по типу товара
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
}

export { CatalogCardView as CardCatalog };
