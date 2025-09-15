// Centralized category data for category pages and product listing
export const CATEGORY_TREE = [
  {
    name: 'Plants',
    key: 'Plants',
    cover:
      'https://images.unsplash.com/photo-1446071103084-c257b5f70672?q=80&w=1600&auto=format&fit=crop',
    children: [
      { name: 'Indoor', key: 'Indoor' },
      { name: 'Outdoor', key: 'Outdoor' },
      { name: 'Medicinal/Herbal', key: 'Medicinal/Herbal' },
      { name: 'Fruit', key: 'Fruit' },
      { name: 'Flowering', key: 'Flowering' },
      { name: 'Air-Purifying', key: 'Air-Purifying' },
    ],
  },
  {
    name: 'Crops & Seeds',
    key: 'Crops & Seeds',
    cover:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop',
    children: [
      { name: 'Vegetables', key: 'Vegetables' },
      { name: 'Fruits', key: 'Fruits' },
      { name: 'Grains/Pulses', key: 'Grains/Pulses' },
      { name: 'Spices/Herbs', key: 'Spices/Herbs' },
    ],
  },
  {
    name: 'Pots & Planters',
    key: 'Pots & Planters',
    cover:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    children: [
      { name: 'Plastic', key: 'Plastic' },
      { name: 'Ceramic', key: 'Ceramic' },
      { name: 'Clay/Terracotta', key: 'Clay/Terracotta' },
      { name: 'Hanging', key: 'Hanging' },
      { name: 'Self-Watering', key: 'Self-Watering' },
      { name: 'Decorative', key: 'Decorative' },
    ],
  },
  {
    name: 'Soil & Fertilizers',
    key: 'Soil & Fertilizers',
    cover:
      'https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=1600&auto=format&fit=crop',
    children: [
      { name: 'Potting Mix', key: 'Potting Mix' },
      { name: 'Compost/Manure', key: 'Compost/Manure' },
      { name: 'Organic Fertilizers', key: 'Organic Fertilizers' },
      { name: 'Chemical Fertilizers', key: 'Chemical Fertilizers' },
      { name: 'Soil Conditioners', key: 'Soil Conditioners' },
    ],
  },
  {
    name: 'Gardening Tools',
    key: 'Gardening Tools',
    cover:
      'https://images.unsplash.com/photo-1457530378978-8bac673b8062?q=80&w=1600&auto=format&fit=crop',
    children: [
      { name: 'Hand Tools', key: 'Hand Tools' },
      { name: 'Watering Tools', key: 'Watering Tools' },
      { name: 'Supports', key: 'Supports' },
      { name: 'Kits', key: 'Kits' },
    ],
  },
  {
    name: 'Herbal & Eco Products',
    key: 'Herbal & Eco Products',
    cover:
      'https://images.unsplash.com/photo-1519681394781-01f782a7b4c3?q=80&w=1600&auto=format&fit=crop',
    children: [
      { name: 'Herbal Remedies', key: 'Herbal Remedies' },
      { name: 'Eco-Friendly Packs', key: 'Eco-Friendly Packs' },
    ],
  },
];

export function findCategoryByKey(key) {
  return CATEGORY_TREE.find((c) => c.key === key);
}