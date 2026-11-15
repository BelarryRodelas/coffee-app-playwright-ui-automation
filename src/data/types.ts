export interface Product {
  name: string;
  price: number;
}

export interface Customer {
  name: string;
  email: string;
  subscribeToPromotions: boolean;
}

export interface PromoOffer {
  extraItemName: string;
  extraItemPrice: number;
}

export interface Translation {
  product: string;
  chinese: string;
}
