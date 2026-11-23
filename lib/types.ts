export type Modality = 'scRNA-seq' | 'microscopy' | 'proteomics' | 'clinical-notes';
export type DatasetRecord = {
  id: string; name: string; modality: Modality; samples: number;
  missingRate: number; duplicateRate: number; batches: number; positiveShare: number;
  intendedUse: string; license: string; consentScope: string;
};
export type Scores = {
  quality: number; coverage: number; bias: number; readiness: number;
  reasons: string[];
};
export type Decision = 'training-ready' | 'needs-changes' | 'rejected';
export type ReviewEvent = { datasetId: string; decision: Decision; note: string; at: string };
