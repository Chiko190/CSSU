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

/** Task 2 quiz gate -- a help-desk shift: two tickets (a dead network connection, then a PC that
 * beeps after a RAM upgrade), worked through with the full troubleshooting cycle: gather info,
 * back up, check physical, isolate, fix, verify, document. Built from the UC4 competency (no job
 * sheet for troubleshooting exists in /modules/uc4), on the same lab network as Task 1. */
export const module4Task2Game = missionGame({
  title: "Help Desk Hero",
  story:
    "You're on help-desk duty. Client-PC can't reach the server, and its user is not happy. Find the fault, fix it the right way, and close the ticket properly.",
  scene: {
    nodes: [
      { id: "client", kind: "pc", label: "Client-PC", sublabel: "no network ⚠", x: 18, y: 13, status: "alert" },
      { id: "switch", kind: "switch", label: "Switch", x: 51, y: 13 },
      { id: "server", kind: "server", label: "SERVER-PC", sublabel: "10.10.0.1", x: 84, y: 13, status: "good" },
      { id: "backup", kind: "backup", label: "\\\\SERVER-PC\\Backup", sublabel: "ready", x: 84, y: 37 },
      { id: "parts", kind: "disk", label: "Client RAM / parts", sublabel: "untested", x: 18, y: 37 },
    ],
    links: [
      { id: "client-switch", from: "client", to: "switch" },
      { id: "switch-server", from: "switch", to: "server" },
      { id: "server-backup", from: "server", to: "backup" },
      { id: "client-parts", from: "client", to: "parts" },
      { id: "client-backup", from: "client", to: "backup", hidden: true, curved: true },
    ],
  },
  missions: [
    {
      id: "m4t2-ticket",
      title: "Open the Ticket",
      briefing: "Before you touch anything, find out what's wrong and protect the user's data.",
      steps: [
        {
          id: "m4t2-first-move",
          kind: "choice",
          actor: "client",
          prompt: "I can't open the server's shared folder! What's your first move?",
          options: [
            { id: "a", text: "Ask what happened, when it started, and what changed recently", correct: true },
            { id: "b", text: "Reinstall Windows right away", why: "That's a last resort. You don't even know what's wrong yet, and it wipes the user's setup." },
            { id: "c", text: "Replace the network card", why: "Don't swap parts on a guess. Gather information first." },
          ],
          explain: "Identify the problem first. The user's answers usually point straight at the cause.",
        },
        {
          id: "m4t2-facts",
          kind: "slots",
          actor: "client",
          prompt: "Fill in the ticket. Which facts actually help you diagnose me?",
          bayLabel: "Ticket details",
          chips: [
            { id: "error", text: "Exact error message", correct: true },
            { id: "when", text: "When it started", correct: true },
            { id: "changed", text: "What changed recently", correct: true },
            { id: "wallpaper", text: "Desktop wallpaper", why: "That has nothing to do with the fault." },
            { id: "password", text: "User's password", why: "Never collect passwords on a ticket. It's a security risk." },
          ],
          explain: "Error, timing, and recent changes narrow the possible causes fast.",
          effects: [{ kind: "badge", node: "client", text: "🎫 Ticket #1042" }],
        },
        {
          id: "m4t2-backup",
          kind: "choice",
          actor: "backup",
          prompt: "You're about to start repairs. What do you do with the user's files?",
          options: [
            { id: "a", text: "Back them up to the server first (like Task 1)", correct: true },
            { id: "b", text: "Nothing, repairs never touch files", why: "Repairs can go wrong. An unprotected drive is a gamble with the user's data." },
            { id: "c", text: "Delete temp files to make room", why: "That's not a backup, and it isn't what this fault needs." },
          ],
          explain: "Back up before you change anything, so a repair that goes wrong can't cost the user their work.",
          effects: [
            { kind: "link", link: "client-backup" },
            { kind: "sublabel", node: "backup", text: "Client-PC files · today" },
          ],
          pulse: { link: "client-backup" },
        },
      ],
    },
    {
      id: "m4t2-physical",
      title: "Check the Physical Layer",
      briefing: "The network icon shows a red X. Start with the simplest checks.",
      steps: [
        {
          id: "m4t2-check-first",
          kind: "choice",
          actor: "client",
          prompt: "My network icon has a red X. What do you check first?",
          timerSec: 15,
          options: [
            { id: "a", text: "The cable and the NIC/switch link lights", correct: true },
            { id: "b", text: "The server's Group Policy settings", why: "A red X means no physical connection at all. Start at the cable." },
            { id: "c", text: "The user's browser history", why: "Browsers don't cause a red X on the network icon." },
          ],
          explain: "No link light, no connection. Physical checks are the quickest and cheapest.",
        },
        {
          id: "m4t2-test-cable",
          kind: "wait",
          actor: "client",
          prompt: "Running the LAN cable tester on my cable…",
          seconds: 5,
          progressText: "Testing pins 1-8",
          trap: {
            text: "✂️ Cut and re-crimp it now, before the test finishes",
            why: "Wait for the result first. Re-crimping a cable that might be fine just wastes time and connectors.",
          },
          explain: "Tester result: pin 3 shows no light. The cable has a broken wire.",
          effects: [{ kind: "sublabel", node: "client", text: "cable fault: pin 3 open" }],
          pulse: { link: "client-switch" },
        },
        {
          id: "m4t2-fix-cable",
          kind: "choice",
          actor: "client",
          prompt: "Pin 3 is open. How do you fix it?",
          options: [
            { id: "a", text: "Replace the cable, or re-terminate it in T568B and test again", correct: true },
            { id: "b", text: "Reinstall the network driver", why: "The tester already showed the cable is broken. A driver can't fix a broken wire." },
            { id: "c", text: "Restart the server", why: "The server is fine. The fault is in this PC's cable." },
          ],
          explain: "Fix the part the test showed is faulty, then retest it.",
          effects: [
            { kind: "status", node: "client", status: "on" },
            { kind: "sublabel", node: "client", text: "link up · 169.254.12.7 ⚠" },
          ],
          pulse: { link: "client-switch" },
        },
      ],
    },
    {
      id: "m4t2-ip",
      title: "IP Detective",
      briefing: "The link is up, but the share still won't open. Time for ipconfig and ping.",
      steps: [
        {
          id: "m4t2-apipa",
          kind: "choice",
          actor: "client",
          prompt: "ipconfig shows 169.254.12.7. What does that tell you?",
          options: [
            { id: "a", text: "I never got an address from the DHCP server", correct: true },
            { id: "b", text: "I have a valid static address", why: "169.254.x.x is never assigned by your network. Windows picks it when DHCP doesn't answer." },
            { id: "c", text: "The internet is down", why: "It's a local DHCP problem, not an internet outage." },
          ],
          explain: "169.254.x.x is an APIPA address, which Windows picks for itself when no DHCP server answers.",
        },
        {
          id: "m4t2-renew",
          kind: "choice",
          actor: "client",
          prompt: "Now that the cable's fixed, how do I get a real address?",
          timerSec: 12,
          options: [
            { id: "a", text: "ipconfig /release, then ipconfig /renew", correct: true },
            { id: "b", text: "ipconfig /flushdns", why: "That clears the DNS cache. It doesn't request an IP address." },
            { id: "c", text: "Type 169.254.12.8 in manually", why: "That's still an APIPA-range address, on the wrong network." },
          ],
          explain: "Renewing asks the DHCP server for a lease again, and this time it can reach it.",
          effects: [{ kind: "sublabel", node: "client", text: "10.10.0.101" }],
          pulse: { link: "switch-server", reverse: true },
        },
        {
          id: "m4t2-loopback",
          kind: "choice",
          actor: "client",
          prompt: "Ping step by step. Which address tests my own network software first?",
          options: [
            { id: "a", text: "127.0.0.1", correct: true },
            { id: "b", text: "10.10.0.1", why: "That's the server. Test this PC's own network software before reaching across the network." },
            { id: "c", text: "8.8.8.8", why: "That's out on the internet, the last thing to test, not the first." },
          ],
          explain: "Loopback first, then your own IP, then the server. The first ping that fails shows where the fault is.",
        },
        {
          id: "m4t2-ping-server",
          kind: "wait",
          actor: "client",
          prompt: "ping 10.10.0.1…",
          seconds: 4,
          progressText: "Reply from 10.10.0.1: time<1ms",
          trap: {
            text: "🔌 Unplug the cable to see if it matters",
            why: "You just fixed that cable. Unplugging it mid-test breaks the connection you're trying to prove.",
          },
          explain: "Replies from the server. The network path works end to end.",
          effects: [
            { kind: "status", node: "client", status: "good" },
            { kind: "link", link: "client-switch" },
          ],
          pulse: { link: "client-switch" },
        },
      ],
    },
    {
      id: "m4t2-hardware",
      title: "Beep Code Panic",
      briefing: "A second ticket: after a RAM upgrade, Client-PC beeps at power-on and shows nothing on screen.",
      steps: [
        {
          id: "m4t2-beeps",
          kind: "choice",
          actor: "parts",
          prompt: "Beeps and no display, right after a RAM upgrade. Most likely cause?",
          options: [
            { id: "a", text: "The new RAM isn't seated properly (or isn't compatible)", correct: true },
            { id: "b", text: "A virus", why: "Viruses can't run before the PC has even passed its power-on test." },
            { id: "c", text: "The monitor's brightness is too low", why: "The beeps come from the POST, which means a hardware fault." },
          ],
          explain: "The last change is the most likely cause, and the POST beeps confirm a hardware fault.",
          effects: [
            { kind: "status", node: "parts", status: "alert" },
            { kind: "sublabel", node: "parts", text: "RAM suspect" },
          ],
        },
        {
          id: "m4t2-safety",
          kind: "slots",
          actor: "parts",
          prompt: "Before you open the case to reseat the RAM, which safety steps do you take?",
          bayLabel: "Safety checklist",
          chips: [
            { id: "off", text: "Power off", correct: true },
            { id: "unplug", text: "Unplug the power cord", correct: true },
            { id: "strap", text: "Wear an anti-static wrist strap", correct: true },
            { id: "running", text: "Keep it running to watch the beeps", why: "Never work inside a powered PC." },
            { id: "carpet", text: "Work on the carpet", why: "Carpet builds up static. Use a grounded, clear workbench." },
          ],
          explain: "OH&S comes first: no power, no static.",
        },
        {
          id: "m4t2-reboot",
          kind: "wait",
          actor: "client",
          prompt: "RAM reseated. Powering on… watching the POST.",
          seconds: 5,
          progressText: "Power-on self-test",
          trap: {
            text: "⏻ Hold the power button to force it off",
            why: "Let the POST finish. Forcing it off hides whether the fix worked.",
          },
          explain: "Single short beep and Windows loads. The RAM is now seated and detected.",
          effects: [
            { kind: "status", node: "parts", status: "good" },
            { kind: "sublabel", node: "parts", text: "RAM OK · detected" },
          ],
          pulse: { link: "client-parts" },
        },
        {
          id: "m4t2-device-manager",
          kind: "choice",
          actor: "client",
          prompt: "Device Manager shows a yellow ⚠ on my audio device. What now?",
          options: [
            { id: "a", text: "Update or reinstall its driver from the manufacturer", correct: true },
            { id: "b", text: "Ignore it, yellow is just a warning", why: "A yellow icon means the device isn't working properly. Fix it before closing the ticket." },
            { id: "c", text: "Remove the RAM again", why: "The RAM is fine now. This is a separate driver problem." },
          ],
          explain: "Yellow means a driver or resource problem. A manufacturer driver usually fixes it.",
        },
      ],
    },
    {
      id: "m4t2-close",
      title: "Close the Ticket",
      briefing: "Both faults are fixed. Finish the job the way a professional does.",
      steps: [
        {
          id: "m4t2-verify",
          kind: "choice",
          actor: "client",
          prompt: "Fixes are in. Before closing the ticket, what do you do?",
          options: [
            { id: "a", text: "Test everything with the user: boot, network, and their shared folder", correct: true },
            { id: "b", text: "Close it now. It worked when you tested it", why: "Always confirm with the user that the original problem is gone." },
            { id: "c", text: "Leave a sticky note saying it's fixed", why: "That's not testing, and it's not documentation." },
          ],
          explain: "Verify full functionality, and get the user to confirm the original complaint is solved.",
          effects: [{ kind: "badge", node: "client", text: "✅ User confirmed" }],
          pulse: { link: "switch-server" },
        },
        {
          id: "m4t2-report",
          kind: "slots",
          actor: "server",
          prompt: "Write the service report. What goes in it?",
          bayLabel: "Service report",
          chips: [
            { id: "problem", text: "Problem reported", correct: true },
            { id: "cause", text: "Cause found", correct: true },
            { id: "fix", text: "Fix applied", correct: true },
            { id: "result", text: "Test results", correct: true },
            { id: "pw", text: "User's password", why: "Never record passwords in a report." },
            { id: "blame", text: "Whose fault it was", why: "Record facts, not blame." },
          ],
          explain: "A clear report speeds up the next repair and proves the work was done.",
          effects: [
            { kind: "badge", node: "client", text: "📝 Ticket closed" },
            { kind: "sublabel", node: "client", text: "10.10.0.101 · all good" },
          ],
        },
      ],
    },
  ],
});
