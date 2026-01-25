import { create } from 'zustand';

// Tái sử dụng interface từ models/Resume.ts (hoặc định nghĩa lại nếu cần tách biệt logic frontend)
export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
}

export interface Experience {
    id: string; // Dùng ID tạm thời cho frontend key
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
}

export interface ResumeState {
    // Data
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];

    // AI Context (Onboarding)
    targetDomain: string;
    experienceLevel: string;

    // Persistence State
    isSaving: boolean;
    isError: boolean;

    // Actions
    setPersonalInfo: (info: Partial<PersonalInfo>) => void;
    setSummary: (summary: string) => void;

    // Experience Actions
    setExperience: (experience: Experience[]) => void;
    addExperience: () => void;
    updateExperience: (index: number, field: keyof Experience, value: string) => void;
    removeExperience: (index: number) => void;

    // Education Actions
    setEducation: (education: Education[]) => void;
    addEducation: () => void;
    updateEducation: (index: number, field: keyof Education, value: string) => void;
    removeEducation: (index: number) => void;

    // Skills Actions
    setSkills: (skills: string[]) => void;

    // Onboarding Actions
    setTargetDomain: (domain: string) => void;
    setExperienceLevel: (level: string) => void;

    // Advanced
    jobDescription: string;
    setJobDescription: (jd: string) => void;

    // Visual State
    style: {
        hexColor: string;
        font: string;
        layout: string;
    };
    setStyle: (style: Partial<ResumeState["style"]>) => void;

    // Persistence Actions
    fetchResume: (id: string) => Promise<void>;
    saveResume: (id: string) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
    // Initial State
    personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        portfolio: ""
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    targetDomain: "",
    experienceLevel: "",
    jobDescription: "",

    style: {
        hexColor: "#000000",
        font: "inter",
        layout: "modern",
    },

    isSaving: false,
    isError: false,

    // Persistence Actions
    fetchResume: async (id) => {
        try {
            const res = await fetch(`/api/resumes/${id}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            set({
                personalInfo: data.personalInfo || {},
                summary: data.summary || "",
                experience: data.experience.map((e: any) => ({ ...e, id: e._id || crypto.randomUUID() })) || [],
                education: data.education.map((e: any) => ({ ...e, id: e._id || crypto.randomUUID() })) || [],
                skills: data.skills || [],
                targetDomain: data.targetDomain || "",
                experienceLevel: data.experienceLevel || "",
                style: data.style || { hexColor: "#000000", font: "inter", layout: "modern" },
            });
        } catch (error) {
            console.error(error);
            set({ isError: true });
        }
    },

    saveResume: async (id) => {
        set({ isSaving: true, isError: false });
        try {
            const state = get();
            const payload = {
                personalInfo: state.personalInfo,
                summary: state.summary,
                experience: state.experience,
                education: state.education,
                skills: state.skills,
                targetDomain: state.targetDomain,
                experienceLevel: state.experienceLevel,
                style: state.style,
            };

            const res = await fetch(`/api/resumes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to save");

        } catch (error) {
            console.error(error);
            set({ isError: true });
        } finally {
            set({ isSaving: false });
        }
    },

    setStyle: (newStyle) => set((state) => ({
        style: { ...state.style, ...newStyle }
    })),

    // Actions implementation
    setPersonalInfo: (info) => set((state) => ({
        personalInfo: { ...state.personalInfo, ...info }
    })),

    setSummary: (summary) => set({ summary }),

    setExperience: (experience) => set({ experience }),

    addExperience: () => set((state) => ({
        experience: [
            ...state.experience,
            {
                id: crypto.randomUUID(),
                company: "",
                role: "",
                startDate: "",
                endDate: "",
                description: ""
            }
        ]
    })),

    updateExperience: (index, field, value) => set((state) => {
        const newExp = [...state.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        return { experience: newExp };
    }),

    removeExperience: (index) => set((state) => ({
        experience: state.experience.filter((_, i) => i !== index)
    })),

    setEducation: (education) => set({ education }),

    addEducation: () => set((state) => ({
        education: [
            ...state.education,
            {
                id: crypto.randomUUID(),
                school: "",
                degree: "",
                startDate: "",
                endDate: ""
            }
        ]
    })),

    updateEducation: (index, field, value) => set((state) => {
        const newEdu = [...state.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        return { education: newEdu };
    }),

    removeEducation: (index) => set((state) => ({
        education: state.education.filter((_, i) => i !== index)
    })),

    setSkills: (skills) => set({ skills }),

    setTargetDomain: (targetDomain) => set({ targetDomain }),

    setExperienceLevel: (experienceLevel) => set({ experienceLevel }),

    setJobDescription: (jobDescription) => set({ jobDescription }),
}));
