import { AlbionItem, ItemCategory } from '../types';

interface ItemBase {
  baseId: string;
  name: string;
  category: ItemCategory;
  availableTiers: number[];
}

const ITEM_BASES: ItemBase[] = [
  // Melee - Swords
  { baseId: 'MAIN_SWORD', name: 'Broadsword', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CLAYMORE', name: 'Claymore', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_DUALSWORD', name: 'Dual Swords', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_SCIMITAR_MORGANA', name: 'Clarent Blade', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CLEAVER_HELL', name: 'Carving Sword', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_DUALSCYTHE_HELL', name: 'Galatine Pair', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CLAYMORE_AVALON', name: 'Kingmaker', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },

  // Melee - Axes
  { baseId: 'MAIN_AXE', name: 'Battleaxe', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_AXE', name: 'Greataxe', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_HALBERD', name: 'Halberd', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_SCYTHE_HELL', name: 'Infernal Scythe', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_AXE_AVALON', name: 'Realmbreaker', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },

  // Melee - Daggers
  { baseId: 'MAIN_DAGGER', name: '1H Dagger', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_DAGGERPAIR', name: 'Dagger Pair', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CLAWPAIR', name: 'Claws', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_RAPIER_MORGANA', name: 'Bloodletter', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_DUALSICKLE_UNDEAD', name: 'Deathgivers', category: 'weapons_melee', availableTiers: [4, 5, 6, 7, 8] },

  // Ranged - Bows & Crossbows
  { baseId: '2H_BOW', name: 'Bow', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_WARBOW', name: 'Warbow', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_LONGBOW', name: 'Longbow', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_BOW_AVALON', name: 'Bow of Badon', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CROSSBOW', name: 'Crossbow', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_1HCROSSBOW', name: 'Light Crossbow', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_REPEATINGCROSSBOW_UNDEAD', name: 'Boltcasters', category: 'weapons_ranged', availableTiers: [4, 5, 6, 7, 8] },

  // Magic - Fire, Holy, Nature, Cursed, Frost
  { baseId: 'MAIN_FIRESTAFF', name: 'Fire Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_FIRESTAFF', name: 'Great Fire Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_FIRESTAFF_KEEPER', name: 'Wildfire Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_HOLYSTAFF', name: 'Holy Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_HOLYSTAFF', name: 'Great Holy Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_HOLYSTAFF_HELL', name: 'Fallen Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_NATURESTAFF', name: 'Nature Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_NATURESTAFF', name: 'Great Nature Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_NATURESTAFF_KEEPER', name: 'Blight Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_CURSEDSTAFF', name: 'Cursed Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CURSEDSTAFF', name: 'Great Cursed Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_CURSEDSTAFF_MORGANA', name: 'Shadowcaller', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'MAIN_FROSTSTAFF', name: 'Frost Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_FROSTSTAFF', name: 'Great Frost Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_ICEGAUNTLETS_HELL', name: 'Permafrost Prism', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_SHAPESHIFTER_SET1', name: 'Prowling Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: '2H_SHAPESHIFTER_SET2', name: 'Rootbound Staff', category: 'weapons_magic', availableTiers: [4, 5, 6, 7, 8] },

  // Armor - Cloth
  { baseId: 'ARMOR_CLOTH_SET1', name: 'Scholar Robe', category: 'armor_cloth', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_CLOTH_SET2', name: 'Cleric Robe', category: 'armor_cloth', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_CLOTH_SET3', name: 'Mage Robe', category: 'armor_cloth', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_CLOTH_ROYAL', name: 'Royal Robe', category: 'armor_cloth', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'HEAD_CLOTH_SET2', name: 'Cleric Cowl', category: 'armor_cloth', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'SHOES_CLOTH_SET1', name: 'Scholar Sandals', category: 'armor_cloth', availableTiers: [4, 5, 6, 7, 8] },

  // Armor - Leather
  { baseId: 'ARMOR_LEATHER_SET1', name: 'Mercenary Jacket', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_LEATHER_SET2', name: 'Hunter Jacket', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_LEATHER_SET3', name: 'Assassin Jacket', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_LEATHER_MORGANA', name: 'Stalker Jacket', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_LEATHER_HELL', name: 'Hellion Jacket', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_LEATHER_FEY', name: 'Mistwalker Jacket', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'HEAD_LEATHER_SET2', name: 'Hunter Hood', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'HEAD_LEATHER_SET3', name: 'Assassin Hood', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'SHOES_LEATHER_SET3', name: 'Assassin Shoes', category: 'armor_leather', availableTiers: [4, 5, 6, 7, 8] },

  // Armor - Plate
  { baseId: 'ARMOR_PLATE_SET1', name: 'Soldier Armor', category: 'armor_plate', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_PLATE_SET2', name: 'Knight Armor', category: 'armor_plate', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_PLATE_SET3', name: 'Guardian Armor', category: 'armor_plate', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'ARMOR_PLATE_KEEPER', name: 'Judicator Armor', category: 'armor_plate', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'HEAD_PLATE_SET1', name: 'Soldier Helmet', category: 'armor_plate', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'SHOES_PLATE_SET1', name: 'Soldier Boots', category: 'armor_plate', availableTiers: [4, 5, 6, 7, 8] },

  // Bags & Capes
  { baseId: 'BAG', name: 'Bag', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPE', name: 'Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPEITEM_FW_FORTSTERLING', name: 'Fort Sterling Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPEITEM_FW_THETFORD', name: 'Thetford Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPEITEM_FW_LYMHURST', name: 'Lymhurst Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPEITEM_FW_BRIDGEWATCH', name: 'Bridgewatch Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPEITEM_FW_MARTLOCK', name: 'Martlock Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
  { baseId: 'CAPEITEM_FW_CAERLEON', name: 'Caerleon Cape', category: 'bags_capes', availableTiers: [4, 5, 6, 7, 8] },
];

/**
 * Generates the full expanded list of Albion items including all tiers and enchantments (.0, .1, .2, .3)
 */
export function generateCatalog(): AlbionItem[] {
  const catalog: AlbionItem[] = [];

  for (const item of ITEM_BASES) {
    for (const tier of item.availableTiers) {
      for (let ench = 0; ench <= 3; ench++) {
        const idWithoutEnch = `T${tier}_${item.baseId}`;
        const rawId = ench > 0 ? `${idWithoutEnch}@${ench}` : idWithoutEnch;
        
        let formattedName = `T${tier}.${ench} ${item.name}`;
        if (ench === 0) formattedName = `T${tier} ${item.name}`;

        catalog.push({
          id: idWithoutEnch,
          rawId,
          name: formattedName,
          tier,
          enchantment: ench,
          category: item.category,
        });
      }
    }
  }

  return catalog;
}

export const ALBION_CATALOG = generateCatalog();
