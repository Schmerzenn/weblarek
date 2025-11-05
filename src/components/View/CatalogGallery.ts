import { Component } from "../base/Component";
import { ensureElement } from "../../helpers/helper";

interface TGalleryState {
    catalog: HTMLElement[];
}

// галереи каталога
class CatalogGalleryView extends Component<TGalleryState> {
    protected catalogHost: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this.catalogHost = ensureElement<HTMLElement>(".gallery", this.container);
    }

    // заменяем содержимое галереи переданными элементами
    set catalog(items: HTMLElement[]) {
        this.catalogHost.replaceChildren(...items);
    }
}

export { CatalogGalleryView as Gallery };
