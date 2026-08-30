import type { ProcedureChecklistActivityContent } from "../types";

// Sourced from UC3 (Set Up Computer Servers): the UC3 Guide, Job Sheet 3.1-2
// "Setting-Up User Access", and Job Sheet 3.2-2 "Configuring Network Services",
// combined into one server-setup-to-client-access flow.
export const module3Activity: ProcedureChecklistActivityContent = {
  kind: "procedure-checklist",
  moduleId: "module-3",
  instructions: "Stand up a domain server and connect a client to it, in order.",
  items: [
    {
      id: "static-server-ip",
      label: "Set the server's IP address to static",
      explanation: "A server's address shouldn't change -- clients need to be able to find it reliably.",
      model: { url: "/models/server-rack.glb" },
    },
    {
      id: "add-roles",
      label: "Add server roles: AD DS, DHCP, DNS, and Print Services",
      explanation: "These roles are what turn a plain Windows Server install into a functioning network server.",
      image: {
        url: "/modules/module-3/images/add-roles.webp",
        alt: "Add Roles and Features Wizard's Select server roles screen, with Active Directory Domain Services checked",
      },
    },
    {
      id: "promote-domain-controller",
      label: "Promote the server to a domain controller",
      explanation: "Creates the domain (e.g. a root domain name) that client machines will join.",
      image: {
        url: "/modules/module-3/images/promote-domain-controller.webp",
        alt: "Active Directory Domain Services Configuration Wizard's Deployment Configuration screen, adding a new forest with root domain name css.org",
      },
    },
    {
      id: "complete-dhcp",
      label: "Complete the DHCP configuration",
      explanation: "Finishes setting up automatic IP address assignment for the network.",
      image: {
        url: "/modules/module-3/images/complete-dhcp.webp",
        alt: "DHCP Post-Install Configuration Wizard's Authorization screen, authorizing the DHCP server under the domain administrator credentials",
      },
    },
    {
      id: "reverse-lookup-zone",
      label: "Set up a reverse lookup zone in DNS",
      explanation: "Lets the network resolve IP addresses back to names, not just names to addresses.",
      image: {
        url: "/modules/module-3/images/reverse-lookup-zone.webp",
        alt: "DNS New Zone Wizard's Reverse Lookup Zone Name screen, choosing an IPv4 Reverse Lookup Zone",
      },
    },
    {
      id: "create-ou-and-users",
      label: "Create an Organizational Unit and two user accounts",
      explanation: "Groups related accounts together so policies can be applied to all of them at once.",
      image: {
        url: "/modules/module-3/images/create-ou-and-users.webp",
        alt: "Active Directory New Object - User wizard creating a user account inside the css.org/Redirection organizational unit",
      },
    },
    {
      id: "share-userfiles-folder",
      label: "Create and share a \"UserFiles\" folder with read/write access",
      explanation: "This shared folder is where redirected user folders will actually be stored.",
      image: {
        url: "/modules/module-3/images/share-userfiles-folder.webp",
        alt: "Windows File Sharing dialog for the UserFiles folder, with Everyone granted Read/Write permission level",
      },
    },
    {
      id: "configure-folder-redirection",
      label: "Configure folder redirection for Desktop, Documents, and Pictures",
      explanation: "Applied via Group Policy so it affects everyone in the Organizational Unit automatically.",
      image: {
        url: "/modules/module-3/images/configure-folder-redirection.webp",
        alt: "Group Policy Management Editor's Desktop Properties dialog, redirecting everyone's Desktop folder to a UserFiles network path",
      },
    },
    {
      id: "join-client-to-domain",
      label: "Connect the client PC to the domain",
      explanation: "Point the client's DNS at the server, then change its domain and log in with a domain account.",
      image: {
        url: "/modules/module-3/images/join-client-to-domain.webp",
        alt: "Computer Name/Domain Changes dialog on the client PC, joining the css.org domain",
      },
    },
    {
      id: "verify-folder-redirection",
      label: "Check that folder redirection worked on the client",
      explanation: "Confirms the client's files are actually landing in the shared UserFiles location.",
      image: {
        url: "/modules/module-3/images/verify-folder-redirection.webp",
        alt: "File Explorer on the client PC showing the signed-in user's Desktop folder redirected into the network UserFiles share",
      },
    },
    {
      id: "remote-desktop",
      label: "Perform a remote desktop connection to the client",
      explanation: "Lets an administrator manage the client PC over the network.",
    },
    {
      id: "deploy-printer",
      label: "Deploy a network printer from the server",
      explanation: "Print and Document Services lets a printer be installed once and pushed out to clients centrally.",
    },
  ],
};
