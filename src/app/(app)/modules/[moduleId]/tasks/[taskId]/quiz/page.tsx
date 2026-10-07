import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getTask, getTaskChecklistItems, isTaskUnlockedForProgress } from "@/core/content/tasks";
import { getTaskQuiz, getPracticalCheck, stripQuizAnswers } from "@/core/content/loader";
import { getHearts } from "@/core/progress/hearts";
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
  // ...and the task itself has to be unlocked -- typing a later task's quiz URL directly used to
  // skip every task (and game) before it.
  if (!isTaskUnlockedForProgress(moduleId, taskId, progress)) redirect(`/modules/${moduleId}`);

  const hearts = await getHearts(user.uid);
  const taskProgress = progress ? getTaskQuizProgress(progress, taskId) : null;

  const nextTaskId = getNextTaskId(moduleId, taskId);
  const continueHref = nextTaskId ? `/modules/${moduleId}/tasks/${nextTaskId}` : `/modules/${moduleId}/complete`;

  // Most tasks have no practical check at all -- practicalCheck is null and practicalDone is
  // vacuously true, so TaskQuizGate just renders the quiz as before.
  const practicalCheck = getPracticalCheck(moduleId, taskId);
  const initialPracticalCheckedIds = progress?.practicalCheckedIds?.[taskId] ?? [];
  const practicalCheckedSet = new Set(initialPracticalCheckedIds);
  const practicalDone = !practicalCheck || practicalCheck.items.every((item) => practicalCheckedSet.has(item.id));

  return (
    <TaskQuizGate
      moduleId={moduleId}
      taskId={taskId}
      practicalCheck={practicalCheck}
      initialPracticalCheckedIds={initialPracticalCheckedIds}
      practicalDone={practicalDone}
      quizRunnerProps={{
        questions: stripQuizAnswers(quiz),
        initialHearts: hearts,
        initialAnsweredIds: taskProgress?.currentAttempt?.answeredIds ?? [],
        continueHref,
      }}
    />
  );
}
