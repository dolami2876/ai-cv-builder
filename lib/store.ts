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

export interface Activity {
    id: string;
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Certificate {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

export interface Award {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description: string;
}

export interface Reference {
    id: string;
    name: string;
    role: string;
    company: string;
    phone: string;
    email: string;
}

export interface ResumeState {
    // Data
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    // New Sections
    activities: Activity[];
    certificates: Certificate[];
    awards: Award[];
    references: Reference[];
    languages: string[];
    interests: string[];

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

    // Expanded Actions
    setActivities: (activities: Activity[]) => void;
    addActivity: () => void;
    updateActivity: (index: number, field: keyof Activity, value: string) => void;
    removeActivity: (index: number) => void;

    setCertificates: (certificates: Certificate[]) => void;
    addCertificate: () => void;
    updateCertificate: (index: number, field: keyof Certificate, value: string) => void;
    removeCertificate: (index: number) => void;

    setAwards: (awards: Award[]) => void;
    addAward: () => void;
    updateAward: (index: number, field: keyof Award, value: string) => void;
    removeAward: (index: number) => void;

    setReferences: (references: Reference[]) => void;
    addReference: () => void;
    updateReference: (index: number, field: keyof Reference, value: string) => void;
    removeReference: (index: number) => void;

    setLanguages: (languages: string[]) => void;
    setInterests: (interests: string[]) => void;

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
    // New Initial State
    activities: [],
    certificates: [],
    awards: [],
    references: [],
    languages: [],
    interests: [],

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
                // Map new sections
                activities: data.activities?.map((e: any) => ({ ...e, id: e._id || crypto.randomUUID() })) || [],
                certificates: data.certificates?.map((e: any) => ({ ...e, id: e._id || crypto.randomUUID() })) || [],
                awards: data.awards?.map((e: any) => ({ ...e, id: e._id || crypto.randomUUID() })) || [],
                references: data.references?.map((e: any) => ({ ...e, id: e._id || crypto.randomUUID() })) || [],
                languages: data.languages || [],
                interests: data.interests || [],

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
                // Payload new sections
                activities: state.activities,
                certificates: state.certificates,
                awards: state.awards,
                references: state.references,
                languages: state.languages,
                interests: state.interests,

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

    // Expanded Sections Actions
    setActivities: (activities: Activity[]) => set({ activities }),
    addActivity: () => set((state) => ({
        activities: [...state.activities, { id: crypto.randomUUID(), organization: "", role: "", startDate: "", endDate: "", description: "" }]
    })),
    updateActivity: (index, field, value) => set((state) => {
        const newItems = [...state.activities];
        newItems[index] = { ...newItems[index], [field]: value };
        return { activities: newItems };
    }),
    removeActivity: (index) => set((state) => ({ activities: state.activities.filter((_, i) => i !== index) })),

    setCertificates: (certificates: Certificate[]) => set({ certificates }),
    addCertificate: () => set((state) => ({
        certificates: [...state.certificates, { id: crypto.randomUUID(), name: "", issuer: "", date: "" }]
    })),
    updateCertificate: (index, field, value) => set((state) => {
        const newItems = [...state.certificates];
        newItems[index] = { ...newItems[index], [field]: value };
        return { certificates: newItems };
    }),
    removeCertificate: (index) => set((state) => ({ certificates: state.certificates.filter((_, i) => i !== index) })),

    setAwards: (awards: Award[]) => set({ awards }),
    addAward: () => set((state) => ({
        awards: [...state.awards, { id: crypto.randomUUID(), title: "", issuer: "", date: "", description: "" }]
    })),
    updateAward: (index, field, value) => set((state) => {
        const newItems = [...state.awards];
        newItems[index] = { ...newItems[index], [field]: value };
        return { awards: newItems };
    }),
    removeAward: (index) => set((state) => ({ awards: state.awards.filter((_, i) => i !== index) })),

    setReferences: (references: Reference[]) => set({ references }),
    addReference: () => set((state) => ({
        references: [...state.references, { id: crypto.randomUUID(), name: "", role: "", company: "", phone: "", email: "" }]
    })),
    updateReference: (index, field, value) => set((state) => {
        const newItems = [...state.references];
        newItems[index] = { ...newItems[index], [field]: value };
        return { references: newItems };
    }),
    removeReference: (index) => set((state) => ({ references: state.references.filter((_, i) => i !== index) })),

    setLanguages: (languages: string[]) => set({ languages }),
    setInterests: (interests: string[]) => set({ interests }),

    setTargetDomain: (targetDomain) => set({ targetDomain }),

    setExperienceLevel: (experienceLevel) => set({ experienceLevel }),

    setJobDescription: (jobDescription) => set({ jobDescription }),
}));
