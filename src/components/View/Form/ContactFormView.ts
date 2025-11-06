import { ensureElement } from "../../../helpers/helper";
import { IFormEventBindings, IContactEventBindings } from "../../../types/index";
import { Form } from "./FormView";

export interface IFormContactsActions extends IFormEventBindings, IContactEventBindings {}

interface IContactDetails {
    email: string;
    phone: string;
}

// Форма контактных данных
class ContactFormView extends Form {
    protected emailField: HTMLInputElement;
    protected phoneField: HTMLInputElement;
    protected actions?: IFormContactsActions;

    constructor(container: HTMLElement, actions?: IFormContactsActions) {
        super(container, actions);

        this.actions = actions;
        this.emailField = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneField = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        this.emailField.addEventListener("input", () => {
            if (this.actions?.onEmailInput) {
                this.actions.onEmailInput(this.emailField.value);
            }
        });

        this.phoneField.addEventListener("input", () => {
            const previousValue = this.phoneField.value;
            const digits = this.normalizePhoneDigits(previousValue);
            const masked = digits ? this.formatPhoneDigits(digits) : "";

            if (masked !== previousValue) {
                this.phoneField.value = masked;
            }

            if (this.actions?.onPhoneInput) {
                const normalized = digits ? `+${digits}` : "";
                this.actions.onPhoneInput(normalized);
            }
        });
    }

    set email(value: string) {
        this.emailField.value = value;
    }

    getEmail(): string {
        return this.emailField.value;
    }

    set phone(value: string) {
        const digits = this.normalizePhoneDigits(value);
        this.phoneField.value = digits ? this.formatPhoneDigits(digits) : "";
    }

    getPhone(): string {
        const digits = this.normalizePhoneDigits(this.phoneField.value);
        return digits ? `+${digits}` : "";
    }

    protected normalizePhoneDigits(value: string): string {
        const digits = value.replace(/\D/g, "");
        if (!digits) {
            return "";
        }

        let normalized = digits;

        if (normalized.startsWith("8")) {
            normalized = "7" + normalized.slice(1);
        } else if (!normalized.startsWith("7")) {
            normalized = "7" + normalized;
        }

        return normalized.slice(0, 11);
    }

    protected formatPhoneDigits(digits: string): string {
        if (!digits) {
            return "";
        }

        const country = digits.charAt(0);
        const rest = digits.slice(1);
        let formatted = `+${country}`;

        if (rest.length > 0) {
            formatted += ` (${rest.slice(0, Math.min(rest.length, 3))}`;
        }

        if (rest.length >= 3) {
            formatted += ")";
        }

        if (rest.length > 3) {
            formatted += ` ${rest.slice(3, Math.min(rest.length, 6))}`;
        }

        if (rest.length > 6) {
            formatted += `-${rest.slice(6, Math.min(rest.length, 8))}`;
        }

        if (rest.length > 8) {
            formatted += `-${rest.slice(8, Math.min(rest.length, 10))}`;
        }

        return formatted;
    }

    //Показываем агрегированные ошибки на форме
    setContactsErrors(errors?: { [key: string]: string }): void {
        this.checkErrors(errors || {});
    }

    getContactsData(): IContactDetails {
        return {
            email: this.getEmail(),
            phone: this.getPhone(),
        };
    }
}

export type IContacts = IContactDetails;
export { ContactFormView as FormContacts };
