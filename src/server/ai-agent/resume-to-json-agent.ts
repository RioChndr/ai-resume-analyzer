/**
 * [
  {
    "name": "Rio Chandra",
    "phone_number": "+62-822-3047-5617",
    "email": "me.riochndr@gmail.com",
    "skills": [
      "Kepemimpinan",
      "Manajemen Proyek",
      "Komunikasi",
      "Pengembangan Website Fullstack",
      "Manajemen Database",
      "Python",
      "TypeScript",
      "Golang",
      "Rust",
      "Dokumentasi",
      "Review Kode",
      "Koordinasi Tim",
      "Arsitektur Sistem",
      "Pengelolaan Technical Debt",
      "Implementasi CI/CD",
      "Pengujian Otomatis",
      "Mentoring & Pembinaan Tim"
    ],
    "experiences": [
      {
        "company": "PT. Kereta Api Indonesia (Persero)",
        "year": "2024 - Now",
        "description": "Memimpin perjalanan proyek dan berkomunikasi dengan berbagai unit PT. Kereta Api Indonesia\n• Menginisiasi migrasi pipeline CI/CD ke github actions, mempercepat siklus deployment sebesar 60%.\n• Optimalisasi waktu respon sistem sebesar ~99,68%, dari 1 menit menjadi 250 milidetik.\n• Membuat laporan progress mingguan sebagai dokumentasi dan pelaporan rutin kepada project owner"
      },
      {
        "company": "Startup Ezclass.io",
        "year": "2024 - August 2024",
        "description": "Mempercepat delivery pekerjaan sebesar 40% dengan mengoordinasi roadmap dan dokumentasi strategis.\n• Berhasil mendokumentasikan 20 fitur proyek legacy menjadi dokumentasi terstruktur dan mudah dipahami.\n• Memangkas 40% technical debt dengan optimalisasi workflow, perbaikan dokumentasi, dan penerapan proses testing berkala."
      },
      {
        "company": "PT. Sahaware Teknologi Indonesia",
        "year": "2020 - January 2023",
        "description": "Berhasil mengembangkan proyek sistem operasi apoteker selama 18 bulan yang kini digunakan oleh puluhan apoteker secara aktif.\n• Berkomunikasi dengan berbagai stakeholder seperti Project Owner, Business Development dan Manager untuk memahami permasalahan serta kebutuhan bisnis.\n• Mempimpin tim lintas fungsi berjumlah 4 Software Engineer, 1 UI/UX Designer, dan 3 Quality Assurance\n• Melakukan code review, perbaikan maintenance dan menjaga kecepatan delivery proyek secar konsisten."
      }
    ],
    "education": [
      {
        "institution": "Universitas Terbuka, Indonesia",
        "degree": "Sarjana, Sistem Informasi",
        "year": "June 2024 – June 2026"
      },
      {
        "institution": "Politeknik Negeri Bengkalis, Indonesia",
        "degree": "Diploma (D3), Teknik Informatika",
        "year": "March 2017 – August 2019"
      }
    ]
  }
]
 * @param resumeFile 
 * @returns 
 */

import z from "zod";

const schemaResumeAIParsed = z.object({
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

export async function ResumeToJsonAgent(resumeFile: Blob): Promise<ResumeAIParsedType> {
  const aiAgentWebhook = 'http://localhost:5678/webhook/resume-pdf-extractor';
  const formData = new FormData();
  formData.append('data', resumeFile, 'resume.pdf');

  try {
    const response = await fetch(aiAgentWebhook, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    let data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("No data returned from AI agent");
    }
    if (Array.isArray(data)) {
      data = data[0];
      data = schemaResumeAIParsed.parse(data);
    }
    return data
  } catch (error) {
    console.error("Error sending resume to AI agent:", error);
    throw new Error("Failed to send resume to AI agent");
  }
}