import type {
  CourierAssignmentDto,
  LocationDto,
  MealOrderCompanyLocationDto,
  MealOrderDto,
} from '@/features/courier/types';
import type { CompanyPickup, DeliveryStop } from '@/features/orders/types';

function buildLocationIndex(locations: LocationDto[]): Map<number, LocationDto> {
  return new Map(locations.map(location => [location.id, location]));
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return '';
}

function optionalCount(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function optionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function buildStopTitle(locationName: string, companyName: string, assignmentId: number): string {
  if (locationName && companyName && locationName !== companyName) {
    return `${locationName} - ${companyName}`;
  }
  if (locationName) {
    return locationName;
  }
  if (companyName) {
    return companyName;
  }
  return `Маршрут #${assignmentId}`;
}

function resolveCompanyFields(
  companyLocationId: number,
  orders: MealOrderDto[],
  locationById: Map<number, LocationDto>,
  assignment: CourierAssignmentDto,
): {
  name: string;
  address: string;
  containerCount: number | null;
  instruction: string | null;
} {
  const nested = orders[0]?.company_location ?? null;
  const location = locationById.get(companyLocationId);

  const address = firstNonEmpty(nested?.address, location?.address);
  const name = firstNonEmpty(
    assignment.company_name,
    nested?.company_name,
    nested?.name,
    location?.name,
    address,
  );

  const containerCount = optionalCount(
    assignment.container_count ?? nested?.container_count,
  );
  const instruction = optionalText(
    assignment.instructions ?? nested?.instructions,
  );

  return { name, address, containerCount, instruction };
}

function buildCompanyFromOrders(
  companyLocationId: number,
  orders: MealOrderDto[],
  locationById: Map<number, LocationDto>,
  assignment: CourierAssignmentDto,
): CompanyPickup {
  const { name, address, containerCount, instruction } = resolveCompanyFields(
    companyLocationId,
    orders,
    locationById,
    assignment,
  );

  const items = orders.map(order => ({
    id: String(order.id),
    name: order.meal.name,
    quantity: 1,
  }));

  return {
    id: String(companyLocationId),
    name,
    address,
    photoUrl: '',
    items,
    pickedUpQuantity: orders.filter(o => o.is_delivered).length,
    containerCount,
    instruction,
    foodCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function firstCompanyLocation(
  orders: MealOrderDto[],
): MealOrderCompanyLocationDto | null {
  for (const order of orders) {
    if (order.company_location != null) {
      return order.company_location;
    }
  }
  return null;
}

export function mapAssignmentsToStops(
  assignments: CourierAssignmentDto[],
  locations: LocationDto[],
): DeliveryStop[] {
  const locationById = buildLocationIndex(locations);

  return assignments.map((assignment, index) => {
    const pickupLocation = assignment.pickup_location != null
      ? locationById.get(assignment.pickup_location)
      : undefined;

    const ordersByCompany = new Map<number, MealOrderDto[]>();
    for (const order of assignment.orders) {
      if (order.company_location == null) {
        continue;
      }
      const list = ordersByCompany.get(order.company_location.id) ?? [];
      list.push(order);
      ordersByCompany.set(order.company_location.id, list);
    }

    const companies = [...ordersByCompany.entries()].map(([id, orders]) =>
      buildCompanyFromOrders(id, orders, locationById, assignment));

    const nestedCompany = firstCompanyLocation(assignment.orders);
    const companyLocationId = nestedCompany?.id
      ?? assignment.company_location
      ?? null;
    const companyLocation = companyLocationId != null
      ? locationById.get(companyLocationId)
      : undefined;

    const locationName = firstNonEmpty(
      assignment.location_name,
      nestedCompany?.name,
      pickupLocation?.name,
      companyLocation?.name,
    );
    const companyName = firstNonEmpty(
      assignment.company_name,
      nestedCompany?.company_name,
      companies[0]?.name,
    );

    const containerCount = optionalCount(
      assignment.container_count
      ?? nestedCompany?.container_count
      ?? companies[0]?.containerCount,
    );
    const instruction = optionalText(
      assignment.instructions
      ?? nestedCompany?.instructions
      ?? companies[0]?.instruction,
    );

    const sequence = typeof assignment.sequence === 'number'
      && Number.isFinite(assignment.sequence)
      && assignment.sequence >= 1
      ? Math.floor(assignment.sequence)
      : index + 1;

    const address = firstNonEmpty(
      pickupLocation?.address,
      nestedCompany?.address,
      companyLocation?.address,
      companies[0]?.address,
    );

    return {
      id: String(assignment.id),
      name: buildStopTitle(locationName, companyName, assignment.id),
      address,
      photoUrl: '',
      isDelivered: assignment.orders.length > 0
        && assignment.orders.every(o => o.is_delivered),
      companies,
      locationName,
      companyName,
      containerCount,
      sequence,
      instruction,
    };
  });
}

/** @deprecated Use mapAssignmentsToStops instead */
export function mapCourierAssignmentToDeliveryStop(
  assignment: CourierAssignmentDto,
): DeliveryStop {
  return mapAssignmentsToStops([assignment], [])[0]!;
}
