export type ProcurementStatus = "DRAFT" | "ANALYZING" | "IN_REVIEW" | "ATTENTION" | "READY" | "COMPLETED";

export interface ProcurementRecord {
  id: string;
  name: string;
  category: string;
  status: ProcurementStatus;
  findingCount: number;
  standardCount: number;
  updatedAt: string;
}
