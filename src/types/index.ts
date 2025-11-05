import type { categoryMap } from '../helpers/const';
 
export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type IPaymentMethodSelection = TPay | null;
export type TPay = 'card' | 'cash';
export type TCategory = keyof typeof categoryMap;
export type TPrice = number | null;
export interface IContactEventBindings {
    onEmailInput?(email: string): void;
    onPhoneInput?(phone: string): void;
}

export interface ISuccessEventBindings {
    onOrdered?(): void;
}

export interface IOrderEventBindings {
    onPaymentSelect?(payment: TPay): void;
    onAddressInput?(address: string): void;
}

export interface IValidationStatusState {
    valid: boolean;
    errors: string;
}

export interface IFormEventBindings {
    onSubmit?(event: SubmitEvent): void;
}

// Описание товара
export interface IInventoryItemSchema {
    id: string;
    title: string;
    description: string;
    image: string;
    category: TCategory;
    price: TPrice;
}

export interface ICatalogNodeSchema extends IInventoryItemSchema {
    itemIndex?: number;
}

export interface ICatalogPreviewState extends ICatalogNodeSchema {
    inBasket: boolean;
    canAddToBasket: boolean;
}

export interface ICatalogRepositoryContract {
    items: ICatalogNodeSchema[];
    getItem(itemId: string): ICatalogNodeSchema;
    getItemPrice(itemId: string): TPrice;
}

// Ответ сервера с каталогом
export interface ICatalogApiPayload {
    total: number;
    items: IInventoryItemSchema[];
}

export interface ICartLedgerContract {
    items: IInventoryItemSchema[];
    addItem(item: IInventoryItemSchema): void;
    alreadyInBasket(itemId: string): boolean;
    clear(): void;
    getTotal(): number;
    getCount(): number;
    removeItem(itemId: string): void;
}

// Ответ сервера после оформления
export interface IOrderReceiptPayload {
    id: string;
    total: number;
    items: string[];
}

export interface IOrderValidationDigest {
    valid: boolean;
    message: string;
}

// Данные покупателя
export interface IPurchaserProfile {
    payment: TPay;
    email: string;
    phone: string;
    address: string;
}

// Пакет данных заказа для отправки
export interface IOrderSubmissionPacket {
    address: string;
    email: string;
    payment: IPaymentMethodSelection;
    phone: string;
    items: string[];
    total: number;
}

export interface IOrderProcessModel extends IOrderSubmissionPacket {
    clear(): void;
    getOrderData(): IOrderSubmissionPacket;
}

export interface IContactFormState extends IValidationStatusState {
    email: string;
    phone: string;
}

export interface ICheckoutSceneState extends IValidationStatusState {
    address: string;
    payment: IPaymentMethodSelection;
}
