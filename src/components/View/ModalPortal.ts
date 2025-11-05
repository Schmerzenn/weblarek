import { Component } from "../base/Component";
import { ensureElement } from "../../helpers/helper";
import { IEvents } from "../base/Events";

interface TModalContent {
    content: HTMLElement;
}

// Управление жизненным циклом модального окна
class ModalPortal extends Component<TModalContent> {
    protected closeTrigger: HTMLButtonElement;
    protected contentHost: HTMLElement;
    protected pageWrapper: HTMLElement;
    isOpen = false;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.closeTrigger = ensureElement<HTMLButtonElement>(".modal__close", this.container);
        this.contentHost = ensureElement<HTMLElement>(".modal__content", this.container);
        this.pageWrapper = ensureElement<HTMLElement>(".page__wrapper");

        // Закрываем модальное окно по нажатию на кнопку
        this.closeTrigger.addEventListener("click", () => {
            this.close();
        });

        this.container.addEventListener("click", (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });

        // Обрабатываем закрытие по клавиатуре
        document.addEventListener("keydown", (event) => {
            if (this.isOpen && (event.key === "Escape" || event.key === "Enter")) {
                this.close();
            }
        });
    }

    protected lockPage(): void {
        this.pageWrapper.classList.add("page__wrapper_locked");
    }

    protected releasePage(): void {
        this.pageWrapper.classList.remove("page__wrapper_locked");
    }

    set content(elem: HTMLElement) {
        this.contentHost.replaceChildren(elem);
    }

    // При открытии блокируем фон и уведомляем подписчиков
    open(): void {
        this.lockPage();
        this.container.classList.add("modal_active");
        this.isOpen = true;
        this.events.emit("modal:open");
    }

    // При закрытии снимаем блокировки и уведомляем подписчиков
    close(): void {
        this.releasePage();
        this.container.classList.remove("modal_active");
        this.isOpen = false;
        this.events.emit("modal:close");
    }
}

export { ModalPortal as Modal };
