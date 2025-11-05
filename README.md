https://github.com/Schmerzenn/weblarek/

# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Vite

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/main.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run dev
```

или

```
yarn
yarn dev
```

Для просмотра production-версии локально можно воспользоваться командами `npm run preview` или `yarn preview`.

## Сборка

```
npm run build
```

или

```
yarn build
```

# Интернет-магазин «Web-Larёk»

«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков, где пользователи могут просматривать товары, добавлять их в корзину и оформлять заказы. Сайт предоставляет удобный интерфейс с модальными окнами для просмотра деталей товаров, управления корзиной и выбора способа оплаты, обеспечивая полный цикл покупки с отправкой заказов на сервер.

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter), которая обеспечивает четкое разделение ответственности между классами слоев Model и View. Каждый слой несет свой смысл и ответственность:

Model - слой данных, отвечает за хранение и изменение данных.  
View - слой представления, отвечает за отображение данных на странице.  
Presenter - презентер содержит основную логику приложения и отвечает за связь представления и данных.

Взаимодействие между классами обеспечивается использованием событийно-ориентированного подхода. Модели и Представления генерируют события при изменении данных или взаимодействии пользователя с приложением, а Презентер обрабатывает эти события используя методы как Моделей, так и Представлений.

### Базовый код

#### Класс Component

Является базовым классом для всех компонентов интерфейса.
Класс является дженериком и принимает в переменной `T` тип данных, которые могут быть переданы в метод `render` для отображения.

Конструктор:  
`constructor(container: HTMLElement)` - принимает ссылку на DOM элемент за отображение, которого он отвечает.

Поля класса:  
`container: HTMLElement` - поле для хранения корневого DOM элемента компонента.

Методы класса:  
`render(data?: Partial<T>): HTMLElement` - Главный метод класса. Он принимает данные, которые необходимо отобразить в интерфейсе, записывает эти данные в поля класса и возвращает ссылку на DOM-элемент. Предполагается, что в классах, которые будут наследоваться от `Component` будут реализованы сеттеры для полей с данными, которые будут вызываться в момент вызова `render` и записывать данные в необходимые DOM элементы.  
`setImage(element: HTMLImageElement, src: string, alt?: string): void` - утилитарный метод для модификации DOM-элементов `<img>`

#### Класс Api

Содержит в себе базовую логику отправки запросов.

Конструктор:  
`constructor(baseUrl: string, options: RequestInit = {})` - В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.

Поля класса:  
`baseUrl: string` - базовый адрес сервера  
`options: RequestInit` - объект с заголовками, которые будут использованы для запросов.

Методы:  
`get(uri: string): Promise<object>` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер  
`post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.  
`handleResponse(response: Response): Promise<object>` - защищенный метод проверяющий ответ сервера на корректность и возвращающий объект с данными полученный от сервера или отклоненный промис, в случае некорректных данных.

#### Класс EventEmitter

Брокер событий реализует паттерн "Наблюдатель", позволяющий отправлять события и подписываться на события, происходящие в системе. Класс используется для связи слоя данных и представления.

Конструктор класса не принимает параметров.

Поля класса:  
`_events: Map<string | RegExp, Set<Function>>)` - хранит коллекцию подписок на события. Ключи коллекции - названия событий или регулярное выражение, значения - коллекция функций обработчиков, которые будут вызваны при срабатывании события.

Методы класса:  
`on<T extends object>(event: EventName, callback: (data: T) => void): void` - подписка на событие, принимает название события и функцию обработчик.  
`emit<T extends object>(event: string, data?: T): void` - инициализация события. При вызове события в метод передается название события и объект с данными, который будет использован как аргумент для вызова обработчика.  
`trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие с передачей в него данных из второго параметра.

### Данные

Данные разделены на описание товаров и сведения о заказе.

1. **Интерфейс `IProduct` (`src/types/index.ts`):**

   - `id`, `title`, `description`, `image`
   - `category: TCategory`
   - `price: number | null` (товар может быть бесценным)

   **Каталог (`ICatalogResult`):**

   - `total: number`
   - `items: IProduct[]`

2. **Интерфейс `IOrderRequest`:**

   - `payment: 'card' | 'cash'`
   - `email`, `phone`, `address`
   - `total: number`
   - `items: string[]` — идентификаторы выбранных товаров

   **Ответ сервера (`IOrderResult`):**

   - `id: string`
   - `total: number`
   - `items: string[]`

`IBuyer` описывает пользовательский ввод (способ оплаты, контакты, адрес), а `IValidationState`, `IContactsViewModel`, `ICheckoutViewModel` и др. помогают формам отображать ошибки и состояние валидации.

#### Модели данных

1. **Каталог (`Catalog`, `src/components/Model/Catalog.ts`)**

Поля:  
`catalogItems: IProduct[]` — список товаров.  
`highlightedProduct: IProduct | null` — выбранный товар предпросмотра.

Методы:  
`setProducts(products)` — сохраняет товары и эмитит `catalog:changed`.  
`getProducts()` — возвращает массив товаров.  
`getProductById(id)` — находит товар по идентификатору.  
`setSelectedProduct(id)` / `getSelectedProduct()` — управляет выбранной карточкой.

2. **Корзина (`Cart`, `src/components/Model/Cart.ts`)**

Поля:  
`cartEntries: IProduct[]` — текущее содержимое корзины.

Методы:  
`getCartProducts()` — возвращает товары.  
`addProductToCart(product)` — добавляет позицию.  
`removeProductFromCart(product)` — удаляет товар по id.  
`clearCart()` — полностью очищает корзину.  
`getTotalCartPrice()` — суммирует стоимость (учитывает `null`).  
`getTotalCartProducts()` — возвращает количество позиций.  
`isProductInCart(id)` — проверяет наличие товара.

3. **Покупатель (`Buyer`, `src/components/Model/Buyer.ts`)**

Поля:  
`profileState: IBuyer | null` — сохранённые данные покупателя.

Методы:  
`setBuyerData(detail)` — частично обновляет данные.  
`getBuyerData()` — возвращает введённые значения.  
`clearBuyerData()` — очищает состояние после успеха.  
`sumAddressErrors()` — валидация адреса.  
`sumContactsErrors()` — проверка email и телефона.

#### Слой коммуникации

`Api` (`src/components/Model/ApiCommunication.ts`) расширяет базовый класс и добавляет методы:

- `retrieveCatalog()` — `GET /product/`, возвращает `ICatalogResult`.
- `submitOrder(order)` — `POST /order`, приводит ответ к `IOrderResult`.

Базовый URL вычисляется как `${VITE_API_ORIGIN}/api/weblarek`, а изображения берутся с `${VITE_API_ORIGIN}/content/weblarek`.

#### Слой представления (View)

Переиспользуемые абстракции:

1. **`Card` (`src/components/View/Card/Card.ts`)** — базовая карточка товара.

```
Конструктор: container: HTMLElement
Поля:
- titleNode — заголовок
- priceNode — цена
- cardIdentifier — идентификатор карточки
Методы:
- set title / get title — работа с заголовком
- set price — вывод цены или «Бесценно»
- render(data) — возвращает DOM-узел с заполненными данными
```

2. **`Form` (`src/components/View/Form/Form.ts`)** — общий каркас для форм.

```
Конструктор: container: HTMLElement, actions?: IFormActions
Поля:
- errorsPlaceholder — блок ошибок
- submitTrigger — кнопка отправки
Методы:
- set errors — выводит текст ошибки
- set submitButtonDisabled — включает/выключает кнопку
- removeErrors() / checkErrors(errors) — управление валидацией
```

3. **`Modal` (`src/components/View/Modal.ts`)** — модальное окно.

```
Конструктор: container: HTMLElement, events: IEvents
Поля:
- closeTrigger, contentHost, pageWrapper
- isOpen — флаг состояния
Методы:
- set content(elem) — вставляет содержимое
- open() / close() — управляют видимостью и блокировкой прокрутки
```

##### Конкретные View-классы

1. **`Header` (`src/components/View/Header.ts`)** — отображает счётчик корзины, по клику эмитит `cart:open`.
2. **`Gallery` (`src/components/View/Gallery.ts`)** — контейнер каталога, метод `set catalog` подменяет карточки.
3. **`Basket` (`src/components/View/Basket.ts`)** — модальное окно корзины: метод `set basket` меняет список товаров, `set total` — сумму заказа, кнопка оформления генерирует `cart:order`.
4. **`CardCatalog` (`src/components/View/Card/CardCatalog.ts`)** — карточка каталога, управляет категорией/изображением и эмитит `card:select`.
5. **`CardPreview` (`src/components/View/Card/CardPreview.ts`)** — предпросмотр товара в модалке, переключает кнопку «Купить / Удалить из корзины», эмитит `card:add-product` и `card:remove-product`.
6. **`CardBasket` (`src/components/View/Card/CardBasket.ts`)** — пункт корзины с порядковым номером, удаляет товар и инициирует `cart:open` для обновления списка.
7. **`FormOrder` (`src/components/View/Form/FormOrder.ts`)** — форма выбора оплаты и адреса, подсвечивает выбранный способ (`highlighTPay`), проверяет адрес (`isAddressValid`), эмитит `cart:contacts`.
8. **`FormContacts` (`src/components/View/Form/FormContacts.ts`)** — форма контактов: сеттеры `email` и `phone`, метод `isContactsValid`, геттер `contactsData`.
9. **`Success` (`src/components/View/Success.ts`)** — окно успеха, выводит сумму списания (`set total`) и может вызвать обработчик закрытия (`onOrdered`).

#### Презентер (`src/main.ts`)

`main.ts` создаёт экземпляры моделей, представлений и событийного брокера, загружает HTML-шаблоны с помощью `cloneTemplate` и регистрирует обработчики:

```
const events = new EventEmitter();
```

Основные события:

- `catalog:changed` — рендерит каталог (`renderCatalog`).
- `card:select` — открывает модальное окно предпросмотра.
- `card:add-product` / `card:remove-product` — обновляют корзину и счётчик в хедере.
- `cart:open` — показывает корзину с актуальными позициями.
- `cart:order` — открывает форму оплаты и адреса.
- `cart:contacts` — показывает форму контактов и инициирует отправку заказа.
- `cart:success` — отображает окно успеха, очищает корзину и данные покупателя.

При старте вызывается `bootstrapCatalog`: приложение запрашивает каталог (`retrieveCatalog`), подставляет CDN-URL картинок и сохраняет товары в модель.

## API

Работа с сервером происходит через `${VITE_API_ORIGIN}/api/weblarek`:

- `GET /product/` — возвращает `ICatalogResult`.
- `POST /order` — принимает `IOrderRequest`, отвечает `IOrderResult`.

Изображения хранятся на `${VITE_API_ORIGIN}/content/weblarek`; путь формируется в `main.ts` (подстановка `png` вместо исходного `svg`).
