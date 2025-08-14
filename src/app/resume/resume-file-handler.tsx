import React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { api } from "~/trpc/react";


export const schemaResumeAIParsed = z.object({
  name: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  skills: z.array(z.string()).nullable().optional(),
  experiences: z.array(z.object({
    company: z.string().nullable().optional(),
    year: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })).nullable().optional(),
  education: z.array(z.object({
    institution: z.string().nullable().optional(),
    degree: z.string().nullable().optional(),
    year: z.string().nullable().optional(),
  })).nullable().optional(),
});

type ResumeAIParsedType = z.infer<typeof schemaResumeAIParsed>;

type Props = {
  className?: string;
  onChooseResume?: (resumeParsed: ResumeAIParsedType) => void;
}

export default function ResumeFileHandler({ className, onChooseResume }: Props) {
  const resumeUploadRef = React.useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const mutationReanalyze = api.resumeFile.reanalyze.useMutation();
  const mutationAdd = api.resumeFile.add.useMutation();
  const mutationPresignedUrlUpload = api.resumeFile.presignedUrlUpload.useMutation();
  const mutationDelete = api.resumeFile.delete.useMutation();
  const listFile = api.resumeFile.get.useQuery();

  const processUpload = async (file: File) => {
    setIsLoading(true);
    const presignedUrl = await mutationPresignedUrlUpload.mutateAsync({
      fileName: file.name,
      fileType: file.type,
    });

    if (!presignedUrl.uploadUrl) {
      toast("Failed to get upload URL.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(presignedUrl.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      await mutationAdd.mutateAsync({
        fileKey: presignedUrl.fileKey,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });


      await listFile.refetch();

      toast("File uploaded successfully.");
      toast("We will notify you once your resume is processed.");
    } catch (error) {
      console.error("Upload error:", error);
      toast("Failed to upload file.");
      return;
    } finally {
      setIsLoading(false);
    }
  }

  // File validation and toast logic
  const handleFile = async (file?: File) => {
    console.log(file)
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("File size exceeds 5MB.");
      return;
    }

    await processUpload(file);
    toast("Resume uploaded successfully.");
  };

  // Drag event handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  if (listFile.isPending) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className={className}>
      {
        (listFile.data && listFile.data.length > 0) && (
          <div className={className}>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Uploaded Resumes</h3>
              <ul className="space-y-2 w-full">
                {listFile.data.map((resume) => (
                  <li key={resume.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <div className=''>
                      <div className="truncate">{resume.fileName}</div>
                      {!resume.parsedData && (
                        <Button
                          type='button'
                          variant="outline"
                          className="gradient-ai text-white animate-gradient-x hover:from-purple-500 hover:via-pink-500 hover:to-red-500 hover:text-white"
                          size='sm'
                          disabled={mutationReanalyze.isPending}
                          onClick={async () => {
                            try {
                              await mutationReanalyze.mutateAsync({ idResumeFile: resume.id });
                              await listFile.refetch();
                            } catch (error) {
                              console.error("Error reanalyzing resume:", error);
                              toast.error("Failed to reanalyze resume.");
                            }
                          }}>
                          {mutationReanalyze.isPending ? "Reanalyzing..." : "Reanalyze Resume"}
                        </Button>
                      )}

                      {resume.parsedData && (
                        <Button
                          size='sm'
                          variant="outline"
                          className='gradient-ai text-white animate-gradient-x hover:from-purple-500 hover:via-pink-500 hover:to-red-500 hover:text-white'
                          onClick={() => {
                            if (onChooseResume) {
                              onChooseResume(resume.parsedData as ResumeAIParsedType);
                            }
                            toast("Resume selected.");
                          }}>
                          AI Summary — Use this Resume
                        </Button>
                      )}
                    </div>
                    <Button
                      type='button'
                      variant="destructive"
                      size='sm'
                      onClick={async () => {
                        try {
                          if (!confirm("Are you sure you want to delete this resume?")) return;
                          await mutationDelete.mutateAsync({ idResumeFile: resume.id });
                          await listFile.refetch();
                          toast("Resume deleted.");
                        } catch (err) {
                          toast.error("Failed to delete resume.");
                        }
                      }}
                      disabled={mutationDelete.isPending && mutationDelete.variables?.idResumeFile === resume.id}
                    >
                      {mutationDelete.isPending && mutationDelete.variables?.idResumeFile === resume.id ? "Deleting..." : "Delete"}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }
      {
        isLoading ? (
          <div className="text-center text-gray-500">Uploading...</div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition ${isDragging ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
            onClick={() => resumeUploadRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Upload resume"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="text-gray-500 mb-2">Drag & drop your resume here, or click to select file</span>
            <span className="text-xs text-gray-400">(PDF only, max 5MB)</span>
            <input
              ref={resumeUploadRef}
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                await handleFile(file);
              }}
            />
          </div>
        )
      }
    </div>
  )
}