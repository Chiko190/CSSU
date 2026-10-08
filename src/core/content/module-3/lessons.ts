import type { LessonCard } from "../types";

export const module3Lessons: LessonCard[] = [
  {
    id: "server-roles",
    title: "Server Roles",
    body: "A server is a computer configured to provide services to other computers on the network. Common roles include Active Directory Domain Services (identity), DNS (name resolution), DHCP (address assignment), and print services.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/add-roles.webp",
      alt: "Add Roles and Features Wizard's Select server roles screen, with Active Directory Domain Services checked",
    },
  },
  {
    id: "domain-controller",
    title: "Domain Controllers and Active Directory",
    body: "Promoting a server to a domain controller creates a central directory of users and computers -- a 'domain' -- that client machines can join and authenticate against, instead of managing accounts separately on every PC.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/promote-domain-controller.webp",
      alt: "Active Directory Domain Services Configuration Wizard's Deployment Configuration screen, adding a new forest with root domain name css.org",
    },
  },
  {
    id: "dns-and-reverse-lookup",
    title: "DNS and Reverse Lookup Zones",
    body: "DNS translates names to IP addresses (forward lookup) and IP addresses back to names (reverse lookup). Setting up a reverse lookup zone lets the network resolve in both directions.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/reverse-lookup-zone.webp",
      alt: "DNS New Zone Wizard's Reverse Lookup Zone Name screen, choosing an IPv4 Reverse Lookup Zone",
    },
  },
  {
    id: "organizational-units-and-gpo",
    title: "Organizational Units and Group Policy",
    body: "An Organizational Unit (OU) groups related users or computers inside a domain. A Group Policy Object (GPO) linked to an OU applies settings -- like folder redirection -- to everyone in that group automatically.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/create-ou-and-users.webp",
      alt: "Active Directory New Object - User wizard creating a user account inside the css.org/Redirection organizational unit",
    },
  },
  {
    id: "folder-redirection",
    title: "Folder Redirection",
    body: "Folder redirection points a user's Desktop, Documents, or Pictures folder at a shared network location instead of the local disk -- so their files follow them to whichever domain computer they log into.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/configure-folder-redirection.webp",
      alt: "Group Policy Management Editor's Desktop Properties dialog, redirecting everyone's Desktop folder to a UserFiles network path",
    },
  },
  {
    id: "joining-a-domain",
    title: "Joining a Client to the Domain",
    body: "A client PC joins a domain by pointing its DNS settings at the server's IP address, then changing its identification from a workgroup to the domain name and authenticating with a domain account.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/join-client-to-domain.webp",
      alt: "Computer Name/Domain Changes dialog on the client PC, joining the css.org domain",
    },
  },
  {
    id: "remote-desktop-and-printing",
    title: "Remote Desktop and Printer Deployment",
    body: "Remote Desktop lets an administrator connect to and control a client PC over the network. Print and Document Services let a server host a network printer that's deployed out to client machines centrally.",
    media: {
      kind: "image",
      url: "/modules/module-3/images/remote-desktop.webp",
      alt: "Windows Remote Desktop Connection dialog, prompting for the computer name to connect to",
      credit: "\"Remote Desktop Connection\" by Dion Dresschers (Wikimedia Commons), CC0",
    },
  },
];
