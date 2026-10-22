import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Product,
  Coupon,
  ShippingZone,
} from '../models';
import { connectDatabase, disconnectDatabase } from '../../config/database';
import { config } from '../../config';
import { logger } from '../../common/utils/logger';

async function seed(): Promise<void> {
  logger.info('Starting EVee database seed...');
  await connectDatabase();

  // 1. Seed Admin User
  const existingAdmin = await User.findOne({ email: config.seed.adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(config.seed.adminPassword, config.bcrypt.saltRounds);
    await User.create({
      name: config.seed.adminName,
      email: config.seed.adminEmail,
      normalizedEmail: config.seed.adminEmail.toLowerCase(),
      passwordHash,
      role: 'admin',
      emailVerified: true,
      accountStatus: 'active',
    });
    logger.info(`Admin user created: ${config.seed.adminEmail}`);
  } else {
    logger.info(`Admin user already exists: ${config.seed.adminEmail}`);
  }

  // 2. Seed Categories
  const vehiclesParent = await Category.findOneAndUpdate(
    { slug: 'electric-vehicles' },
    {
      name: 'Electric Vehicles',
      slug: 'electric-vehicles',
      description: 'Zero emission premium electric motorcycles and scooters by Crown Motors',
      isActive: true,
      sortOrder: 1,
    },
    { upsert: true, new: true }
  );

  const motorcyclesCat = await Category.findOneAndUpdate(
    { slug: 'electric-motorcycles' },
    {
      name: 'Electric Motorcycles',
      slug: 'electric-motorcycles',
      description: 'High-performance electric street bikes',
      parent: vehiclesParent._id,
      isActive: true,
      sortOrder: 1,
    },
    { upsert: true, new: true }
  );

  const scootersCat = await Category.findOneAndUpdate(
    { slug: 'electric-scooters' },
    {
      name: 'Electric Scooters',
      slug: 'electric-scooters',
      description: 'Urban commuter electric scooters for city travel',
      parent: vehiclesParent._id,
      isActive: true,
      sortOrder: 2,
    },
    { upsert: true, new: true }
  );

  const accessoriesCat = await Category.findOneAndUpdate(
    { slug: 'ev-accessories' },
    {
      name: 'EV Accessories',
      slug: 'ev-accessories',
      description: 'Chargers, smart helmets, protective gear and accessories',
      isActive: true,
      sortOrder: 2,
    },
    { upsert: true, new: true }
  );

  logger.info('Categories seeded successfully');

  // 3. Seed Products
  const products = [
    {
      name: 'EVee Pro 125',
      slug: 'evee-pro-125',
      sku: 'EVE-M125-PRO',
      brand: 'EVee',
      productType: 'motorcycle',
      category: motorcyclesCat._id,
      description:
        'The flagship electric street motorcycle by Crown Motors. Engineered for power, exceptional range, and seamless connectivity. Featuring a 72V 45Ah graphene battery and a 3000W brushless DC motor.',
      shortDescription: 'High-performance electric motorcycle with 120km range',
      basePrice: 28500000, // 285,000 PKR in paisa
      compareAtPrice: 31000000,
      currency: 'PKR',
      images: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
      ],
      specifications: [
        { key: 'battery_capacity', label: 'Battery Capacity', value: '72V 45Ah', unit: 'Ah', group: 'Battery' },
        { key: 'battery_type', label: 'Battery Type', value: 'Graphene / Lithium-Ion Option', group: 'Battery' },
        { key: 'range', label: 'Claimed Range', value: '120', unit: 'km', group: 'Performance' },
        { key: 'motor_power', label: 'Motor Power', value: '3000', unit: 'W', group: 'Performance' },
        { key: 'top_speed', label: 'Maximum Speed', value: '85', unit: 'km/h', group: 'Performance' },
        { key: 'charging_time', label: 'Charging Time', value: '4 - 5', unit: 'hours', group: 'Battery' },
        { key: 'weight', label: 'Curb Weight', value: '105', unit: 'kg', group: 'Dimensions' },
        { key: 'warranty', label: 'Warranty', value: '3 Years Battery / 2 Years Motor', group: 'General' },
      ],
      colorVariants: [
        {
          name: 'Stealth Black',
          colorHex: '#1a1a1a',
          sku: 'EVE-M125-PRO-BLK',
          additionalPrice: 0,
          inventory: 15,
          reservedInventory: 0,
          isActive: true,
          images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80'],
        },
        {
          name: 'Electric Cyan',
          colorHex: '#00d4aa',
          sku: 'EVE-M125-PRO-CYN',
          additionalPrice: 500000, // +5,000 PKR
          inventory: 10,
          reservedInventory: 0,
          isActive: true,
          images: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80'],
        },
      ],
      inventory: 25,
      reservedInventory: 0,
      inventoryPolicy: 'track',
      isActive: true,
      isFeatured: true,
      tags: ['motorcycle', 'electric', 'commuter', 'flagship'],
      averageRating: 4.8,
      reviewCount: 14,
      soldCount: 42,
    },
    {
      name: 'EVee City Commuter',
      slug: 'evee-city-commuter',
      sku: 'EVE-S60-CITY',
      brand: 'EVee',
      productType: 'scooter',
      category: scootersCat._id,
      description:
        'Designed specifically for daily urban commuting across bustling cities. Lightweight frame, regenerative braking, digital instrument cluster, and removable battery pack for easy home charging.',
      shortDescription: 'Smart electric scooter for effortless city riding',
      basePrice: 19500000, // 195,000 PKR in paisa
      currency: 'PKR',
      images: [
        'https://images.unsplash.com/photo-1571188654248-7a89213915f7?auto=format&fit=crop&w=1000&q=80',
      ],
      specifications: [
        { key: 'battery_capacity', label: 'Battery Capacity', value: '60V 32Ah', unit: 'Ah', group: 'Battery' },
        { key: 'range', label: 'Claimed Range', value: '85', unit: 'km', group: 'Performance' },
        { key: 'motor_power', label: 'Motor Power', value: '1500', unit: 'W', group: 'Performance' },
        { key: 'top_speed', label: 'Maximum Speed', value: '60', unit: 'km/h', group: 'Performance' },
        { key: 'charging_time', label: 'Charging Time', value: '3.5', unit: 'hours', group: 'Battery' },
        { key: 'weight', label: 'Curb Weight', value: '78', unit: 'kg', group: 'Dimensions' },
        { key: 'warranty', label: 'Warranty', value: '2 Years Manufacturer Warranty', group: 'General' },
      ],
      colorVariants: [
        {
          name: 'Pearl White',
          colorHex: '#ffffff',
          sku: 'EVE-S60-CITY-WHT',
          additionalPrice: 0,
          inventory: 20,
          reservedInventory: 0,
          isActive: true,
          images: ['https://images.unsplash.com/photo-1571188654248-7a89213915f7?auto=format&fit=crop&w=1000&q=80'],
        },
        {
          name: 'Slate Grey',
          colorHex: '#708090',
          sku: 'EVE-S60-CITY-GRY',
          additionalPrice: 0,
          inventory: 18,
          reservedInventory: 0,
          isActive: true,
          images: ['https://images.unsplash.com/photo-1571188654248-7a89213915f7?auto=format&fit=crop&w=1000&q=80'],
        },
      ],
      inventory: 38,
      reservedInventory: 0,
      inventoryPolicy: 'track',
      isActive: true,
      isFeatured: true,
      tags: ['scooter', 'urban', 'commuter', 'economical'],
      averageRating: 4.6,
      reviewCount: 22,
      soldCount: 68,
    },
    {
      name: 'EVee Fast Home Charger 15A',
      slug: 'evee-fast-home-charger-15a',
      sku: 'EVE-ACC-CHG15',
      brand: 'EVee',
      productType: 'accessory',
      category: accessoriesCat._id,
      description:
        'Intelligent fast-charger compatible with all EVee electric motorcycles and scooters. Cuts charging time by 40% with smart thermal management and auto cutoff.',
      shortDescription: 'High-speed smart charger with auto cutoff',
      basePrice: 1850000, // 18,500 PKR in paisa
      currency: 'PKR',
      images: [
        'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?auto=format&fit=crop&w=1000&q=80',
      ],
      specifications: [
        { key: 'input_voltage', label: 'Input Voltage', value: '220V AC 50Hz', group: 'Electrical' },
        { key: 'output_current', label: 'Output Current', value: '15A Fast Charge', group: 'Electrical' },
        { key: 'protection', label: 'Protection', value: 'Overvoltage, Short Circuit, Thermal', group: 'Safety' },
      ],
      colorVariants: [],
      inventory: 100,
      reservedInventory: 0,
      inventoryPolicy: 'track',
      isActive: true,
      isFeatured: false,
      tags: ['charger', 'accessory', 'fast-charging'],
      averageRating: 4.9,
      reviewCount: 31,
      soldCount: 95,
    },
    {
      name: 'Sovereign R',
      slug: 'sovereign-r',
      sku: 'CRW-SOV-R26',
      brand: 'Crown',
      productType: 'motorcycle',
      category: motorcyclesCat._id,
      description:
        'Engineered for effortless distance and untamed performance. The Sovereign R combines whisper-quiet aerodynamics, active electronic suspension, and Crown proprietary high-density battery architecture for grand touring without compromise.',
      shortDescription: 'The Electric Grand Tourer with 220 miles range and 105 kW power',
      basePrice: 2490000, // $24,900 / 2,490,000 subunits
      compareAtPrice: 2690000,
      currency: 'USD',
      images: ['/images/home/sovereign-r-d.png'],
      specifications: [
        { key: 'range', label: 'Range (City)', value: '220', unit: 'miles', group: 'Performance' },
        { key: 'power', label: 'Peak Power', value: '105', unit: 'kW', group: 'Performance' },
        { key: 'acceleration', label: '0–60 mph', value: '2.9', unit: 'sec', group: 'Performance' },
        { key: 'top_speed', label: 'Top Speed', value: '135', unit: 'mph', group: 'Performance' },
      ],
      colorVariants: [
        {
          name: 'Obsidian Black',
          colorHex: '#0f0f10',
          sku: 'CRW-SOV-R26-OBS',
          additionalPrice: 0,
          inventory: 20,
          reservedInventory: 0,
          isActive: true,
          images: ['/images/home/sovereign-r-d.png'],
        },
      ],
      inventory: 20,
      reservedInventory: 0,
      inventoryPolicy: 'track',
      isActive: true,
      isFeatured: true,
      tags: ['motorcycle', 'crown', 'sovereign', 'flagship'],
      averageRating: 5.0,
      reviewCount: 18,
      soldCount: 12,
    },
    {
      name: 'Vector S',
      slug: 'vector-s',
      sku: 'CRW-VEC-S26',
      brand: 'Crown',
      productType: 'motorcycle',
      category: motorcyclesCat._id,
      description:
        'Agile, razor-sharp, and stripped of excess. The Vector S is built for urban precision and immediate throttle response, delivering pure confidence through city traffic and tight canyon switchbacks.',
      shortDescription: 'The City, Reimagined — 160 miles range and 70 kW power',
      basePrice: 1890000, // $18,900
      compareAtPrice: 1990000,
      currency: 'USD',
      images: ['/images/home/vector-s-d.png'],
      specifications: [
        { key: 'range', label: 'Range (City)', value: '160', unit: 'miles', group: 'Performance' },
        { key: 'power', label: 'Peak Power', value: '70', unit: 'kW', group: 'Performance' },
        { key: 'acceleration', label: '0–60 mph', value: '3.4', unit: 'sec', group: 'Performance' },
        { key: 'top_speed', label: 'Top Speed', value: '115', unit: 'mph', group: 'Performance' },
      ],
      colorVariants: [
        {
          name: 'Raw Titanium',
          colorHex: '#6b7280',
          sku: 'CRW-VEC-S26-TIT',
          additionalPrice: 0,
          inventory: 25,
          reservedInventory: 0,
          isActive: true,
          images: ['/images/home/vector-s-d.png'],
        },
      ],
      inventory: 25,
      reservedInventory: 0,
      inventoryPolicy: 'track',
      isActive: true,
      isFeatured: true,
      tags: ['motorcycle', 'crown', 'vector', 'urban'],
      averageRating: 4.9,
      reviewCount: 24,
      soldCount: 30,
    },
    {
      name: 'Nomad X',
      slug: 'nomad-x',
      sku: 'CRW-NOM-X26',
      brand: 'Crown',
      productType: 'motorcycle',
      category: motorcyclesCat._id,
      description:
        'Designed for adventurous spirits seeking unmapped routes. Featuring long-travel suspension, reinforced forged aluminum bash plates, and dual riding modes calibrated for tarmac and unpaved terrain alike.',
      shortDescription: 'Beyond the Ordinary — 245 miles range and 110 kW power',
      basePrice: 2790000, // $27,900
      compareAtPrice: 2990000,
      currency: 'USD',
      images: ['/images/home/nomad-x-d.png'],
      specifications: [
        { key: 'range', label: 'Range (City)', value: '245', unit: 'miles', group: 'Performance' },
        { key: 'power', label: 'Peak Power', value: '110', unit: 'kW', group: 'Performance' },
        { key: 'acceleration', label: '0–60 mph', value: '3.1', unit: 'sec', group: 'Performance' },
        { key: 'top_speed', label: 'Top Speed', value: '125', unit: 'mph', group: 'Performance' },
      ],
      colorVariants: [
        {
          name: 'Dune Sand & Sage',
          colorHex: '#9ca3af',
          sku: 'CRW-NOM-X26-DUN',
          additionalPrice: 0,
          inventory: 15,
          reservedInventory: 0,
          isActive: true,
          images: ['/images/home/nomad-x-d.png'],
        },
      ],
      inventory: 15,
      reservedInventory: 0,
      inventoryPolicy: 'track',
      isActive: true,
      isFeatured: true,
      tags: ['motorcycle', 'crown', 'nomad', 'adventure'],
      averageRating: 5.0,
      reviewCount: 16,
      soldCount: 9,
    },
  ];

  for (const prod of products) {
    await Product.findOneAndUpdate({ slug: prod.slug }, prod, { upsert: true, new: true });
    logger.info(`Product seeded: ${prod.name}`);
  }

  // 4. Seed Shipping Zones
  await ShippingZone.findOneAndUpdate(
    { name: 'Pakistan Nationwide' },
    {
      name: 'Pakistan Nationwide',
      description: 'Secure carrier vehicle transport across Pakistan',
      countries: ['PK'],
      methods: [
        {
          name: 'Secure Carrier Transport',
          description: 'Specialized vehicle freight container with insurance',
          price: 600000, // 6,000 PKR
          estimatedDaysMin: 3,
          estimatedDaysMax: 7,
          isActive: true,
        },
        {
          name: 'Showroom Pickup (Crown Motors Flagship)',
          description: 'Complimentary handover and full vehicle inspection',
          price: 0,
          estimatedDaysMin: 1,
          estimatedDaysMax: 2,
          isActive: true,
          restrictions: { requiresPickup: true },
        },
      ],
      freeShippingThreshold: 50000000, // Free delivery for orders above 500,000 PKR
      isActive: true,
    },
    { upsert: true }
  );

  logger.info('Shipping zones seeded');

  // 5. Seed Promotional Coupons
  const adminDoc = await User.findOne({ role: 'admin' });
  const adminId = adminDoc ? adminDoc._id : new mongoose.Types.ObjectId();

  await Coupon.findOneAndUpdate(
    { code: 'EVEEFIRST' },
    {
      code: 'EVEEFIRST',
      description: '10% off on your first EVee vehicle purchase',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderValue: 10000000, // Minimum 100,000 PKR
      maximumDiscountAmount: 2500000, // Max discount 25,000 PKR
      usageLimit: 500,
      userUsageLimit: 1,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdBy: adminId,
    },
    { upsert: true }
  );

  await Coupon.findOneAndUpdate(
    { code: 'CROWN5000' },
    {
      code: 'CROWN5000',
      description: 'Flat 5,000 PKR discount on any vehicle or accessory',
      discountType: 'fixed',
      discountValue: 500000, // 5,000 PKR in paisa
      minimumOrderValue: 5000000, // Minimum 50,000 PKR
      usageLimit: 1000,
      userUsageLimit: 2,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: adminId,
    },
    { upsert: true }
  );

  logger.info('Coupons seeded');
  logger.info('Database seeding completed successfully!');

  await disconnectDatabase();
}

seed().catch((err) => {
  logger.error('Seed process failed:', err);
  process.exit(1);
});
