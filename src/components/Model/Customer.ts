import { IPurchaserProfile } from "../../types";

// Храним данные покупателя между шагами
class CustomerLedger {
    private profileState: IPurchaserProfile | null = null;

    // Создаём профиль по умолчанию, если данных нет
    private ensureProfileState(): IPurchaserProfile {
        if (!this.profileState) {
            this.profileState = {
                payment: "card",
                email: "",
                phone: "",
                address: ""
            };
        }

        return this.profileState;
    }

    // Обновляем профиль новыми полями
    mergeBuyerDetails(detail: Partial<IPurchaserProfile>): void {
        Object.assign(this.ensureProfileState(), detail);
    }

    readBuyerDetails(): IPurchaserProfile | null {
        return this.profileState;
    }

    resetBuyerDetails(): void {
        this.profileState = null;
    }

    // Собираем ошибки по адресу
    collectAddressIssues(): { [key: string]: string } {
        const addressIssues: { [key: string]: string } = {};

        if (!this.profileState?.address || this.profileState?.address.trim() === "") {
            addressIssues.address = "Необходимо указать адрес";
        }

        return addressIssues;
    }

    // Собираем ошибки по контактам
    collectContactIssues(): { [key: string]: string } {
        const contactIssues: { [key: string]: string } = {};

        if (!this.profileState?.email || !this.profileState?.email.includes("@")) {
            contactIssues.email = "Введите корректный email";
        }

        if (!this.profileState?.phone || this.profileState?.phone.trim() === "") {
            contactIssues.phone = "Введите телефон";
        }

        return contactIssues;
    }

    setBuyerData(detail: Partial<IPurchaserProfile>): void {
        this.mergeBuyerDetails(detail);
    }

    getBuyerData(): IPurchaserProfile | null {
        return this.readBuyerDetails();
    }

    clearBuyerData(): void {
        this.resetBuyerDetails();
    }

    sumAddressErrors(): { [key: string]: string } {
        return this.collectAddressIssues();
    }

    sumContactsErrors(): { [key: string]: string } {
        return this.collectContactIssues();
    }
}

export { CustomerLedger as Buyer };
