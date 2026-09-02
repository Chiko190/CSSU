import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTask, getTaskChecklistItems } from "@/core/content/tasks";
import { getTaskQuiz, getPracticalCheck, stripQuizAnswers } from "@/core/content/loader";
import { getHearts } from "@/core/progress/hearts";
import { getHintBalance } from "@/core/progress/hints";
import { getTotalXp } from "@/core/progress/xp";
import { getTaskQuizProgress, getNextTaskId } from "@/core/progress/quizAttempt";
import { TaskQuizGate } from "@/components/quiz/TaskQuizGate";

export default async function TaskQuizPage({
  params,
}: {
  params: Promise<{ moduleId: string; taskId: string }>;
}) {
  const { moduleId, taskId } = await params;
  const task = getTask(moduleId, taskId);
  if (!task) notFound();
  const quiz = getTaskQuiz(moduleId, taskId);
  if (!quiz) notFound();

  const user = await getServerSession();
  if (!user) return null; // the module layout already redirects unauthenticated visitors

  const store = getDataStore();
  const progress = await store.getModuleProgress(user.uid, moduleId);
  const checkedIds = new Set(progress?.activityCheckedIds ?? []);
  const items = getTaskChecklistItems(moduleId, task);
  const taskDone = items.length > 0 && task.itemIds.every((id) => checkedIds.has(id));

  // Server-side enforcement: can't be bypassed by typing the URL directly -- this task's own
  // checklist has to be finished before its quiz is available.
  if (!taskDone) redirect(`/modules/${moduleId}/tasks/${taskId}`);

  const [hearts, hintBalance, totalXp] = await Promise.all([
    getHearts(user.uid),
    getHintBalance(user.uid),
    getTotalXp(user.uid),
  ]);
  const taskProgress = progress ? getTaskQuizProgress(progress, taskId) : null;

  const nextTaskId = getNextTaskId(moduleId, taskId);
  const continueHref = nextTaskId ? `/modules/${moduleId}/tasks/${nextTaskId}` : `/modules/${moduleId}/complete`;

  // Most tasks have no practical check at all -- practicalItems is null and practicalDone is
  // vacuously true, so TaskQuizGate just renders the quiz as before.
  const practicalItems = getPracticalCheck(moduleId, taskId);
  const initialPracticalCheckedIds = progress?.practicalCheckedIds?.[taskId] ?? [];
  const practicalCheckedSet = new Set(initialPracticalCheckedIds);
  const practicalDone = !practicalItems || practicalItems.every((item) => practicalCheckedSet.has(item.id));

  return (
    <TaskQuizGate
      moduleId={moduleId}
      taskId={taskId}
      practicalItems={practicalItems}
      initialPracticalCheckedIds={initialPracticalCheckedIds}
      practicalDone={practicalDone}
      quizRunnerProps={{
        questions: stripQuizAnswers(quiz),
        initialHearts: hearts,
        initialHintBalance: hintBalance,
        initialTotalXp: totalXp,
        initialHintUsedThisAttempt: taskProgress?.hintUsedThisAttempt ?? false,
        initialAnsweredIds: taskProgress?.currentAttempt?.answeredIds ?? [],
        continueHref,
      }}
    />
  );
}
