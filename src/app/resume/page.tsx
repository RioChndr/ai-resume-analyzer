"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFieldArray, useForm } from "react-hook-form";
import { FaPlusCircle as PlusIcon, FaTrash as TrashIcon } from "react-icons/fa";
import { toast } from 'sonner';
import { api } from "~/trpc/react";
import { resumeFormSchema } from "./resumeFormSchema";
import { useEffect } from "react";

type Experience = {
  company: string;
  year: string;
  description: string;
};

type ResumeFormValues = {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string;
  experience: Experience[];
};

export default function ResumeFormPage() {
  const mutation = api.resume.put.useMutation()
  const { data: userData, isPending: isLoadingFetch } = api.resume.get.useQuery();
  console.log("User Data:", userData);

  // Initialize form with user data or empty defaults

  const form = useForm<ResumeFormValues>({
    resolver: async (values) => {
      const result = resumeFormSchema.safeParse(values);
      return {
        values: result.success ? result.data : {},
        errors: result.success
          ? {}
          : Object.fromEntries(
            Object.entries(result.error.flatten().fieldErrors).map(([key, value]) => [
              key,
              { type: "manual", message: Array.isArray(value) ? value[0] : value },
            ])
          ),
      };
    },
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      skills: "",
      experience: [{ company: "", year: "", description: "" }],
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset(userData);
    }
  }, [userData])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });


  const onSubmit = async (data: ResumeFormValues) => {
    try {
      await mutation.mutateAsync(data);
      toast('Resume submitted successfully!');
    } catch (err: any) {
      toast('Failed to submit resume: ' + (err.message || 'Unknown error'));
    }
  };

  if (isLoadingFetch) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Resume Form</h1>
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            rules={{ required: "Phone is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            rules={{ required: "Location is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skills"
            rules={{ required: "Skills are required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="e.g. TypeScript, React, Node.js" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Experience</FormLabel>
            <div className="space-y-4 mt-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="border rounded p-4 relative bg-muted">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`experience.${idx}.company`}
                      rules={{ required: "Company is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${idx}.year`}
                      rules={{ required: "Year is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 2022" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`experience.${idx}.description`}
                      rules={{ required: "Description is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Describe your role" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => remove(idx)}
                      aria-label="Remove experience"
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ company: "", year: "", description: "" })}
                className="flex items-center gap-2"
              >
                <PlusIcon /> Add Experience
              </Button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-6"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Submit Resume"}
          </Button>
          {mutation.isError && (
            <div className="text-red-500 mt-2 text-sm">
              {mutation.error?.message || "Failed to submit resume."}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
