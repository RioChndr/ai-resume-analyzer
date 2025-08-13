import { z } from "zod";

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  year: z.string().min(1, "Year is required"),
  description: z.string().min(1, "Description is required"),
});

export const resumeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().min(1, "Location is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(experienceSchema).min(1, "At least one experience is required"),
});
