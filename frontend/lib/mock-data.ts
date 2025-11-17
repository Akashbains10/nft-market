export interface NFT {
  id: string
  name: string
  collection: string
  image: string
  price: string
  priceUSD: string
  owner: string
  creator: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description: string
  metadata: {
    properties: Array<{
      trait: string
      value: string
    }>
  }
}

export const mockNFTs: NFT[] = [
  {
    id: '1',
    name: 'Cyber Estate Alpha',
    collection: 'Digital Properties',
    image: '/futuristic-nft-property-with-blue-neon-lights.jpg',
    price: '2.5',
    priceUSD: '$5,500',
    owner: '0x1234...5678',
    creator: '0xabcd...efgh',
    rarity: 'legendary',
    description: 'A premium digital property in the metaverse featuring cutting-edge architecture and exclusive amenities.',
    metadata: {
      properties: [
        { trait: 'Location', value: 'Downtown Virtual City' },
        { trait: 'Size', value: '10,000 sq ft' },
        { trait: 'Features', value: 'Smart Automation' },
      ],
    },
  },
  {
    id: '2',
    name: 'Quantum Living Space',
    collection: 'Digital Properties',
    image: '/modern-minimalist-nft-property-design.jpg',
    price: '1.8',
    priceUSD: '$3,960',
    owner: '0x5678...1234',
    creator: '0xefgh...abcd',
    rarity: 'epic',
    description: 'A sleek modern living space with quantum-enhanced features and sustainable design.',
    metadata: {
      properties: [
        { trait: 'Location', value: 'Tech District' },
        { trait: 'Size', value: '8,000 sq ft' },
        { trait: 'Features', value: 'Green Energy' },
      ],
    },
  },
  {
    id: '3',
    name: 'Luxury Nexus Tower',
    collection: 'Digital Properties',
    image: '/luxury-high-tech-nft-property-tower.jpg',
    price: '3.2',
    priceUSD: '$7,040',
    owner: '0x9abc...def0',
    creator: '0x2def...0123',
    rarity: 'legendary',
    description: 'An exclusive luxury property featuring premium amenities and unparalleled connectivity.',
    metadata: {
      properties: [
        { trait: 'Location', value: 'Prestige Plaza' },
        { trait: 'Size', value: '15,000 sq ft' },
        { trait: 'Features', value: 'AI Assistant' },
      ],
    },
  },
  {
    id: '4',
    name: 'Ethereal Garden Estate',
    collection: 'Digital Properties',
    image: '/beautiful-ethereal-garden-nft-estate.jpg',
    price: '1.4',
    priceUSD: '$3,080',
    owner: '0xf012...3456',
    creator: '0x3456...7890',
    rarity: 'rare',
    description: 'A serene digital property with enchanting garden features and peaceful ambiance.',
    metadata: {
      properties: [
        { trait: 'Location', value: 'Nature Reserve' },
        { trait: 'Size', value: '6,000 sq ft' },
        { trait: 'Features', value: 'Wellness Center' },
      ],
    },
  },
  {
    id: '5',
    name: 'Studio Metropolis',
    collection: 'Digital Properties',
    image: '/creative-studio-nft-space-metropolis.jpg',
    price: '0.95',
    priceUSD: '$2,090',
    owner: '0x7890...bcde',
    creator: '0xbcde...f012',
    rarity: 'rare',
    description: 'A vibrant creative space perfect for digital artists and innovators.',
    metadata: {
      properties: [
        { trait: 'Location', value: 'Arts Quarter' },
        { trait: 'Size', value: '4,000 sq ft' },
        { trait: 'Features', value: 'High Speed Internet' },
      ],
    },
  },
  {
    id: '6',
    name: 'Sanctuary Residence',
    collection: 'Digital Properties',
    image: '/peaceful-sanctuary-nft-residence-property.jpg',
    price: '1.6',
    priceUSD: '$3,520',
    owner: '0xcdef...0123',
    creator: '0xf012...3456',
    rarity: 'epic',
    description: 'A tranquil sanctuary offering ultimate privacy and exclusive amenities.',
    metadata: {
      properties: [
        { trait: 'Location', value: 'Secluded Heights' },
        { trait: 'Size', value: '9,000 sq ft' },
        { trait: 'Features', value: 'Private Security' },
      ],
    },
  },
]
