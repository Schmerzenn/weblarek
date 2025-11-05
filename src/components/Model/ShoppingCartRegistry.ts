import { IInventoryItemSchema } from "../../types";

// Храним выбранные пользователем товары
class ShoppingCartRegistry {
    private cartEntries: IInventoryItemSchema[] = [];

    listCartEntries(): IInventoryItemSchema[] {
        return this.cartEntries;
    }

    // Добавляем товар в корзину без дополнительной проверки
    registerProduct(product: IInventoryItemSchema): void {
        this.cartEntries.push(product);
    }

    // Удаляем товар по идентификатору
    expelProduct(product: IInventoryItemSchema): void {
        this.cartEntries = this.cartEntries.filter((entry) => entry.id !== product.id);
    }

    wipeCart(): void {
        this.cartEntries = [];
    }

    // Суммируем стоимость товаров, подставляя 0 при отсутствии цены
    calculateTotalPrice(): number {
        return this.cartEntries.reduce((total, entry) => total + (entry.price ?? 0), 0);
    }

    countRegisteredProducts(): number {
        return this.cartEntries.length;
    }

    // Проверяем, что товар уже есть в корзине
    hasProduct(id: string): boolean {
        return this.cartEntries.some((entry) => entry.id === id);
    }

    getCartProducts(): IInventoryItemSchema[] {
        return this.listCartEntries();
    }

    addProductToCart(product: IInventoryItemSchema): void {
        this.registerProduct(product);
    }

    removeProductFromCart(product: IInventoryItemSchema): void {
        this.expelProduct(product);
    }

    clearCart(): void {
        this.wipeCart();
    }

    getTotalCartPrice(): number {
        return this.calculateTotalPrice();
    }

    getTotalCartProducts(): number {
        return this.countRegisteredProducts();
    }

    isProductInCart(id: string): boolean {
        return this.hasProduct(id);
    }
}

export { ShoppingCartRegistry as Cart };
