import { resumeFormSchema as resumeSchema } from "~/app/resume/resumeFormSchema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type z from "zod";

type Resume = z.infer<typeof resumeSchema>;

export const resumeRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const resume = await ctx.db.resume.findFirst({
      where: { userId: ctx.session.user.id },
    });
    if (!resume) return null;
    // Ensure response matches resumeSchema shape
    return {
      name: resume.name ?? "",
      email: resume.email ?? "",
      phone: resume.phone ?? "",
      location: resume.location ?? "",
      skills: Array.isArray(resume.skills) ? resume.skills.join(", ") : "",
      experience: resume.experience ?? [],
    } as Resume;
  }),

  put: protectedProcedure
    .input(resumeSchema)
    .mutation(async ({ ctx, input }) => {
      // Prisma expects skills as string[], experience as Json
      const skillsArr = input.skills.split(",").map(s => s.trim()).filter(Boolean);

      // Try to find existing resume
      const existing = await ctx.db.resume.findFirst({
        where: { userId: ctx.session.user.id },
      });

      let updated;
      if (existing) {
        updated = await ctx.db.resume.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            skills: skillsArr,
            location: input.location,
            experience: input.experience,
            updatedAt: new Date(),
          },
        });
      } else {
        updated = await ctx.db.resume.create({
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            skills: skillsArr,
            location: input.location,
            experience: input.experience,
            userId: ctx.session.user.id,
          },
        });
      }
      return updated;
    }),
});