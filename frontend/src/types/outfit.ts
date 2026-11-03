export interface OutfitSlotDto {
  assetId: number;
  zIndex?: number;
}

export interface OutfitManifestDto {
  name: string;
  skinColor: string;
  slots: Record<string, OutfitSlotDto>;
}

export interface OutfitResponseDto {
  id: number;
  userId: number;
  name: string;
  skinColor: string;
  manifest: OutfitManifestDto;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentValidationResultDto {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
