import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getModuleContent, getActivityRequiredIds, stripQuizAnswers } from "@/core/content/loader";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export default async function CheckPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const content = getModuleContent(moduleId);
  if (!content) notFound();

  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const progress = await store.getModuleProgress(user.uid, moduleId);
  const checkedIds = new Set(progress?.activityCheckedIds ?? []);
  const requiredIds = getActivityRequiredIds(content.activity);
  const activityDone = requiredIds.length > 0 && requiredIds.every((id) => checkedIds.has(id));

  // Server-side enforcement: can't be bypassed by typing the URL directly -- the quiz is the
  // knowledge check for what the tasks just walked through hands-on, not a standalone page.
  if (!activityDone) redirect(`/modules/${moduleId}`);

  return <QuizRunner moduleId={moduleId} questions={stripQuizAnswers(content.quiz)} />;
}
