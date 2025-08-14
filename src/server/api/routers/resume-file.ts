import { resumeFormSchema as resumeSchema } from "~/app/resume/resumeFormSchema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import z from "zod";
import { deleteFile, getBlobFile, getFileUrl, uploadFile, uploadPresignedUrl } from '@/server/storage/s3'
import { FileKey } from "lucide-react";
import { ResumeToJsonAgent } from "~/server/ai-agent/resume-to-json-agent";

async function analyzeResumeFile(resumeFileId: number, ctx: any) {
  const resumeFile = await ctx.db.resumeFile.findFirst({
    where: { id: resumeFileId, userId: ctx.session.user.id },
  });
  if (!resumeFile) return null;

  const blobFile = await getBlobFile(resumeFile.fileUrl);
  const parsedData = await ResumeToJsonAgent(blobFile);
  if (parsedData) {
    await ctx.db.resumeFile.update({
      where: { id: resumeFile.id },
      data: {
        parsedData: parsedData,
      }
    });
  }
  return parsedData;
}

export const resumeFileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const resumeFile = await ctx.db.resumeFile.findMany({
      where: { userId: ctx.session.user.id },
    });
    if (!resumeFile) return null;
    return resumeFile;
  }),

  getPresignedUrl: protectedProcedure
    .input(z.object({ idResumeFile: z.number() }))
    .query(async ({ ctx, input }) => {
      const { idResumeFile } = input;
      const resumeFile = await ctx.db.resumeFile.findFirst({
        where: { id: idResumeFile, userId: ctx.session.user.id },
      });
      if (!resumeFile) return null;
      const presignedUrl = getFileUrl(resumeFile.fileUrl);
      return {
        presignedUrl,
        fileName: resumeFile.fileName,
      };
    }),

  presignedUrlUpload: protectedProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileType } = input;
      const userId = ctx.session.user.id;
      const res = await uploadPresignedUrl(fileName, fileType, userId);
      return {
        uploadUrl: res.uploadUrl,
        fileKey: res.key,
        fileName: fileName,
        fileType: fileType,
        userId: userId,
      }
    }),


  add: protectedProcedure
    .input(z.object({
      fileKey: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      fileType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("Adding resume file", input);
      const { user } = ctx.session;
      const resumeFile = await ctx.db.resumeFile.create({
        data: {
          userId: user.id,
          fileName: input.fileName,
          fileUrl: input.fileKey,
          fileSize: input.fileSize,
          fileType: input.fileType,
        }
      })

      try {
        await analyzeResumeFile(resumeFile.id, ctx);
      } catch (error) {
        console.error("Error analyzing resume file:", error);
      }

      return resumeFile
    }),
  reanalyze: protectedProcedure
    .input(z.object({ idResumeFile: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { idResumeFile } = input;
      const parsedData = await analyzeResumeFile(idResumeFile, ctx);
      if (!parsedData) {
        throw new Error("Failed to analyze resume file");
      }
      return parsedData;
    }),

  delete: protectedProcedure
    .input(z.object({ idResumeFile: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { idResumeFile } = input;
      const resumeFile = await ctx.db.resumeFile.findFirst({
        where: { id: idResumeFile, userId: ctx.session.user.id },
      });
      if (!resumeFile) return null;

      await deleteFile(resumeFile.fileName);

      await ctx.db.resumeFile.delete({
        where: { id: idResumeFile },
      });

      return { success: true };
    }),
});