import { IInventoryItemSchema } from "../../types";
import { IEvents } from "../base/Events";

// Храним каталог и выбранный товар
class Catalog {
  private catalogItems: IInventoryItemSchema[] = [];
  private highlightedProduct: IInventoryItemSchema | null = null;

  constructor(protected events: IEvents) {}

  // Сохраняем список товаров и уведомляем представление
  registerCatalog(products: IInventoryItemSchema[]): void {
    this.catalogItems = products;
    this.events.emit("catalog:changed");
  }

  listCatalog(): IInventoryItemSchema[] {
    return this.catalogItems;
  }

  locateProduct(id: string): IInventoryItemSchema | undefined {
    return this.catalogItems.find((product) => product.id === id);
  }

  // Запоминаем выбранный товар для предпросмотра
  highlightProduct(id: string): void {
    this.highlightedProduct = this.catalogItems.filter((product) => product.id === id)[0] ?? null;
  }

  fetchHighlightedProduct(): IInventoryItemSchema | null {
    return this.highlightedProduct;
  }

  // Compatibility pass-throughs
  setProducts(products: IInventoryItemSchema[]): void {
    this.registerCatalog(products);
  }

  getProducts(): IInventoryItemSchema[] {
    return this.listCatalog();
  }

  getProductById(id: string): IInventoryItemSchema | undefined {
    return this.locateProduct(id);
  }

  setSelectedProduct(id: string): void {
    this.highlightProduct(id);
  }

  getSelectedProduct(): IInventoryItemSchema | null {
    return this.fetchHighlightedProduct();
  }
}

export { Catalog as Catalog };
