import { missionGame } from "../missionGame";

// Sourced from Task Sheet 4.2-2 "Performing Back Up and Restore" and the UC4 guide (see
// /modules/uc4): create a folder on Local Disk D:, Control Panel > System and Security > Backup and
// Restore, back up to a network location on the Server-PC, delete the folder, restore it to its
// original location, and verify. Like UC3 this is software work, so the quiz gate is a mission game
// on a live network map (see MissionGameCheck in ../types).

/** Task 1 quiz gate -- back up, survive the "disaster", and rescue the data. */
export const module4Task1Game = missionGame({
  title: "Data Rescue",
  story:
    "Client-PC's files have no safety net. Ship a backup to the Server-PC, then survive a simulated disaster and bring every file home.",
  scene: {
    nodes: [
      { id: "client", kind: "pc", label: "Client-PC", sublabel: "10.10.0.101", x: 18, y: 13 },
      { id: "disk", kind: "disk", label: "Local Disk (D:)", x: 9, y: 37 },
      { id: "folder", kind: "folder", label: "D:\\MyFiles", sublabel: "doesn't exist yet", x: 31, y: 37, status: "off" },
      { id: "switch", kind: "switch", label: "Switch", x: 51, y: 13 },
      { id: "server", kind: "server", label: "SERVER-PC", sublabel: "10.10.0.1", x: 84, y: 13 },
      { id: "backup", kind: "backup", label: "\\\\SERVER-PC\\Backup", sublabel: "empty", x: 84, y: 37, status: "off" },
    ],
    links: [
      { id: "client-disk", from: "client", to: "disk" },
      { id: "disk-folder", from: "disk", to: "folder" },
      { id: "client-switch", from: "client", to: "switch" },
      { id: "switch-server", from: "switch", to: "server" },
      { id: "server-backup", from: "server", to: "backup" },
      { id: "folder-backup", from: "folder", to: "backup", hidden: true, curved: true },
    ],
  },
  missions: [
    {
      id: "m4t1-payload",
      title: "Create the Payload",
      briefing: "Every rescue drill needs something to rescue. Make a test folder on Local Disk D:.",
      steps: [
        {
          id: "m4t1-new-folder",
          kind: "choice",
          actor: "disk",
          prompt: "This PC > Local Disk (D:) > right-click > …?",
          options: [
            { id: "a", text: "New > Folder", correct: true },
            { id: "b", text: "Format…", why: "Format erases the WHOLE drive!" },
            { id: "c", text: "Properties", why: "That only shows the drive's details." },
          ],
          explain: "Name it and put a file or two inside so you can tell it came back.",
          effects: [
            { kind: "status", node: "folder", status: "on" },
            { kind: "sublabel", node: "folder", text: "3 files" },
          ],
          pulse: { link: "disk-folder" },
        },
      ],
    },
    {
      id: "m4t1-find-tool",
      title: "Find the Tool",
      briefing: "Navigate Control Panel to the backup tool. Wrong turns cost hearts!",
      steps: [
        {
          id: "m4t1-category",
          kind: "choice",
          actor: "client",
          prompt: "Control Panel: which category?",
          timerSec: 12,
          options: [
            { id: "a", text: "Network and Internet", why: "That's for network settings, not backups." },
            { id: "b", text: "System and Security", correct: true },
            { id: "c", text: "Programs", why: "Programs is for installing and removing apps." },
            { id: "d", text: "Appearance and Personalization", why: "Wallpapers won't save your files." },
          ],
          explain: "Backup lives under System and Security.",
        },
        {
          id: "m4t1-tool",
          kind: "choice",
          actor: "client",
          prompt: "System and Security: which tool?",
          timerSec: 12,
          options: [
            { id: "a", text: "Backup and Restore (Windows 7)", correct: true },
            { id: "b", text: "Windows Defender Firewall", why: "The firewall blocks traffic -- it doesn't back anything up." },
            { id: "c", text: "Security and Maintenance", why: "That shows alerts, not backups." },
          ],
          explain: "The tool the job sheet runs: Backup and Restore.",
          effects: [{ kind: "badge", node: "client", text: "🛟 Backup and Restore" }],
        },
      ],
    },
    {
      id: "m4t1-ship",
      title: "Ship It Safe",
      briefing: "Pick a backup destination that survives if this PC dies -- then hold your nerve while it copies.",
      steps: [
        {
          id: "m4t1-destination",
          kind: "choice",
          actor: "client",
          prompt: "Set up backup: where do I save it?",
          options: [
            { id: "a", text: "Local Disk (D:)", why: "Same disk as your files -- if it dies, the backup dies with it." },
            { id: "b", text: "Local Disk (C:)", why: "Still inside this PC -- the job sheet backs up to the Server-PC." },
            { id: "c", text: "Save on a network… \\\\SERVER-PC\\Backup", correct: true },
          ],
          explain: "A network location on another machine keeps the copy safe from this PC's failures.",
          effects: [{ kind: "link", link: "folder-backup" }],
        },
        {
          id: "m4t1-backing-up",
          kind: "wait",
          actor: "client",
          prompt: "Backing up MyFiles to the server…",
          seconds: 6,
          progressText: "Copying files to \\\\SERVER-PC\\Backup",
          trap: { text: "🗑 Delete MyFiles now to save time", why: "Never delete before the backup finishes -- the data would be gone for good." },
          explain: "Only when it reports complete is the copy safe.",
          effects: [
            { kind: "status", node: "backup", status: "good" },
            { kind: "sublabel", node: "backup", text: "MyFiles · today" },
          ],
          pulse: { link: "folder-backup" },
        },
      ],
    },
    {
      id: "m4t1-disaster",
      title: "Disaster Strikes",
      briefing: "Time to simulate data loss -- carefully. Destroy only what the job sheet says.",
      steps: [
        {
          id: "m4t1-delete",
          kind: "choice",
          actor: "folder",
          prompt: "Backup complete. Simulate the data loss by…?",
          options: [
            { id: "a", text: "Deleting the backup on the server", why: "Then there'd be nothing left to restore!" },
            { id: "b", text: "Formatting Local Disk (D:)", why: "Far too destructive -- the drill only needs the test folder gone." },
            { id: "c", text: "Deleting the folder you created", correct: true },
          ],
          explain: "💥 MyFiles is gone from D:. Good thing there's a backup…",
          effects: [
            { kind: "status", node: "folder", status: "gone" },
            { kind: "sublabel", node: "folder", text: "DELETED" },
            { kind: "status", node: "client", status: "alert" },
          ],
        },
      ],
    },
    {
      id: "m4t1-rescue",
      title: "Rescue Run",
      briefing: "Bring MyFiles home: the right tool, the right backup, the right place -- then prove it.",
      steps: [
        {
          id: "m4t1-restore-button",
          kind: "choice",
          actor: "client",
          prompt: "Backup and Restore: which button?",
          options: [
            { id: "a", text: "Back up now", why: "That would back up the disk WITHOUT your folder." },
            { id: "b", text: "Restore my files", correct: true },
            { id: "c", text: "Change settings", why: "That only edits the backup schedule." },
          ],
          explain: "Starts the restore wizard.",
        },
        {
          id: "m4t1-pick-backup",
          kind: "choice",
          actor: "backup",
          prompt: "Which backup has your folder?",
          timerSec: 15,
          options: [
            { id: "a", text: "Today -- \\\\SERVER-PC\\Backup", correct: true },
            { id: "b", text: "Last year -- old USB drive", why: "Outdated, and it never had MyFiles." },
            { id: "c", text: "Today -- Local Disk (D:)", why: "You never saved a backup there." },
          ],
          explain: "The backup you made in Ship It Safe.",
        },
        {
          id: "m4t1-location",
          kind: "choice",
          actor: "client",
          prompt: "Where should the files go?",
          options: [
            { id: "a", text: "In the following location: Desktop", why: "The job sheet restores to the original location." },
            { id: "b", text: "In the original location", correct: true },
          ],
          explain: "Puts MyFiles back exactly where it was on D:.",
        },
        {
          id: "m4t1-restoring",
          kind: "wait",
          actor: "client",
          prompt: "Restoring MyFiles…",
          seconds: 5,
          progressText: "Copying files back to D:\\MyFiles",
          trap: { text: "🔄 Restart the PC to speed it up", why: "Restarting mid-restore can leave the files half-copied." },
          explain: "Restore complete -- but don't take the wizard's word for it.",
          effects: [
            { kind: "status", node: "folder", status: "good" },
            { kind: "sublabel", node: "folder", text: "restored ✓" },
            { kind: "status", node: "client", status: "good" },
          ],
          pulse: { link: "folder-backup", reverse: true },
        },
        {
          id: "m4t1-verify",
          kind: "choice",
          actor: "folder",
          prompt: "How do you prove I'm really back?",
          options: [
            { id: "a", text: "Trust the \"restore complete\" message", why: "Always check with your own eyes." },
            { id: "b", text: "Open D:\\ and check MyFiles is there with its files", correct: true },
            { id: "c", text: "Check the server still has the backup", why: "That proves the backup exists, not that the restore worked." },
          ],
          explain: "🎉 Files verified in their original location. Data rescued!",
          effects: [{ kind: "badge", node: "folder", text: "✅ Verified" }],
        },
      ],
    },
  ],
});
