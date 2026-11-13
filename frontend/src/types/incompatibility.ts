export interface IncompatibilityRule {
  id: number;
  assetAId: number;
  assetAName: string;
  assetACategoryId: number;
  assetACategoryName: string;
  assetASpriteUrl: string;
  assetBId: number;
  assetBName: string;
  assetBCategoryId: number;
  assetBCategoryName: string;
  assetBSpriteUrl: string;
  reason: string;
  createdAt: string;
}

export interface IncompatibilityRuleFormData {
  assetAId: number;
  assetBId: number;
  reason: string;
}

export interface ConflictDetail {
  ruleId: number;
  assetAId: number;
  assetAName: string;
  assetBId: number;
  assetBName: string;
  message: string;
}

export interface CompatibilityCheckResponse {
  compatible: boolean;
  conflicts: ConflictDetail[];
}
