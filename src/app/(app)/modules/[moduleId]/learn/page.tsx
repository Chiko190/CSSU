import { notFound } from "next/navigation";
import { getModuleContent } from "@/core/content/loader";
import { LessonCardDeck } from "@/components/lesson/LessonCardDeck";
import { ModuleHeroModel } from "@/components/lesson/ModuleHeroModel";

export default async function LearnPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const content = getModuleContent(moduleId);
  if (!content) notFound();

  return (
    <div className="space-y-5">
      {content.heroModel && <ModuleHeroModel model={content.heroModel} />}
      <LessonCardDeck moduleId={moduleId} cards={content.lessons} />
    </div>
  );
}
