import { z } from "zod";

export const dataTableSchema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

export type DataTableRow = z.infer<typeof dataTableSchema>;
