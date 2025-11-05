import { ICatalogApiPayload, IOrderSubmissionPacket, IOrderReceiptPayload } from "../../types";
import { Api } from "../base/Api";

// Класс для работы с API
class RemoteApiSchema extends Api {
    constructor(baseUrl: string, options: RequestInit = {}) {
        super(baseUrl, options);
    }

    // Получаем каталог товаров
    retrieveCatalog(): Promise<ICatalogApiPayload> {
        return this.get("/product/");
    }

    // Отправляем заказ и ждём подтверждение от сервера
    submitOrder(order: IOrderSubmissionPacket): Promise<IOrderReceiptPayload> {
        return this.post("/order", order).then((data => data as IOrderReceiptPayload));
    }
 
}

export { RemoteApiSchema as Api };
