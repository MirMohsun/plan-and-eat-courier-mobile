export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface CompanyPickup {
  id: string;
  name: string;
  photoUrl: string;
  address: string;
  items: DeliveryItem[];
  pickedUpQuantity: number;
  /** Containers for this company stop. Null when backend has not shipped the field. */
  containerCount: number | null;
  /** Delivery instructions for this company address. Null when missing. */
  instruction: string | null;
  /** Sum of item quantities (meal count). */
  foodCount: number;
}

export interface DeliveryStop {
  id: string;
  /** Card / hero title, e.g. "Bayil Bay - Sabah Hub". */
  name: string;
  address: string;
  photoUrl: string;
  companies: CompanyPickup[];
  isDelivered: boolean;
  locationName: string;
  companyName: string;
  /** Null when backend has not shipped container_count. */
  containerCount: number | null;
  /** 1-based delivery order. Always set (API sequence or list index + 1). */
  sequence: number;
  /** Null when backend has not shipped instructions. */
  instruction: string | null;
}
