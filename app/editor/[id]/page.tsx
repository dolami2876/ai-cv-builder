import TemplateSelector from "@/components/editor/TemplateSelector";
import ResumePreview from "@/components/preview/ResumePreview";
import EditorHeader from "@/components/editor/EditorHeader";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="min-h-screen w-full bg-gray-100 overflow-y-auto">
            <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col items-center gap-6">
                <EditorHeader resumeId={id} />
                <TemplateSelector />
                <div className="w-full flex justify-center">
                    <div className="shadow-2xl bg-white">
                        <ResumePreview />
                    </div>
                </div>
            </div>
        </div>
    );
}
