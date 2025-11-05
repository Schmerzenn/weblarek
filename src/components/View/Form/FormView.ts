import { Component } from "../../base/Component";
import { ensureElement } from "../../../helpers/helper";
import { IFormEventBindings } from "../../../types/index";

// Базовый класс формы для общей логики
abstract class FormView extends Component<{}> {
    protected errorsPlaceholder: HTMLElement;
    protected submitTrigger: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: IFormEventBindings) {
        super(container);

        this.errorsPlaceholder = ensureElement<HTMLElement>(".form__errors", this.container);
        this.submitTrigger = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);

        // При наличии onSubmit навешиваем обработчик с preventDefault
        if (actions?.onSubmit) {
            this.container.addEventListener("submit", (event) => {
                event.preventDefault();
                actions.onSubmit!(event);
            });
        }
    }

    set errors(value: string) {
        this.errorsPlaceholder.textContent = String(value);
    }

    set submitButtonDisabled(value: boolean) {
        this.submitTrigger.disabled = value;
    }

    clearErrors(): void {
        this.errorsPlaceholder.textContent = "";
    }

    removeErrors(): void {
        this.clearErrors();
    }

    // Агрегируем ошибки и блокируем отправку при их наличии
    checkErrors(errors: { [key: string]: string }): void {
        const errorsList = Object.values(errors).filter(Boolean);
        if (errorsList.length > 0) {
            this.errors = errorsList.join(", ");
            this.submitTrigger.disabled = true;
        } else {
            this.clearErrors();
            this.submitTrigger.disabled = false;
        }
    }
}

export { FormView as Form };
