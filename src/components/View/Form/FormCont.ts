import { ensureElement } from "../../../helpers/helper";
import { IFormEventBindings, IContactEventBindings } from "../../../types/index";
import { Form } from "./FormView";

export interface IFormContactsActions extends IFormEventBindings, IContactEventBindings {}

interface IContactDetails {
    email: string;
    phone: string;
}

// Форма ввода контактных данных
class ContactFormView extends Form {
    protected emailField: HTMLInputElement;
    protected phoneField: HTMLInputElement;

    constructor(container: HTMLElement, actions?: IFormContactsActions) {
        super(container, actions);

        this.emailField = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneField = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        // При изменении полей уведомляем модель
        this.emailField.addEventListener("input", () => {
            if (actions?.onEmailInput) {
                actions.onEmailInput(this.emailField.value);
            }
        });

        this.phoneField.addEventListener("input", () => {
            if (actions?.onPhoneInput) {
                actions.onPhoneInput(this.phoneField.value);
            }
        });
    }

    set email(value: string) {
        this.emailField.value = value;
    }

    get email(): string {
        return this.emailField.value;
    }

    set phone(value: string) {
        this.phoneField.value = value;
    }

    get phone(): string {
        return this.phoneField.value;
    }

    // Передаём ошибки в базовый обработчик и показываем их
    isContactsValid(errors?: { [key: string]: string }): void {
        this.checkErrors(errors || {});
    }

    get contactsData(): IContactDetails {
        return {
            email: this.email,
            phone: this.phone
        };
    }
}

export type IContacts = IContactDetails;
export { ContactFormView as FormContacts };
