import { z } from "zod";
import data from "../../data/agent/career.json";
/** Public, source-reviewed career claims only. No inference from skills or repository ownership. */
export const careerSource = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    description: z.string().min(1),
    organization: z.string().min(1),
    qualification: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sourceUrl: z.url(),
    language: z.enum(["en", "cs"]),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();
export const career = z
  .object({
    experience: z.array(careerSource),
    education: z.array(careerSource),
  })
  .strict()
  .parse(data);
