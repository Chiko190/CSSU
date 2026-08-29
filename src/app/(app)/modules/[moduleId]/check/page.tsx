import { notFound } from "next/navigation";
import { getModuleContent, stripQuizAnswers } from "@/core/content/loader";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export default async function CheckPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const content = getModuleContent(moduleId);
  if (!content) notFound();

  return <QuizRunner moduleId={moduleId} questions={stripQuizAnswers(content.quiz)} />;
}
