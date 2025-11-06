import { IInventoryItemSchema } from "../../../types";
import { ensureElement } from "../../../helpers/helper";
import { Component } from "../../base/Component";

export interface ICardPayload extends Partial<IInventoryItemSchema> {
    index?: number;
}

// Базовая карточка, от которой наследуются остальные варианты
abstract class BaseCardView<T extends ICardPayload> extends Component<T> {
    protected titleNode: HTMLElement;
    protected priceNode: HTMLElement;
    protected cardIdentifier?: string;
    protected currentTitle = "";

    constructor(container: HTMLElement) {
        super(container);

        // Сохраняем элементы заголовка и цены
        this.titleNode = ensureElement<HTMLElement>(".card__title", this.container);
        this.priceNode = ensureElement<HTMLElement>(".card__price", this.container);
    }

    // Запоминаем идентификатор карточки
    protected assignIdentifier(id?: string): void {
        this.cardIdentifier = id;
    }

    protected readIdentifier(): string | undefined {
        return this.cardIdentifier;
    }

    getIdentifier(): string | undefined {
        return this.cardIdentifier;
    }

    set title(value: string) {
        this.currentTitle = String(value);
        this.titleNode.textContent = this.currentTitle;
    }

    protected getTitle(): string {
        return this.currentTitle;
    }

    // При отсутствии цены выводим «Бесценно», иначе числовое значение
    set price(value: number | null) {
        if (value === null) {
            this.priceNode.textContent = "Бесценно";
        } else {
            this.priceNode.textContent = `${value} синапсов`;
        }
    }
}

export { BaseCardView as Card };
export type { ICardPayload as ICard };
