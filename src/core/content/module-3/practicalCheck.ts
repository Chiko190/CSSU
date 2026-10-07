import { missionGame } from "../missionGame";
import type { SceneLink, SceneNode } from "../types";

// Sourced from Job Sheet 3.1-2 "Setting-Up User Access", Job Sheet 3.2-2 "Configuring Network
// Services", and the UC3 Guide (see /modules/uc3) -- including its concrete values: the css.org
// root domain, the 10.10.0 reverse lookup network ID, the "Redirection" OU and GPO, and the
// "UserFiles" share. UC3 is server configuration with no physical parts, so each task's quiz is
// gated by a mission game played on a live network map (see MissionGameCheck in ../types) rather
// than a 3D scene.

const SERVER_IP = "10.10.0.1";
const CLIENT1_IP = "10.10.0.101";
const CLIENT2_IP = "10.10.0.102";

const LAB_NODES: SceneNode[] = [
  { id: "server", kind: "server", label: "SERVER", sublabel: "IP: dynamic ⚠", x: 16, y: 14 },
  { id: "switch", kind: "switch", label: "Switch", x: 50, y: 14 },
  { id: "client1", kind: "pc", label: "Client-PC 1", sublabel: "no IP", x: 84, y: 12, status: "off" },
  { id: "client2", kind: "pc", label: "Client-PC 2", sublabel: "no IP", x: 84, y: 37, status: "off" },
  { id: "userfiles", kind: "folder", label: "D:\\UserFiles", sublabel: "not shared", x: 40, y: 37, status: "off" },
];

const LAB_LINKS: SceneLink[] = [
  { id: "server-switch", from: "server", to: "switch" },
  { id: "switch-client1", from: "switch", to: "client1" },
  { id: "switch-client2", from: "switch", to: "client2" },
  { id: "server-userfiles", from: "server", to: "userfiles" },
];

/** Task 1 quiz gate -- build the css.org domain from a bare server to a working folder redirect. */
export const module3Task1Game = missionGame({
  title: "Operation css.org",
  story:
    "A new office just got a server and two PCs -- and no network brain. Bring the server online, crown it the domain controller, and get every user's files saving to the server.",
  scene: { nodes: LAB_NODES, links: LAB_LINKS },
  missions: [
    {
      id: "m3t1-wake-server",
      title: "Wake the Server",
      briefing: "Lock down the server's address, then slot in the four roles every domain needs.",
      steps: [
        {
          id: "m3t1-static-ip",
          kind: "choice",
          actor: "server",
          prompt: "My IP keeps changing! Clients will lose me. What should my address be?",
          options: [
            { id: "a", text: `Static: ${SERVER_IP}`, correct: true },
            { id: "b", text: "Obtain an IP address automatically", why: "The server IS the DHCP server -- its address must never change." },
            { id: "c", text: "Static: 192.168.1.1", why: "That's a different network from 10.10.0.x -- the clients would never find me." },
          ],
          explain: "Clients find the domain's DNS and DHCP by IP, so the server gets a fixed (static) address first.",
          effects: [{ kind: "sublabel", node: "server", text: `${SERVER_IP} (static)` }],
        },
        {
          id: "m3t1-roles",
          kind: "slots",
          actor: "server",
          prompt: "Install my roles! Slot in the 4 services the domain needs.",
          bayLabel: "Server role bays",
          chips: [
            { id: "adds", text: "AD DS", correct: true },
            { id: "dns", text: "DNS Server", correct: true },
            { id: "dhcp", text: "DHCP Server", correct: true },
            { id: "print", text: "Print and Document Services", correct: true },
            { id: "hyperv", text: "Hyper-V", why: "Virtual machines aren't part of this job sheet." },
            { id: "iis", text: "Web Server (IIS)", why: "Hosting websites isn't needed to run a domain." },
            { id: "fax", text: "Fax Server", why: "Not one of the roles the job sheet installs." },
          ],
          explain: "Server Manager > Manage > Add Roles and Features installs AD DS, DNS, DHCP and Print and Document Services.",
          effects: [{ kind: "status", node: "server", status: "good" }],
        },
      ],
    },
    {
      id: "m3t1-crown",
      title: "Crown the Controller",
      briefing: "Promote the server to a domain controller and authorize DHCP so it can start working.",
      steps: [
        {
          id: "m3t1-forest",
          kind: "choice",
          actor: "server",
          prompt: "Promote me to a domain controller! Which deployment?",
          options: [
            { id: "a", text: "Add a new forest", correct: true },
            { id: "b", text: "Add a domain controller to an existing domain", why: "There's no domain yet -- you're creating the very first one." },
            { id: "c", text: "Add a new domain to an existing forest", why: "There's no forest yet either -- start a new one." },
          ],
          explain: "The flag notification in Server Manager > Promote this server > Add a new forest.",
        },
        {
          id: "m3t1-root-domain",
          kind: "choice",
          actor: "server",
          prompt: "Root domain name?",
          options: [
            { id: "a", text: "css.org", correct: true },
            { id: "b", text: "css", why: "A root domain needs a full DNS name with a suffix, like css.org." },
            { id: "c", text: "www.css.org", why: "www is a website's host name, not the domain root." },
          ],
          explain: "The guide uses css.org -- the server restarts as its domain controller.",
          effects: [
            { kind: "badge", node: "server", text: "👑 DC: css.org" },
            { kind: "sublabel", node: "server", text: `SERVER.css.org · ${SERVER_IP}` },
          ],
        },
        {
          id: "m3t1-dhcp-commit",
          kind: "choice",
          actor: "server",
          prompt: "The flag shows a DHCP warning. What do you do?",
          options: [
            { id: "a", text: "Complete DHCP configuration → Commit", correct: true },
            { id: "b", text: "Ignore it -- DHCP is installed already", why: "An unauthorized DHCP server won't hand out a single address." },
            { id: "c", text: "Uninstall DHCP and add it again", why: "Reinstalling doesn't authorize it -- just complete the configuration." },
          ],
          explain: "Committing authorizes DHCP in Active Directory so it can lease addresses.",
        },
      ],
    },
    {
      id: "m3t1-address-rush",
      title: "Address Rush",
      briefing: "You're the DHCP and DNS server now! The clients are waking up and shouting requests. Answer before the timer runs out.",
      steps: [
        {
          id: "m3t1-lease-1",
          kind: "choice",
          actor: "client1",
          prompt: "DHCP! I need an IP address!",
          timerSec: 15,
          options: [
            { id: "a", text: CLIENT1_IP, correct: true },
            { id: "b", text: SERVER_IP, why: "That's the server's static IP -- two devices can't share one address." },
            { id: "c", text: "192.168.1.20", why: "Wrong network -- I'd be cut off from everything on 10.10.0.x." },
          ],
          explain: "A free address in the server's 10.10.0.x scope.",
          effects: [
            { kind: "status", node: "client1", status: "on" },
            { kind: "sublabel", node: "client1", text: CLIENT1_IP },
          ],
          pulse: { link: "switch-client1" },
        },
        {
          id: "m3t1-lease-2",
          kind: "choice",
          actor: "client2",
          prompt: "Me too! I need an address!",
          timerSec: 12,
          options: [
            { id: "a", text: CLIENT1_IP, why: "Already leased to Client-PC 1 -- that's an IP conflict." },
            { id: "b", text: CLIENT2_IP, correct: true },
            { id: "c", text: "10.10.1.102", why: "10.10.1.x is a different network from 10.10.0.x." },
          ],
          explain: "Every device needs its own address on the same network.",
          effects: [
            { kind: "status", node: "client2", status: "on" },
            { kind: "sublabel", node: "client2", text: CLIENT2_IP },
          ],
          pulse: { link: "switch-client2" },
        },
        {
          id: "m3t1-reverse-zone",
          kind: "choice",
          actor: "server",
          prompt: "DNS Manager: new reverse lookup zone. Network ID?",
          options: [
            { id: "a", text: "10.10.0", correct: true },
            { id: "b", text: "0.10.10", why: "Type it normally -- Windows reverses it for you." },
            { id: "c", text: SERVER_IP, why: "That's a single host, not the network ID." },
          ],
          explain: "A reverse lookup zone lets DNS answer IP-to-name questions.",
          effects: [{ kind: "badge", node: "server", text: "↩ Reverse zone 10.10.0" }],
        },
        {
          id: "m3t1-dns-forward",
          kind: "choice",
          actor: "client1",
          prompt: "DNS! Where is css.org?",
          timerSec: 10,
          options: [
            { id: "a", text: SERVER_IP, correct: true },
            { id: "b", text: CLIENT1_IP, why: "That's me, not the domain!" },
            { id: "c", text: "8.8.8.8", why: "Public DNS has never heard of your private css.org." },
          ],
          explain: "Forward lookup: name → IP. css.org lives on the domain controller.",
          pulse: { link: "switch-client1", reverse: true },
        },
        {
          id: "m3t1-dns-reverse",
          kind: "choice",
          actor: "client2",
          prompt: `Reverse lookup! Who is ${SERVER_IP}?`,
          timerSec: 10,
          options: [
            { id: "a", text: "SERVER.css.org", correct: true },
            { id: "b", text: "Client-PC 1", why: `Client-PC 1 is ${CLIENT1_IP}.` },
            { id: "c", text: "The internet router", why: `There's no router in this lab -- ${SERVER_IP} is the server.` },
          ],
          explain: "Reverse lookup: IP → name, answered by the zone you just created.",
          pulse: { link: "switch-client2", reverse: true },
        },
      ],
    },
    {
      id: "m3t1-team",
      title: "Assemble the Team",
      briefing: "Open Active Directory Users and Computers and build the OU your users will live in.",
      steps: [
        {
          id: "m3t1-new-ou",
          kind: "choice",
          actor: "server",
          prompt: "Right-click css.org > New > …?",
          options: [
            { id: "a", text: "Organizational Unit", correct: true },
            { id: "b", text: "Group", why: "You can't link a Group Policy to a group -- you link it to an OU." },
            { id: "c", text: "Shared Folder", why: "That publishes a share in AD -- it doesn't hold users." },
          ],
          explain: "An OU is a container you can link a GPO to.",
        },
        {
          id: "m3t1-ou-name",
          kind: "choice",
          actor: "server",
          prompt: "Name the new OU (the one in the guide).",
          options: [
            { id: "a", text: "Redirection", correct: true },
            { id: "b", text: "Users", why: "Users is a built-in container, not an OU -- GPOs can't link to it." },
            { id: "c", text: "Domain Controllers", why: "That's the built-in OU for DCs only." },
          ],
          explain: "Take note of the OU name -- the GPO will be linked to it.",
          effects: [{ kind: "badge", node: "server", text: "📂 OU: Redirection" }],
        },
        {
          id: "m3t1-users",
          kind: "slots",
          actor: "server",
          prompt: "New > User. Drop the two new accounts into the Redirection OU.",
          bayLabel: "Redirection OU",
          chips: [
            { id: "user1", text: "👤 user1", correct: true },
            { id: "user2", text: "👤 user2", correct: true },
            { id: "guest", text: "👤 Guest", why: "Guest is a built-in, disabled account -- create your own users." },
            { id: "admin", text: "👤 Administrator", why: "Leave the admin account where it is -- the OU is for test users." },
          ],
          explain: "Two users in the OU means the GPO you link there will apply to both.",
        },
      ],
    },
    {
      id: "m3t1-policy",
      title: "Policy Power",
      briefing: "Share the UserFiles folder, then use Group Policy to send everyone's folders there.",
      steps: [
        {
          id: "m3t1-share",
          kind: "choice",
          actor: "userfiles",
          prompt: "Share me with Everyone! What permission?",
          options: [
            { id: "a", text: "Read/Write", correct: true },
            { id: "b", text: "Read", why: "Read-only means users can't save their redirected files." },
            { id: "c", text: "Don't share -- just Administrator", why: "Then the users' files have nowhere to go." },
          ],
          explain: "Everyone gets Read/Write, then copy the network path: \\\\SERVER\\UserFiles.",
          effects: [
            { kind: "status", node: "userfiles", status: "good" },
            { kind: "sublabel", node: "userfiles", text: "\\\\SERVER\\UserFiles" },
          ],
          pulse: { link: "server-userfiles" },
        },
        {
          id: "m3t1-gpo",
          kind: "choice",
          actor: "server",
          prompt: "Group Policy Management: right-click the Redirection OU > …?",
          options: [
            { id: "a", text: "Create a GPO in this domain, and Link it here", correct: true },
            { id: "b", text: "Block Inheritance", why: "That blocks policies -- the opposite of what you want." },
            { id: "c", text: "Delete", why: "That would delete the OU you just built!" },
          ],
          explain: "Name the new GPO \"redirection\", then right-click > Edit.",
          effects: [{ kind: "badge", node: "server", text: "📜 GPO: redirection" }],
        },
        {
          id: "m3t1-redirect-folders",
          kind: "slots",
          actor: "server",
          prompt: "Folder Redirection > Basic. Which folders go to the server?",
          bayLabel: "Redirected folders",
          chips: [
            { id: "desktop", text: "🖥️ Desktop", correct: true },
            { id: "documents", text: "📄 Documents", correct: true },
            { id: "pictures", text: "🖼️ Pictures", correct: true },
            { id: "downloads", text: "⬇️ Downloads", why: "The job sheet redirects Desktop, Documents and Pictures only." },
            { id: "windows", text: "🪟 Windows", why: "System folders are never redirected." },
          ],
          explain: "User Configuration > Policies > Windows Settings > Folder Redirection, one folder at a time.",
        },
        {
          id: "m3t1-root-path",
          kind: "choice",
          actor: "server",
          prompt: "Root path to paste for each folder?",
          options: [
            { id: "a", text: "\\\\SERVER\\UserFiles", correct: true },
            { id: "b", text: "D:\\UserFiles", why: "That's a local path -- clients can't reach the server's D: drive. Use the network path." },
            { id: "c", text: "C:\\Users", why: "That's each client's own local folder -- nothing would move." },
          ],
          explain: "The network path you copied when you shared the folder.",
        },
      ],
    },
    {
      id: "m3t1-join",
      title: "Join the Kingdom",
      briefing: "Bring the clients into css.org, log in, and prove the redirect works.",
      steps: [
        {
          id: "m3t1-client-dns",
          kind: "choice",
          actor: "client1",
          prompt: "Set my Preferred DNS server so I can find css.org!",
          options: [
            { id: "a", text: SERVER_IP, correct: true },
            { id: "b", text: "8.8.8.8", why: "Public DNS can't find your private domain." },
            { id: "c", text: CLIENT1_IP, why: "That's my own address." },
          ],
          explain: "Not sure of the server IP? Run ipconfig on the server.",
        },
        {
          id: "m3t1-join-1",
          kind: "choice",
          actor: "client1",
          prompt: "System Properties > Change > Member of…?",
          options: [
            { id: "a", text: "Domain: css.org", correct: true },
            { id: "b", text: "Workgroup: WORKGROUP", why: "A workgroup PC never receives the domain's Group Policy." },
            { id: "c", text: "Domain: SERVER", why: "SERVER is the computer's name -- the domain is css.org." },
          ],
          explain: "Sign in with a domain account, then Restart Now.",
          effects: [
            { kind: "status", node: "client1", status: "good" },
            { kind: "badge", node: "client1", text: "🏰 css.org" },
          ],
          pulse: { link: "switch-client1" },
        },
        {
          id: "m3t1-join-2",
          kind: "choice",
          actor: "client2",
          prompt: "My turn! DNS is set. Member of…?",
          timerSec: 10,
          options: [
            { id: "a", text: "Workgroup: WORKGROUP", why: "Still no Group Policy for a workgroup PC." },
            { id: "b", text: "Domain: css.org", correct: true },
            { id: "c", text: "Domain: client2", why: "That's this PC's own name, not the domain." },
          ],
          explain: "Both clients are now members of css.org.",
          effects: [
            { kind: "status", node: "client2", status: "good" },
            { kind: "badge", node: "client2", text: "🏰 css.org" },
          ],
          pulse: { link: "switch-client2" },
        },
        {
          id: "m3t1-login",
          kind: "wait",
          actor: "client1",
          prompt: "Logging in as user1… redirecting my Desktop to the server!",
          seconds: 5,
          progressText: "Applying Group Policy",
          trap: { text: "🔌 Unplug the cable to speed it up", why: "The client needs the network to reach the server's share!" },
          explain: "At first logon the GPO applies and the user's folders move to \\\\SERVER\\UserFiles.",
          effects: [{ kind: "badge", node: "userfiles", text: "📁 user1" }],
          pulse: { link: "server-userfiles", reverse: true },
        },
        {
          id: "m3t1-verify",
          kind: "choice",
          actor: "userfiles",
          prompt: "Open me up! What proves the redirect worked?",
          options: [
            { id: "a", text: "A user1 folder with Desktop, Documents and Pictures inside", correct: true },
            { id: "b", text: "UserFiles is still empty", why: "Empty means the redirect did NOT work." },
            { id: "c", text: "user1's files are only on Client-PC 1", why: "Then they were never redirected." },
          ],
          explain: "Take ownership as Administrators if needed to open it -- the client's files are right there.",
        },
      ],
    },
  ],
});

const SERVICES_NODES: SceneNode[] = [
  { id: "server", kind: "server", label: "SERVER", sublabel: `SERVER.css.org · ${SERVER_IP}`, x: 16, y: 14, status: "good" },
  { id: "switch", kind: "switch", label: "Switch", x: 50, y: 14 },
  { id: "client1", kind: "pc", label: "Client-PC 1", sublabel: CLIENT1_IP, x: 84, y: 12 },
  { id: "printer", kind: "printer", label: "Network Printer", sublabel: "not installed", x: 84, y: 37, status: "off" },
];

const SERVICES_LINKS: SceneLink[] = [
  { id: "server-switch", from: "server", to: "switch" },
  { id: "switch-client1", from: "switch", to: "client1" },
  { id: "switch-printer", from: "switch", to: "printer" },
  { id: "rdp", from: "server", to: "client1", hidden: true, curved: true },
];

/** Task 2 quiz gate -- remote into a client, then push a printer out to every user. */
export const module3Task2Game = missionGame({
  title: "Remote & Print Ops",
  story:
    "The domain is up. Now the boss wants two things: control Client-PC 1 from the server without walking over, and a printer every user gets automatically.",
  scene: { nodes: SERVICES_NODES, links: SERVICES_LINKS },
  missions: [
    {
      id: "m3t2-open-door",
      title: "Open the Door",
      briefing: "On the client, switch Remote Desktop on and choose who may connect.",
      steps: [
        {
          id: "m3t2-allow",
          kind: "choice",
          actor: "client1",
          prompt: "Remote settings: what do you turn on?",
          options: [
            { id: "a", text: "Allow remote connections to this computer", correct: true },
            { id: "b", text: "Allow Remote Assistance only", why: "Remote Assistance is for invited help sessions -- you need Remote Desktop." },
            { id: "c", text: "Don't allow remote connections", why: "Then nobody can connect at all." },
          ],
          explain: "Allow connections from computers running any version of Remote Desktop.",
          effects: [{ kind: "badge", node: "client1", text: "🔓 RDP on" }],
        },
        {
          id: "m3t2-users",
          kind: "slots",
          actor: "client1",
          prompt: "Select Users… who may sign in to me remotely?",
          bayLabel: "Remote Desktop Users",
          chips: [
            { id: "u1", text: "👤 user1", correct: true },
            { id: "u2", text: "👤 user2", correct: true },
            { id: "guest", text: "👤 Guest", why: "Never give the Guest account remote access." },
            { id: "everyone", text: "👥 Everyone", why: "Opening Remote Desktop to everyone is a security hole." },
          ],
          explain: "Only listed users (and admins) may connect.",
        },
      ],
    },
    {
      id: "m3t2-remote-in",
      title: "Remote In",
      briefing: "From the server, open a Remote Desktop session to Client-PC 1. Check the map for its IP!",
      steps: [
        {
          id: "m3t2-mstsc",
          kind: "choice",
          actor: "server",
          prompt: "Which program do you run?",
          options: [
            { id: "a", text: "Remote Desktop Connection (mstsc)", correct: true },
            { id: "b", text: "ping", why: "ping only tests if the PC answers -- it can't control it." },
            { id: "c", text: "Server Manager", why: "That manages this server, not the client's desktop." },
          ],
          explain: "Remote Desktop Connection is built into Windows.",
        },
        {
          id: "m3t2-ip",
          kind: "choice",
          actor: "server",
          prompt: "Computer: ?",
          timerSec: 12,
          options: [
            { id: "a", text: SERVER_IP, why: "That's the server itself!" },
            { id: "b", text: CLIENT1_IP, correct: true },
            { id: "c", text: "10.10.0.255", why: "That's the network's broadcast address, not a PC." },
          ],
          explain: "Enter the client's IP -- it's on the map under Client-PC 1.",
        },
        {
          id: "m3t2-other-user",
          kind: "choice",
          actor: "server",
          prompt: "Sign in as…?",
          options: [
            { id: "a", text: "More choices > Use a different account: css\\user1", correct: true },
            { id: "b", text: "Guest", why: "Guest wasn't added -- and shouldn't be." },
            { id: "c", text: "Leave it blank", why: "Remote Desktop needs real credentials." },
          ],
          explain: "Select \"other user\" and sign in with an account you allowed.",
        },
        {
          id: "m3t2-connecting",
          kind: "wait",
          actor: "server",
          prompt: "Connecting to Client-PC 1…",
          seconds: 4,
          progressText: "Starting remote session",
          trap: { text: "❌ Cancel and try again", why: "Patience -- the session is still starting." },
          explain: "You're now controlling Client-PC 1's desktop from the server.",
          effects: [
            { kind: "link", link: "rdp" },
            { kind: "status", node: "client1", status: "good" },
            { kind: "badge", node: "client1", text: "🖥️ Remote session" },
          ],
          pulse: { link: "rdp" },
        },
      ],
    },
    {
      id: "m3t2-printer",
      title: "Printer Drop",
      briefing: "Install the network printer on the server and deploy it to every user with Group Policy.",
      steps: [
        {
          id: "m3t2-print-role",
          kind: "slots",
          actor: "server",
          prompt: "Add roles: which one manages printers?",
          bayLabel: "New role",
          chips: [
            { id: "print", text: "Print and Document Services", correct: true },
            { id: "fax", text: "Fax Server", why: "Fax isn't printing." },
            { id: "hyperv", text: "Hyper-V", why: "That's for virtual machines." },
          ],
          explain: "It installs Print Management, the console that shares and deploys printers.",
        },
        {
          id: "m3t2-install-printer",
          kind: "choice",
          actor: "printer",
          prompt: "Install me! How does the server add me?",
          options: [
            { id: "a", text: "Add the printer by its IP address on the network", correct: true },
            { id: "b", text: "Plug me into Client-PC 1 by USB", why: "Then only that one PC could print -- this is a network printer." },
            { id: "c", text: "Install my driver by hand on every client", why: "That's exactly what deploying from the server avoids." },
          ],
          explain: "The server must know the printer before it can share or deploy it.",
          effects: [
            { kind: "status", node: "printer", status: "on" },
            { kind: "sublabel", node: "printer", text: "10.10.0.50" },
          ],
          pulse: { link: "switch-printer" },
        },
        {
          id: "m3t2-deploy",
          kind: "choice",
          actor: "server",
          prompt: "Print Management: right-click the printer > …?",
          options: [
            { id: "a", text: "Deploy with Group Policy", correct: true },
            { id: "b", text: "Pause Printing", why: "That stops the printer -- nobody would get anything." },
            { id: "c", text: "Delete", why: "You just installed it!" },
          ],
          explain: "Deploying through Group Policy pushes the printer to everyone the GPO applies to.",
        },
        {
          id: "m3t2-gpo-target",
          kind: "choice",
          actor: "server",
          prompt: "Which GPO should carry the printer?",
          options: [
            { id: "a", text: "Default Domain Controllers Policy", why: "That targets domain controllers, not the users' PCs." },
            { id: "b", text: "redirection (linked to the Redirection OU)", correct: true },
            { id: "c", text: "No GPO -- just share it", why: "Sharing alone doesn't push it to anyone." },
          ],
          explain: "The users in the Redirection OU now get the printer automatically.",
          effects: [{ kind: "badge", node: "printer", text: "📜 Deployed to OU" }],
        },
        {
          id: "m3t2-test-print",
          kind: "wait",
          actor: "client1",
          prompt: "Printing a sample document…",
          seconds: 4,
          progressText: "Sending print job",
          trap: { text: "🔌 Switch the printer off and on", why: "Interrupting it mid-job just loses the print." },
          explain: "A test page from the client proves the deployment worked end to end.",
          effects: [
            { kind: "status", node: "printer", status: "good" },
            { kind: "badge", node: "printer", text: "📄 Test page" },
          ],
          pulse: { link: "switch-printer" },
        },
      ],
    },
  ],
});
