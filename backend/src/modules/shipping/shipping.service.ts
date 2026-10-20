import mongoose from 'mongoose';
import { ShippingZone, IShippingZone, IShippingMethod } from '../../database/models';
import { NotFoundError } from '../../common/errors/AppError';
import { CreateShippingZoneInput, UpdateShippingZoneInput } from './shipping.validators';

export async function getShippingZones(isAdmin = false): Promise<IShippingZone[]> {
  const filter = isAdmin ? {} : { isActive: true };
  return ShippingZone.find(filter);
}

export async function calculateShippingOptions(
  country: string,
  _city?: string,
  subtotal = 0
): Promise<Array<IShippingMethod & { calculatedFee: number }>> {
  if (mongoose.connection.readyState !== 1) {
    return [
      {
        name: 'Standard Vehicle Delivery',
        description: 'Secure carrier transit across Pakistan',
        price: 500000,
        calculatedFee: 500000,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        isActive: true,
      },
    ];
  }
  const zone = await ShippingZone.findOne({
    countries: country.toUpperCase(),
    isActive: true,
  });

  if (!zone) {
    // Sensible fallback shipping option if zone not found
    return [
      {
        name: 'Standard Vehicle Delivery',
        description: 'Secure carrier transit across Pakistan',
        price: 500000, // 5,000 PKR in paisa
        calculatedFee: 500000,
        estimatedDaysMin: 3,
        estimatedDaysMax: 7,
        isActive: true,
      },
    ];
  }

  const isFree =
    zone.freeShippingThreshold &&
    zone.freeShippingThreshold > 0 &&
    subtotal >= zone.freeShippingThreshold;

  return zone.methods
    .filter((m) => m.isActive)
    .map((m) => ({
      ...((m as any).toObject ? (m as any).toObject() : m),
      calculatedFee: isFree ? 0 : m.price,
    }));
}

export async function createShippingZone(data: CreateShippingZoneInput): Promise<IShippingZone> {
  return ShippingZone.create(data as any);
}

export async function updateShippingZone(
  id: string,
  data: UpdateShippingZoneInput
): Promise<IShippingZone> {
  const zone = await ShippingZone.findByIdAndUpdate(id, data, { new: true });
  if (!zone) throw new NotFoundError('Shipping Zone');
  return zone;
}

export async function deleteShippingZone(id: string): Promise<void> {
  const zone = await ShippingZone.findByIdAndDelete(id);
  if (!zone) throw new NotFoundError('Shipping Zone');
}
