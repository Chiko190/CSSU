import type { QuizQuestion } from "../types";

export const module4Quiz: QuizQuestion[] = [
  {
    id: "q1-why-backup",
    type: "multiple_choice",
    prompt: "Why is a backup kept in a separate location from the original data?",
    options: [
      { id: "a", text: "So a problem affecting the original doesn't also destroy the backup" },
      { id: "b", text: "It has no real benefit" },
      { id: "c", text: "To make the original file load faster" },
      { id: "d", text: "Backups must always be on the same drive as the original" },
    ],
    correctOptionIds: ["a"],
    explanation: "If a backup lived on the same failing drive as the original, it would offer no real protection.",
  },
  {
    id: "q2-network-backup",
    type: "true_false",
    prompt: "Backing up to a server over the network protects against a total failure of the client PC's own drive.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["true"],
    explanation: "Since the backup lives on a separate machine, a client PC's local drive failing doesn't take the backup down with it.",
  },
  {
    id: "q3-verify-restore",
    type: "multiple_choice",
    prompt: "How do you confirm a restore actually worked?",
    options: [
      { id: "a", text: "Check that the files reappeared in their original location" },
      { id: "b", text: "Assume it worked because the tool didn't show an error" },
      { id: "c", text: "Restart the computer" },
      { id: "d", text: "Delete the backup immediately afterward" },
    ],
    correctOptionIds: ["a"],
    explanation: "A restore isn't verified until you've actually checked the original location for the recovered files.",
  },
  {
    id: "q4-untested-backup",
    type: "true_false",
    prompt: "A backup you've never test-restored can still be fully trusted to work when you actually need it.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["false"],
    explanation: "An untested backup might be corrupted or incomplete -- you don't really know it works until you've restored from it successfully.",
  },
];
