import PersonalInfoForm from "@/components/editor/PersonalInfoForm";
import ExperienceForm from "@/components/editor/ExperienceForm";
import EducationForm from "@/components/editor/EducationForm";
import SkillsForm from "@/components/editor/SkillsForm";
import ActivitiesForm from "@/components/editor/ActivitiesForm";
import CertificatesForm from "@/components/editor/CertificatesForm";
import AwardsForm from "@/components/editor/AwardsForm";
import ReferencesForm from "@/components/editor/ReferencesForm";
import InterestsForm from "@/components/editor/InterestsForm";

import ResumePreview from "@/components/preview/ResumePreview";
import EditorHeader from "@/components/editor/EditorHeader";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
            {/* Left Side: Editor Forms */}
            <div className="w-1/2 h-full overflow-y-auto border-r border-gray-200 bg-white scrollbar-thin scrollbar-thumb-gray-300">
                <EditorHeader resumeId={id} />
                <div className="mx-auto max-w-2xl space-y-8 p-6 pb-20">
                    <PersonalInfoForm />
                    <hr className="border-gray-100" />
                    <ExperienceForm />
                    <hr className="border-gray-100" />
                    <EducationForm />
                    <hr className="border-gray-100" />
                    <SkillsForm />
                    <hr className="border-gray-100" />
                    <ActivitiesForm />
                    <hr className="border-gray-100" />
                    <CertificatesForm />
                    <hr className="border-gray-100" />
                    <AwardsForm />
                    <hr className="border-gray-100" />
                    <ReferencesForm />
                    <hr className="border-gray-100" />
                    <InterestsForm />
                </div>
            </div>

            {/* Right Side: Live Preview */}
            <div className="flex w-1/2 h-full items-start justify-center overflow-y-auto bg-gray-100 p-8 scrollbar-thin scrollbar-thumb-gray-300">
                <div className="scale-[0.8] origin-top md:scale-[0.65] lg:scale-[0.85] xl:scale-90 shadow-2xl">
                    <ResumePreview />
                </div>
            </div>
        </div>
    );
}
