export type AssetStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: number;
  code: string;
  name: string;
  zIndexDefault: number;
  defaultAssetId?: number | null;
  defaultAssetName?: string | null;
  defaultAssetSpriteUrl?: string | null;
  isRequired: boolean;
}

export interface Asset {
  id: number;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  name: string;
  spriteUrl: string;
  thumbnailUrl: string;
  zIndex: number;
  tags: string[];
  status: AssetStatus;
  isDefault: boolean;
  supportsTint: boolean;
  obtainable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetFormData {
  name: string;
  categoryId: number;
  zIndex: number;
  tags: string[];
  supportsTint: boolean;
  isDefault: boolean;
  file?: File;
  status?: AssetStatus;
  obtainable?: boolean;
}

export interface CatalogAsset {
  id: number;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  name: string;
  spriteUrl: string;
  thumbnailUrl: string;
  zIndex: number;
  tags: string[];
  isDefault: boolean;
  supportsTint: boolean;
  isEquipable: boolean;
  acquisitionType: 'DEFAULT' | 'UNLOCKED' | 'LOCKED';
}


