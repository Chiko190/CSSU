import type { QuizQuestion } from "../types";

// Sourced from Task Sheet 4.2-2 "Performing Back Up and Restore" (see /modules/uc4), plus its
// guide's walkthrough of Windows' Backup and Restore control panel. One task, one 15-question
// quiz, keyed by taskId.

const task1Quiz: QuizQuestion[] = [
  {
    id: "m4t1-q1",
    type: "multiple_choice",
    prompt: "Why does this task have you create a brand-new folder before doing anything else?",
    options: [
      { id: "a", text: "It gives you known test data to back up, delete, and then prove you can restore" },
      { id: "b", text: "It's required to unlock the Backup and Restore tool" },
      { id: "c", text: "It formats the local disk" },
      { id: "d", text: "It has no real purpose in the exercise" },
    ],
    correctOptionIds: ["a"],
    explanation: "The test folder is the whole point of the exercise: create it, back it up, delete it, then prove the restore brings it back.",
  },
  {
    id: "m4t1-q2",
    type: "multiple_choice",
    prompt: "What tool does Task Sheet 4.2-2 have you use to perform the backup and restore?",
    options: [
      { id: "a", text: "Windows' built-in Backup and Restore tool" },
      { id: "b", text: "A third-party cloud sync app" },
      { id: "c", text: "The Disk Defragmenter" },
      { id: "d", text: "Rufus" },
    ],
    correctOptionIds: ["a"],
    explanation: "The task sheet has the learner \"Run Back-Up and Restore,\" Windows' built-in tool for creating and restoring backups.",
  },
  {
    id: "m4t1-q3",
    type: "multiple_choice",
    prompt: "Where does the task sheet have you send the backup?",
    options: [
      { id: "a", text: "A network location -- the Server-PC" },
      { id: "b", text: "The same local folder being backed up" },
      { id: "c", text: "A USB drive that's never mentioned again" },
      { id: "d", text: "Nowhere -- backups stay in memory only" },
    ],
    correctOptionIds: ["a"],
    explanation: "\"Perform Back up on Network and Select the Server-PC\" is the task sheet's explicit step.",
  },
  {
    id: "m4t1-q4",
    type: "true_false",
    prompt: "Backing up to a separate machine (like a server) instead of only locally means a local hard drive failure doesn't also destroy the backup.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["true"],
    explanation: "A backup stored on the same failing drive as the original data protects against nothing -- storing it elsewhere is the whole point.",
  },
  {
    id: "m4t1-q5",
    type: "multiple_choice",
    prompt: "After the backup completes, what does the task sheet have you do to the original folder?",
    options: [
      { id: "a", text: "Delete it, to simulate real data loss" },
      { id: "b", text: "Rename it" },
      { id: "c", text: "Encrypt it" },
      { id: "d", text: "Leave it untouched" },
    ],
    correctOptionIds: ["a"],
    explanation: "\"When completed, delete the folder you had created in Step 2\" -- this is what makes the later restore a meaningful test.",
  },
  {
    id: "m4t1-q6",
    type: "multiple_choice",
    prompt: "How does the task sheet have you begin the restore process?",
    options: [
      { id: "a", text: "Click Restore Files from the Backup and Restore window" },
      { id: "b", text: "Reinstall the operating system" },
      { id: "c", text: "Reformat the local disk" },
      { id: "d", text: "Recreate the folder manually by hand" },
    ],
    correctOptionIds: ["a"],
    explanation: "The task sheet's step is: \"Click Restore File from Back-Up and Restore window.\"",
  },
  {
    id: "m4t1-q7",
    type: "multiple_choice",
    prompt: "Before Windows can restore anything, what does the task sheet have you choose?",
    options: [
      { id: "a", text: "The specific backup file you created earlier in the exercise" },
      { id: "b", text: "A brand-new empty backup" },
      { id: "c", text: "The system's Recycle Bin" },
      { id: "d", text: "Nothing needs to be selected" },
    ],
    correctOptionIds: ["a"],
    explanation: "\"Select the back-up filed you had created in Step 4\" points the restore at the correct backup to recover from.",
  },
  {
    id: "m4t1-q8",
    type: "multiple_choice",
    prompt: "Where does the task sheet have you restore the files to?",
    options: [
      { id: "a", text: "Their original location" },
      { id: "b", text: "A brand-new folder with a different name" },
      { id: "c", text: "The Server-PC's desktop" },
      { id: "d", text: "It doesn't matter where they land" },
    ],
    correctOptionIds: ["a"],
    explanation: "\"Restore the File to the original location\" puts the recovered data back exactly where it was before deletion.",
  },
  {
    id: "m4t1-q9",
    type: "multiple_choice",
    prompt: "What's the final required step of this task, after the restore finishes?",
    options: [
      { id: "a", text: "Check the original file location on the local disk to confirm the files are actually back" },
      { id: "b", text: "Delete the backup file immediately" },
      { id: "c", text: "Shut the computer down without checking anything" },
      { id: "d", text: "Nothing further is required" },
    ],
    correctOptionIds: ["a"],
    explanation: "\"Check if the file is restored by visiting the original file location\" is the required final verification step.",
  },
  {
    id: "m4t1-q10",
    type: "true_false",
    prompt: "A restore should be considered confirmed working the moment the tool reports \"Restore completed,\" without checking the files themselves.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["false"],
    explanation: "A restore isn't confirmed working until you've actually verified the files reappeared where they should be.",
  },
  {
    id: "m4t1-q11",
    type: "multiple_choice",
    prompt: "The well-known \"3-2-1\" backup rule of thumb recommends keeping how many total copies of important data?",
    options: [
      { id: "a", text: "3 copies, on 2 different types of media, with 1 copy stored offsite" },
      { id: "b", text: "1 copy is always enough" },
      { id: "c", text: "2 copies, both on the same drive" },
      { id: "d", text: "3 copies, all on the same external drive" },
    ],
    correctOptionIds: ["a"],
    explanation: "3-2-1 is a widely used backup guideline: 3 total copies, on 2 different media types, with at least 1 kept offsite from the original.",
  },
  {
    id: "m4t1-q12",
    type: "multiple_choice",
    prompt: "What's the practical difference between a full backup and an incremental backup?",
    options: [
      { id: "a", text: "A full backup copies everything each time; an incremental backup only copies what changed since the last backup" },
      { id: "b", text: "They're two names for the exact same process" },
      { id: "c", text: "An incremental backup only works on network drives" },
      { id: "d", text: "A full backup can never be restored" },
    ],
    correctOptionIds: ["a"],
    explanation: "Incremental backups save time and space by only capturing changes since the previous backup, unlike a full backup that copies everything again.",
  },
  {
    id: "m4t1-q13",
    type: "multiple_choice",
    prompt: "Besides accidental deletion (as simulated in this task), what's another realistic scenario a backup protects against?",
    options: [
      { id: "a", text: "Hardware failure, like a hard drive dying" },
      { id: "b", text: "The computer being turned on" },
      { id: "c", text: "A software update completing successfully" },
      { id: "d", text: "Nothing else -- deletion is the only risk backups address" },
    ],
    correctOptionIds: ["a"],
    explanation: "Backups guard against many forms of data loss -- accidental deletion, drive failure, malware, and more -- not just one specific scenario.",
  },
  {
    id: "m4t1-q14",
    type: "multiple_choice",
    prompt: "For the network backup step to succeed, what does the Server-PC need to be, relative to the client?",
    options: [
      { id: "a", text: "Reachable over the network, with a shared location the client can write the backup to" },
      { id: "b", text: "Physically connected by the same cable as the monitor" },
      { id: "c", text: "Running the exact same OS version" },
      { id: "d", text: "Nothing special is required from the server" },
    ],
    correctOptionIds: ["a"],
    explanation: "Backing up \"on network\" to the Server-PC requires that machine to be reachable and have a location available to receive the backup.",
  },
  {
    id: "m4t1-q15",
    type: "image_identification",
    prompt: "This screenshot shows the tool used in this task. What is it?",
    imageUrl: "/modules/module-4/images/run-backup-tool.webp",
    options: [
      { id: "a", text: "Windows' Backup and Restore (Windows 7) control panel" },
      { id: "b", text: "The BIOS setup screen" },
      { id: "c", text: "Rufus's bootable-drive creator" },
      { id: "d", text: "Device Manager" },
    ],
    correctOptionIds: ["a"],
    explanation: "This is the Backup and Restore (Windows 7) control panel this task sheet uses to create and later restore the backup.",
  },
];

export const module4TaskQuizzes: Record<string, QuizQuestion[]> = {
  "task-1": task1Quiz,
};
