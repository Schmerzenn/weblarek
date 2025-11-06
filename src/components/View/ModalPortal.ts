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
    protected eventsBound = false;
    isOpen = false;

    private readonly handleCloseButtonClick = () => {
        this.close();
    };

    private readonly handleBackdropClick = (event: MouseEvent) => {
        if (event.target === this.container) {
            this.close();
        }
    };

    private readonly handleKeydown = (event: KeyboardEvent) => {
        if (this.isOpen && (event.key === "Escape" || event.key === "Enter")) {
            this.close();
        }
    };

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.closeTrigger = ensureElement<HTMLButtonElement>(".modal__close", this.container);
        this.contentHost = ensureElement<HTMLElement>(".modal__content", this.container);
        this.pageWrapper = ensureElement<HTMLElement>(".page__wrapper");
    }

    protected bindEvents(): void {
        if (this.eventsBound) {
            return;
        }

        this.closeTrigger.addEventListener("click", this.handleCloseButtonClick);
        this.container.addEventListener("click", this.handleBackdropClick);
        document.addEventListener("keydown", this.handleKeydown);

        this.eventsBound = true;
    }

    protected unbindEvents(): void {
        if (!this.eventsBound) {
            return;
        }

        this.closeTrigger.removeEventListener("click", this.handleCloseButtonClick);
        this.container.removeEventListener("click", this.handleBackdropClick);
        document.removeEventListener("keydown", this.handleKeydown);

        this.eventsBound = false;
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
        if (this.isOpen) {
            return;
        }

        this.bindEvents();
        this.lockPage();
        this.container.classList.add("modal_active");
        this.isOpen = true;
        this.events.emit("modal:open");
    }

    // При закрытии снимаем блокировки и уведомляем подписчиков
    close(): void {
        if (!this.isOpen) {
            return;
        }

        this.unbindEvents();
        this.releasePage();
        this.container.classList.remove("modal_active");
        this.isOpen = false;
        this.events.emit("modal:close");
    }
}

export { ModalPortal as Modal };
