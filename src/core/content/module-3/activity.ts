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
    },
    {
      id: "promote-domain-controller",
      label: "Promote the server to a domain controller",
      explanation: "Creates the domain (e.g. a root domain name) that client machines will join.",
    },
    {
      id: "complete-dhcp",
      label: "Complete the DHCP configuration",
      explanation: "Finishes setting up automatic IP address assignment for the network.",
    },
    {
      id: "reverse-lookup-zone",
      label: "Set up a reverse lookup zone in DNS",
      explanation: "Lets the network resolve IP addresses back to names, not just names to addresses.",
    },
    {
      id: "create-ou-and-users",
      label: "Create an Organizational Unit and two user accounts",
      explanation: "Groups related accounts together so policies can be applied to all of them at once.",
    },
    {
      id: "share-userfiles-folder",
      label: "Create and share a \"UserFiles\" folder with read/write access",
      explanation: "This shared folder is where redirected user folders will actually be stored.",
    },
    {
      id: "configure-folder-redirection",
      label: "Configure folder redirection for Desktop, Documents, and Pictures",
      explanation: "Applied via Group Policy so it affects everyone in the Organizational Unit automatically.",
    },
    {
      id: "join-client-to-domain",
      label: "Connect the client PC to the domain",
      explanation: "Point the client's DNS at the server, then change its domain and log in with a domain account.",
    },
    {
      id: "verify-folder-redirection",
      label: "Check that folder redirection worked on the client",
      explanation: "Confirms the client's files are actually landing in the shared UserFiles location.",
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
