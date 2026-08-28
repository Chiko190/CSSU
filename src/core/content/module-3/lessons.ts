import type { LessonCard } from "../types";

export const module3Lessons: LessonCard[] = [
  {
    id: "server-roles",
    title: "Server Roles",
    body: "A server is a computer configured to provide services to other computers on the network. Common roles include Active Directory Domain Services (identity), DNS (name resolution), DHCP (address assignment), and print services.",
  },
  {
    id: "domain-controller",
    title: "Domain Controllers and Active Directory",
    body: "Promoting a server to a domain controller creates a central directory of users and computers -- a 'domain' -- that client machines can join and authenticate against, instead of managing accounts separately on every PC.",
  },
  {
    id: "dns-and-reverse-lookup",
    title: "DNS and Reverse Lookup Zones",
    body: "DNS translates names to IP addresses (forward lookup) and IP addresses back to names (reverse lookup). Setting up a reverse lookup zone lets the network resolve in both directions.",
  },
  {
    id: "organizational-units-and-gpo",
    title: "Organizational Units and Group Policy",
    body: "An Organizational Unit (OU) groups related users or computers inside a domain. A Group Policy Object (GPO) linked to an OU applies settings -- like folder redirection -- to everyone in that group automatically.",
  },
  {
    id: "folder-redirection",
    title: "Folder Redirection",
    body: "Folder redirection points a user's Desktop, Documents, or Pictures folder at a shared network location instead of the local disk -- so their files follow them to whichever domain computer they log into.",
  },
  {
    id: "joining-a-domain",
    title: "Joining a Client to the Domain",
    body: "A client PC joins a domain by pointing its DNS settings at the server's IP address, then changing its identification from a workgroup to the domain name and authenticating with a domain account.",
  },
  {
    id: "remote-desktop-and-printing",
    title: "Remote Desktop and Printer Deployment",
    body: "Remote Desktop lets an administrator connect to and control a client PC over the network. Print and Document Services let a server host a network printer that's deployed out to client machines centrally.",
  },
];
