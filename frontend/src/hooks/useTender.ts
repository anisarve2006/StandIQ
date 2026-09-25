import { useMutation } from '@tanstack/react-query';
import { tenderApi } from '../services/tenderApi';
import type { 
  TenderAnalyzeRequest, 
  TenderHealthRequest, 
  TenderDiffRequest,
  SpecificationGenerateRequest,
  ExportRequest
} from '../types/api';

export const useTenderAnalysis = () => {
  return useMutation({
    mutationFn: (data: TenderAnalyzeRequest) => tenderApi.analyze(data),
  });
};

export const useTenderHealth = () => {
  return useMutation({
    mutationFn: (data: TenderHealthRequest) => tenderApi.health(data),
  });
};

export const useTenderDiff = () => {
  return useMutation({
    mutationFn: (data: TenderDiffRequest) => tenderApi.diff(data),
  });
};

export const useGenerateSpecification = () => {
  return useMutation({
    mutationFn: (data: SpecificationGenerateRequest) => tenderApi.generateSpecification(data),
  });
};

export const useExportSession = () => {
  return useMutation({
    mutationFn: (data: ExportRequest) => tenderApi.exportSession(data),
  });
};
