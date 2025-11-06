import './scss/styles.scss';
import { Catalog } from './components/Model/Catalog';
import { Cart } from './components/Model/ShoppingCartRegistry';
import { Buyer } from './components/Model/Customer';
import { Api as ApiService } from './components/Model/ApiCommunication';
import { API_URL, CDN_URL } from './helpers/const';
import { EventEmitter } from './components/base/Events';
import { ensureElement, cloneTemplate } from './helpers/helper';
import { Gallery } from './components/View/CatalogGallery';
import { Header } from './components/View/HeaderPanel';
import { CardCatalog } from './components/View/Card/CatalogCardView';
import {
    IOrderSubmissionPacket,
    ICatalogApiPayload,
    IInventoryItemSchema,
    TOrderAddressPayload,
    TOrderPaymentPayload,
    TContactEmailPayload,
    TContactPhonePayload,
} from './types';
import { CardPreview } from './components/View/Card/PreviewCardView';
import { Modal } from './components/View/ModalPortal';
import { Basket } from './components/View/BasketOverlay';
import { CardBasket } from './components/View/Card/BasketLineCard';
import { FormOrder } from './components/View/Form/OrderForm';
import { FormContacts } from './components/View/Form/ContactFormView';
import { Success } from './components/View/OrderSuccess';

type TEventPayload = { id: string };

type TTemplateRegistry = {
    catalogCard: HTMLTemplateElement;
    previewCard: HTMLTemplateElement;
    basket: HTMLTemplateElement;
    basketCard: HTMLTemplateElement;
    orderForm: HTMLTemplateElement;
    contactsForm: HTMLTemplateElement;
    success: HTMLTemplateElement;
};

type TViewRegistry = {
    preview: CardPreview;
    basket: Basket;
    orderForm: FormOrder;
    contactsForm: FormContacts;
    success: Success;
};
type TModalView = 'preview' | 'basket' | 'order' | 'contacts' | 'success' | null;

type TAppContext = {
    events: EventEmitter;
    catalogModel: Catalog;
    cartModel: Cart;
    buyerModel: Buyer;
    apiClient: ApiService;
    gallery: Gallery;
    header: Header;
    modal: Modal;
    templates: TTemplateRegistry;
    views: TViewRegistry;
    currentModalView: TModalView;
};

const events = new EventEmitter();

// Собираем базовый контекст приложения

const templates: TTemplateRegistry = {
    catalogCard: ensureElement<HTMLTemplateElement>('#card-catalog'),
    previewCard: ensureElement<HTMLTemplateElement>('#card-preview'),
    basket: ensureElement<HTMLTemplateElement>('#basket'),
    basketCard: ensureElement<HTMLTemplateElement>('#card-basket'),
    orderForm: ensureElement<HTMLTemplateElement>('#order'),
    contactsForm: ensureElement<HTMLTemplateElement>('#contacts'),
    success: ensureElement<HTMLTemplateElement>('#success'),
};

const modal = new Modal(ensureElement<HTMLElement>('.modal'), events);

const context: TAppContext = {
    events,
    catalogModel: new Catalog(events),
    cartModel: new Cart(),
    buyerModel: new Buyer(),
    apiClient: new ApiService(API_URL),
    gallery: new Gallery(ensureElement<HTMLElement>('.page__wrapper')),
    header: new Header(ensureElement<HTMLElement>('.header'), events),
    modal,
    templates,
    views: {
        preview: new CardPreview(cloneTemplate(templates.previewCard), events),
        basket: new Basket(cloneTemplate(templates.basket), events),
        orderForm: new FormOrder(
            cloneTemplate(templates.orderForm),
            {
                onAddressInput: (address) => events.emit('order:address-input', { address }),
                onPaymentSelect: (payment) => events.emit('order:payment-select', { payment }),
                onSubmit: () => events.emit('order:submit'),
            },
            events,
        ),
        contactsForm: new FormContacts(
            cloneTemplate(templates.contactsForm),
            {
                onEmailInput: (email) => events.emit('contacts:email-input', { email }),
                onPhoneInput: (phone) => events.emit('contacts:phone-input', { phone }),
                onSubmit: () => events.emit('contacts:submit'),
            },
        ),
        success: new Success(cloneTemplate(templates.success), {
            onOrdered: () => modal.close(),
        }),
    },
    currentModalView: null,
};

function syncCartCounter(ctx: TAppContext): void {
    // Обновляем число товаров в шапке
    ctx.header.counter = ctx.cartModel.getTotalCartProducts();
}

function renderCatalog(ctx: TAppContext): void {
    // Создаём карточки каталога и отображаем их
    const cards = ctx.catalogModel.getProducts().map((product) => {
        const card = new CardCatalog(cloneTemplate(ctx.templates.catalogCard), ctx.events);
        return card.render(product);
    });

    ctx.gallery.render({ catalog: cards });
}

function openPreview(ctx: TAppContext, productId: string): void {
    const product = ctx.catalogModel.getProductById(productId);
    if (!product) {
        return;
    }

    // Рендерим карточку и показываем её в модальном окне
    const previewCard = ctx.views.preview;
    const rendered = previewCard.render(product, ctx.cartModel.isProductInCart(productId));

    ctx.modal.render({ content: rendered });
    ctx.currentModalView = 'preview';
    ctx.modal.open();
}

function addProductToCart(ctx: TAppContext, productId: string): void {
    const product = ctx.catalogModel.getProductById(productId);
    if (!product) {
        return;
    }

    // Добавляем товар и обновляем счётчик
    ctx.cartModel.addProductToCart(product);
    syncCartCounter(ctx);
    syncPreviewCartState(ctx, productId);
    refreshBasketIfOpen(ctx);
}

function removeProductFromCart(ctx: TAppContext, productId: string): void {
    const product = ctx.catalogModel.getProductById(productId);
    if (!product) {
        return;
    }

    ctx.cartModel.removeProductFromCart(product);
    syncCartCounter(ctx);
    syncPreviewCartState(ctx, productId);
    refreshBasketIfOpen(ctx);
}

function syncPreviewCartState(ctx: TAppContext, productId: string): void {
    const previewCard = ctx.views.preview;
    if (previewCard.getIdentifier() !== productId) {
        return;
    }

    previewCard.setCartState(ctx.cartModel.isProductInCart(productId));
}

function mapBasketItems(ctx: TAppContext): HTMLElement[] {
    // Формируем элементы корзины
    return ctx.cartModel.getCartProducts().map((item, index) => {
        const basketCard = new CardBasket(cloneTemplate(ctx.templates.basketCard), {
            onRemove: (id: string) => removeProductFromCart(ctx, id),
        });

        basketCard.index = index + 1;
        basketCard.title = item.title;
        basketCard.price = item.price;

        return basketCard.render(item);
    });
}

function renderBasketView(ctx: TAppContext): HTMLElement {
    const basketView = ctx.views.basket;
    basketView.basket = mapBasketItems(ctx);
    basketView.total = ctx.cartModel.getTotalCartPrice();
    return basketView.render();
}

function refreshBasketIfOpen(ctx: TAppContext): void {
    if (ctx.modal.isOpen && ctx.currentModalView === 'basket') {
        ctx.modal.render({ content: renderBasketView(ctx) });
    }
}

function openBasket(ctx: TAppContext): void {
    const content = renderBasketView(ctx);
    ctx.modal.render({ content });
    ctx.modal.open();
    ctx.currentModalView = 'basket';
}

function applyBuyerSnapshot(ctx: TAppContext, form: FormOrder): void {
    const snapshot = ctx.buyerModel.getBuyerData();

    // Если данные уже сохранены, подставляем их в форму
    form.payment = snapshot?.payment ?? 'card';
    form.address = snapshot?.address ?? '';

    if (snapshot) {
        form.isAddressValid(ctx.buyerModel.sumAddressErrors());
    }
}

function showOrderForm(ctx: TAppContext): void {
    const orderForm = ctx.views.orderForm;
    orderForm.removeErrors();
    orderForm.submitButtonDisabled = false;
    applyBuyerSnapshot(ctx, orderForm);

    ctx.modal.render({ content: orderForm.render() });
    ctx.currentModalView = 'order';
    ctx.modal.open();
}

function ensureContactsValid(ctx: TAppContext, form: FormContacts): boolean {
    const contactErrors = ctx.buyerModel.sumContactsErrors();
    if (Object.keys(contactErrors).length > 0) {
        // Показываем ошибки контактов
        form.setContactsErrors(contactErrors);
        return false;
    }

    const addressErrors = ctx.buyerModel.sumAddressErrors();
    if (addressErrors.address) {
        form.errors = 'Укажите адрес доставки на предыдущем шаге.';
        return false;
    }

    return true;
}

async function submitOrder(ctx: TAppContext, form: FormContacts): Promise<void> {
    const contactData = form.getContactsData();

    ctx.buyerModel.setBuyerData({
        email: contactData.email,
        phone: contactData.phone,
    });

    if (!ensureContactsValid(ctx, form)) {
        return;
    }

    const buyerData = ctx.buyerModel.getBuyerData();
    // Формируем payload заказа
    const orderPayload: IOrderSubmissionPacket = {
        payment: buyerData?.payment ?? 'card',
        email: contactData.email,
        phone: contactData.phone,
        address: buyerData?.address ?? '',
        total: ctx.cartModel.getTotalCartPrice(),
        items: ctx.cartModel.getCartProducts().map((product) => product.id),
    };

    try {
        const result = await ctx.apiClient.submitOrder(orderPayload);
        showSuccessModal(ctx, result);
    } catch (error) {
        console.error('Order submission failed', error);
        const message =
            error instanceof Error ? error.message : 'Order submission failed. Please try again.';
        form.errors = message;
    }
}

function populateContactsForm(ctx: TAppContext, form: FormContacts): void {
    const snapshot = ctx.buyerModel.getBuyerData();
    if (!snapshot) {
        form.email = '';
        form.phone = '';
        return;
    }

    // Восстанавливаем сохранённые контакты
    form.email = snapshot.email;
    form.phone = snapshot.phone;
    form.setContactsErrors(ctx.buyerModel.sumContactsErrors());
}

function showContactsForm(ctx: TAppContext): void {
    const contactsForm = ctx.views.contactsForm;
    contactsForm.removeErrors();
    contactsForm.submitButtonDisabled = false;
    populateContactsForm(ctx, contactsForm);

    ctx.modal.render({ content: contactsForm.render() });
    ctx.currentModalView = 'contacts';
    ctx.modal.open();
}

function resetStateAfterSuccess(ctx: TAppContext): void {
    // После успешного заказа очищаем корзину и данные покупателя
    ctx.cartModel.clearCart();
    ctx.buyerModel.clearBuyerData();
    syncCartCounter(ctx);
}

function showSuccessModal(ctx: TAppContext, payload: { total: number }): void {
    const successView = ctx.views.success;

    // Показываем модальное окно с итоговой суммой
    successView.total = payload.total;

    ctx.modal.render({ content: successView.render() });
    ctx.currentModalView = 'success';
    ctx.modal.open();
    resetStateAfterSuccess(ctx);
}

function registerEventHandlers(ctx: TAppContext): void {
    // Регистрируем обработчики событий
    ctx.events.on('catalog:changed', () => renderCatalog(ctx));

    ctx.events.on('card:select', ({ id }: TEventPayload) => openPreview(ctx, id));
    ctx.events.on('card:add-product', ({ id }: TEventPayload) => addProductToCart(ctx, id));
    ctx.events.on('card:remove-product', ({ id }: TEventPayload) => removeProductFromCart(ctx, id));

    ctx.events.on('cart-counter:changed', () => syncCartCounter(ctx));
    ctx.events.on('cart:open', () => openBasket(ctx));
    ctx.events.on('cart:order', () => showOrderForm(ctx));
    ctx.events.on('cart:contacts', () => showContactsForm(ctx));

    ctx.events.on('order:address-input', ({ address }: TOrderAddressPayload) => {
        ctx.buyerModel.setBuyerData({ address });
        ctx.views.orderForm.isAddressValid(ctx.buyerModel.sumAddressErrors());
    });

    ctx.events.on('order:payment-select', ({ payment }: TOrderPaymentPayload) => {
        ctx.buyerModel.setBuyerData({ payment });
        ctx.views.orderForm.payment = payment;
    });

    ctx.events.on('order:submit', () => {
        const orderDetails = ctx.views.orderForm.getOrderData();
        ctx.buyerModel.setBuyerData({
            payment: orderDetails.payment,
            address: orderDetails.address,
        });
        ctx.views.orderForm.isAddressValid(ctx.buyerModel.sumAddressErrors());
    });

    ctx.events.on('contacts:email-input', ({ email }: TContactEmailPayload) => {
        ctx.buyerModel.setBuyerData({ email });
        ctx.views.contactsForm.setContactsErrors(ctx.buyerModel.sumContactsErrors());
    });

    ctx.events.on('contacts:phone-input', ({ phone }: TContactPhonePayload) => {
        ctx.buyerModel.setBuyerData({ phone });
        ctx.views.contactsForm.setContactsErrors(ctx.buyerModel.sumContactsErrors());
    });

    ctx.events.on('contacts:submit', () => submitOrder(ctx, ctx.views.contactsForm));
    ctx.events.on('modal:close', () => {
        ctx.currentModalView = null;
    });
}

async function bootstrapCatalog(ctx: TAppContext): Promise<void> {
    try {
        // Получаем каталог и корректируем данные перед показом
        const catalog: ICatalogApiPayload = await ctx.apiClient.retrieveCatalog();

        const patchedItems: IInventoryItemSchema[] = catalog.items.map((product) => ({
            ...product,
            image: `${CDN_URL}/${product.image}`.replace('svg', 'png'),
        }));

        ctx.catalogModel.setProducts(patchedItems);
    } catch (error) {
        console.error('Ошибка загрузки каталога', error);
    }
}

registerEventHandlers(context);
bootstrapCatalog(context);
