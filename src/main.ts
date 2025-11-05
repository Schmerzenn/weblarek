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
import { IOrderSubmissionPacket, ICatalogApiPayload, IInventoryItemSchema } from './types';
import { CardPreview } from './components/View/Card/PreviewCardView';
import { Modal } from './components/View/ModalPortal';
import { Basket } from './components/View/BasketOverlay';
import { CardBasket } from './components/View/Card/BasketLineCard';
import { FormOrder } from './components/View/Form/OrderForm';
import { FormContacts } from './components/View/Form/FormCont';
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
};

const events = new EventEmitter();

// Собираем базовый контекст приложения

const context: TAppContext = {
    events,
    catalogModel: new Catalog(events),
    cartModel: new Cart(),
    buyerModel: new Buyer(),
    apiClient: new ApiService(API_URL),
    gallery: new Gallery(ensureElement<HTMLElement>('.page__wrapper')),
    header: new Header(ensureElement<HTMLElement>('.header'), events),
    modal: new Modal(ensureElement<HTMLElement>('.modal'), events),
    templates: {
        catalogCard: ensureElement<HTMLTemplateElement>('#card-catalog'),
        previewCard: ensureElement<HTMLTemplateElement>('#card-preview'),
        basket: ensureElement<HTMLTemplateElement>('#basket'),
        basketCard: ensureElement<HTMLTemplateElement>('#card-basket'),
        orderForm: ensureElement<HTMLTemplateElement>('#order'),
        contactsForm: ensureElement<HTMLTemplateElement>('#contacts'),
        success: ensureElement<HTMLTemplateElement>('#success'),
    },
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
    const card = new CardPreview(cloneTemplate(ctx.templates.previewCard), ctx.events);
    const rendered = card.render(product, ctx.cartModel.isProductInCart(productId));

    ctx.modal.render({ content: rendered });
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
}

function removeProductFromCart(ctx: TAppContext, productId: string): void {
    const product = ctx.catalogModel.getProductById(productId);
    if (!product) {
        return;
    }

    ctx.cartModel.removeProductFromCart(product);
    syncCartCounter(ctx);
}

function mapBasketItems(ctx: TAppContext): HTMLElement[] {
    // Формируем элементы корзины
    return ctx.cartModel.getCartProducts().map((item, index) => {
        const basketCard = new CardBasket(cloneTemplate(ctx.templates.basketCard), ctx.events);

        basketCard.index = index + 1;
        basketCard.title = item.title;
        basketCard.price = item.price;

        return basketCard.render(item);
    });
}

function openBasket(ctx: TAppContext): void {
    const basketView = new Basket(cloneTemplate(ctx.templates.basket), ctx.events);

    // Подставляем товары и сумму, затем показываем корзину в модальном окне
    basketView.basket = mapBasketItems(ctx);
    basketView.total = ctx.cartModel.getTotalCartPrice();

    ctx.modal.render({ content: basketView.render() });
    ctx.modal.open();
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
    const orderForm = new FormOrder(
        cloneTemplate(ctx.templates.orderForm),
        // Пробрасываем обратные вызовы для сохранения данных в модели
        {
            onAddressInput: (address) => {
                ctx.buyerModel.setBuyerData({ address });
                orderForm.isAddressValid(ctx.buyerModel.sumAddressErrors());
            },
            onPaymentSelect: (payment) => {
                ctx.buyerModel.setBuyerData({ payment });
            },
            onSubmit: () => {
                const orderDetails = orderForm.orderData;
                ctx.buyerModel.setBuyerData({
                    payment: orderDetails.payment,
                    address: orderDetails.address,
                });
            },
        },
        ctx.events,
    );

    applyBuyerSnapshot(ctx, orderForm);

    ctx.modal.render({ content: orderForm.render() });
    ctx.modal.open();
}

function ensureContactsValid(ctx: TAppContext, form: FormContacts): boolean {
    const contactErrors = ctx.buyerModel.sumContactsErrors();
    if (Object.keys(contactErrors).length > 0) {
        // Показываем ошибки контактов
        form.isContactsValid(contactErrors);
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
    const contactData = form.contactsData;

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
        ctx.events.emit('cart:success', result);
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
        return;
    }

    // Восстанавливаем сохранённые контакты
    form.email = snapshot.email;
    form.phone = snapshot.phone;
    form.isContactsValid(ctx.buyerModel.sumContactsErrors());
}

function showContactsForm(ctx: TAppContext): void {
    const contactsForm = new FormContacts(
        cloneTemplate(ctx.templates.contactsForm),
        // Подписываемся на изменения полей и отправку формы
        {
            onEmailInput: (email) => {
                ctx.buyerModel.setBuyerData({ email });
                contactsForm.isContactsValid(ctx.buyerModel.sumContactsErrors());
            },
            onPhoneInput: (phone) => {
                ctx.buyerModel.setBuyerData({ phone });
                contactsForm.isContactsValid(ctx.buyerModel.sumContactsErrors());
            },
            onSubmit: () => submitOrder(ctx, contactsForm),
        },
    );

    populateContactsForm(ctx, contactsForm);

    ctx.modal.render({ content: contactsForm.render() });
    ctx.modal.open();
}

function resetStateAfterSuccess(ctx: TAppContext): void {
    // После успешного заказа очищаем корзину и данные покупателя
    ctx.cartModel.clearCart();
    ctx.buyerModel.clearBuyerData();
    syncCartCounter(ctx);
}

function showSuccessModal(ctx: TAppContext, payload: { total: number }): void {
    const successView = new Success(cloneTemplate(ctx.templates.success), {
        onOrdered: () => ctx.modal.close(),
    });

    // Показываем модальное окно с итоговой суммой
    successView.total = payload.total;

    ctx.modal.render({ content: successView.render() });
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
    ctx.events.on('cart:success', (result: { total: number }) => showSuccessModal(ctx, result));
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
