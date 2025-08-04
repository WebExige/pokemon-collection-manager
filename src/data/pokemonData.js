/**
 * Données Pokémon TCG statiques
 * Base de données locale pour mode hors ligne complet
 * Compatible avec toutes les restrictions d'hébergement
 */

// Sets populaires récents
export const pokemonSets = [
  {
    id: 'sv4pt5',
    name: 'Paldean Fates',
    series: 'Scarlet & Violet',
    releaseDate: '2024-01-26',
    total: 244,
    ptcgoCode: 'PAF',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  },
  {
    id: 'sv04',
    name: 'Paradox Rift',
    series: 'Scarlet & Violet',
    releaseDate: '2023-11-03',
    total: 266,
    ptcgoCode: 'PAR',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  },
  {
    id: 'sv03',
    name: 'Obsidian Flames',
    series: 'Scarlet & Violet',
    releaseDate: '2023-08-11',
    total: 230,
    ptcgoCode: 'OBF',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  },
  {
    id: 'sv02',
    name: 'Paldea Evolved',
    series: 'Scarlet & Violet',
    releaseDate: '2023-06-09',
    total: 279,
    ptcgoCode: 'PAL',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  },
  {
    id: 'sv01',
    name: 'Scarlet & Violet',
    series: 'Scarlet & Violet',
    releaseDate: '2023-03-31',
    total: 198,
    ptcgoCode: 'SVI',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  },
  {
    id: 'swsh12',
    name: 'Silver Tempest',
    series: 'Sword & Shield',
    releaseDate: '2022-11-11',
    total: 245,
    ptcgoCode: 'SIT',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  },
  {
    id: 'swsh11',
    name: 'Lost Origin',
    series: 'Sword & Shield',
    releaseDate: '2022-09-09',
    total: 247,
    ptcgoCode: 'LOR',
    images: {
      logo: '/assets/sets/placeholder.svg',
      symbol: '/assets/sets/placeholder.svg'
    }
  }
];

// Cartes populaires pour chaque set
export const pokemonCards = {
  'sv4pt5': [
    {
      id: 'sv4pt5-1',
      name: 'Charmander',
      number: '1',
      rarity: 'Common',
      types: ['Fire'],
      hp: '70',
      set: pokemonSets[0],
          images: {
      small: 'https://images.pokemontcg.io/sv4pt5/1.png',
      large: 'https://images.pokemontcg.io/sv4pt5/1_hires.png'
    },
      market: { averageSellPrice: 0.25 }
    },
    {
      id: 'sv4pt5-25',
      name: 'Pikachu',
      number: '25',
      rarity: 'Common',
      types: ['Lightning'],
      hp: '60',
      set: pokemonSets[0],
      images: {
        small: 'https://images.pokemontcg.io/base1/58.png',
        large: 'https://images.pokemontcg.io/base1/58_hires.png'
      },
      market: { averageSellPrice: 1.50 }
    },
    {
      id: 'sv4pt5-107',
      name: 'Charizard ex',
      number: '107',
      rarity: 'Rare Holo ex',
      types: ['Fire'],
      hp: '330',
      set: pokemonSets[0],
      images: {
        small: 'https://images.pokemontcg.io/base1/4.png',
        large: 'https://images.pokemontcg.io/base1/4_hires.png'
      },
      market: { averageSellPrice: 45.00 }
    },
    {
      id: 'sv4pt5-128',
      name: 'Mew ex',
      number: '128',
      rarity: 'Rare Holo ex',
      types: ['Psychic'],
      hp: '270',
      set: pokemonSets[0],
      images: {
        small: 'https://images.pokemontcg.io/neo1/8.png',
        large: 'https://images.pokemontcg.io/neo1/8_hires.png'
      },
      market: { averageSellPrice: 35.00 }
    }
  ],
  'sv04': [
    {
      id: 'sv04-25',
      name: 'Pikachu',
      number: '25',
      rarity: 'Common',
      types: ['Lightning'],
      hp: '60',
      set: pokemonSets[1],
      images: {
        small: 'https://images.pokemontcg.io/swsh4/48.png',
        large: 'https://images.pokemontcg.io/swsh4/48_hires.png'
      },
      market: { averageSellPrice: 1.25 }
    },
    {
      id: 'sv04-162',
      name: 'Iron Valiant ex',
      number: '162',
      rarity: 'Rare Holo ex',
      types: ['Psychic', 'Fighting'],
      hp: '220',
      set: pokemonSets[1],
      images: {
        small: 'https://images.pokemontcg.io/base1/10.png',
        large: 'https://images.pokemontcg.io/base1/10_hires.png'
      },
      market: { averageSellPrice: 25.00 }
    }
  ],
  'sv03': [
    {
      id: 'sv03-25',
      name: 'Pikachu',
      number: '25',
      rarity: 'Common',
      types: ['Lightning'],
      hp: '60',
      set: pokemonSets[2],
      images: {
        small: 'https://images.pokemontcg.io/xy12/25.png',
        large: 'https://images.pokemontcg.io/xy12/25_hires.png'
      },
      market: { averageSellPrice: 1.00 }
    },
    {
      id: 'sv03-175',
      name: 'Charizard ex',
      number: '175',
      rarity: 'Rare Holo ex',
      types: ['Fire', 'Dark'],
      hp: '330',
      set: pokemonSets[2],
      images: {
        small: 'https://images.pokemontcg.io/xy12/108.png',
        large: 'https://images.pokemontcg.io/xy12/108_hires.png'
      },
      market: { averageSellPrice: 55.00 }
    }
  ]
};

// Types et raretés pour les filtres
export const pokemonTypes = [
  'Colorless', 'Fire', 'Water', 'Lightning', 'Grass', 'Psychic', 
  'Fighting', 'Dark', 'Metal', 'Dragon', 'Fairy'
];

export const pokemonRarities = [
  'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo ex', 
  'Rare Holo V', 'Rare Holo VMAX', 'Rare Holo VSTAR'
];

// Fonction utilitaire pour obtenir toutes les cartes
export const getAllCards = () => {
  return Object.values(pokemonCards).flat();
};

// Fonction de recherche locale
export const searchCards = (query, filters = {}) => {
  let cards = getAllCards();
  
  // Filtrage par nom
  if (query) {
    cards = cards.filter(card => 
      card.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // Filtrage par type
  if (filters.type) {
    cards = cards.filter(card => 
      card.types.includes(filters.type)
    );
  }
  
  // Filtrage par rareté
  if (filters.rarity) {
    cards = cards.filter(card => 
      card.rarity === filters.rarity
    );
  }
  
  // Filtrage par set
  if (filters.set) {
    cards = cards.filter(card => 
      card.set.id === filters.set
    );
  }
  
  return cards;
};

// Fonction pour obtenir les suggestions de recherche
export const getSuggestions = (query) => {
  const cards = getAllCards();
  const suggestions = new Set();
  
  cards.forEach(card => {
    if (card.name.toLowerCase().includes(query.toLowerCase())) {
      suggestions.add(card.name);
    }
  });
  
  return Array.from(suggestions).slice(0, 10);
};

// Mode hors ligne complet
export const offlineMode = {
  enabled: true,
  lastUpdate: '2024-01-15',
  totalCards: getAllCards().length,
  totalSets: pokemonSets.length
};