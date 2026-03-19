import { PredictionResult } from '@/utils/predict';

export type RootStackParamList = {
  Scan: undefined;
  Result: { prediction: PredictionResult; collectionId?: string; imageUrl: string;  };
};
