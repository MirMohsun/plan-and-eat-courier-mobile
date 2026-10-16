export type CourierLoginRequest = {
  email: string;
  password: string;
  device_token?: string;
};

export type CourierTokenDto = {
  access: string;
  refresh: string;
};

export type CourierLoginResponse = {
  token: CourierTokenDto;
};

export type MealOrderCompanyLocationDto = {
  id: number;
  address: string;
  longitude: string;
  latitude: string;
  /** Display name for the address / hub, e.g. "Bayil Bay". Optional until backend ships. */
  name?: string | null;
  /** Brand / office label, e.g. "Sabah Hub". Optional until backend ships. */
  company_name?: string | null;
  /** Delivery instructions for this address. Optional until backend ships. */
  instructions?: string | null;
  /** Containers to carry (not meal count). Optional until backend ships. */
  container_count?: number | null;
};

export type MealOrderDto = {
  id: number;
  meal: { id: number; name: string; image: string };
  company_location: MealOrderCompanyLocationDto | null;
  pickup_location: number | null;
  date: string;
  is_prepared: boolean;
  is_delivered: boolean;
};

export type CourierAssignmentDto = {
  id: number;
  company_location: number | null;
  pickup_location: number | null;
  orders: MealOrderDto[];
  /** Brand / office label. Optional until backend ships. */
  company_name?: string | null;
  /** Address / hub label. Optional until backend ships. */
  location_name?: string | null;
  /** Containers to carry. Optional until backend ships. */
  container_count?: number | null;
  /** Delivery instructions. Optional until backend ships. */
  instructions?: string | null;
  /** 1-based delivery order for the day. Optional until backend ships. */
  sequence?: number | null;
};

export type CourierCompleteOrderDto = {
  id: number;
};

export type LocationDto = {
  id: number;
  name: string;
  address: string;
  longitude: string;
  latitude: string;
  phone: string;
  start_hour: string;
  end_hour: string;
};

export type CourierProfileDto = {
  name: string;
  surname: string;
  email: string;
  mobile: string;
};

export const courierOrdersQueryKey = ['courier', 'orders'] as const;
export const locationsQueryKey = ['locations'] as const;
export const courierProfileQueryKey = ['courier', 'profile'] as const;
