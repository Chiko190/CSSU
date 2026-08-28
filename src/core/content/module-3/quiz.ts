import type { QuizQuestion } from "../types";

export const module3Quiz: QuizQuestion[] = [
  {
    id: "q1-domain-controller",
    type: "multiple_choice",
    prompt: "What happens when a server is promoted to a domain controller?",
    options: [
      { id: "a", text: "It creates a central directory of users and computers that clients can join" },
      { id: "b", text: "It permanently disables the network" },
      { id: "c", text: "It converts the server into a client PC" },
      { id: "d", text: "It deletes all existing user accounts" },
    ],
    correctOptionIds: ["a"],
    explanation: "Promoting a server to a domain controller sets up Active Directory, giving the network a central place to manage users and computers.",
  },
  {
    id: "q2-ou-purpose",
    type: "multiple_choice",
    prompt: "What is an Organizational Unit (OU) used for?",
    options: [
      { id: "a", text: "Grouping related users or computers so policies can apply to all of them at once" },
      { id: "b", text: "Physically organizing network cables" },
      { id: "c", text: "Replacing the need for DNS" },
      { id: "d", text: "Assigning IP addresses automatically" },
    ],
    correctOptionIds: ["a"],
    explanation: "An OU groups accounts or computers together so a linked Group Policy can apply consistent settings to everyone in it.",
  },
  {
    id: "q3-folder-redirection",
    type: "multiple_choice",
    prompt: "What does folder redirection do?",
    options: [
      { id: "a", text: "Points a user's Desktop/Documents/Pictures at a shared network location" },
      { id: "b", text: "Deletes a user's local files" },
      { id: "c", text: "Prevents a user from logging in" },
      { id: "d", text: "Assigns a static IP address" },
    ],
    correctOptionIds: ["a"],
    explanation: "Folder redirection stores a user's key folders on the network instead of locally, so their files follow them between domain computers.",
  },
  {
    id: "q4-join-domain",
    type: "multiple_choice",
    prompt: "What's the first thing a client PC needs configured before it can join a domain?",
    options: [
      { id: "a", text: "Its preferred DNS server set to the domain server's IP address" },
      { id: "b", text: "A new hard drive" },
      { id: "c", text: "A printer connected directly to it" },
      { id: "d", text: "Antivirus software" },
    ],
    correctOptionIds: ["a"],
    explanation: "The client needs to be able to resolve the domain via DNS before it can find and authenticate against the domain controller.",
  },
  {
    id: "q5-reverse-lookup",
    type: "true_false",
    prompt: "A reverse lookup zone in DNS resolves an IP address back to a name, rather than a name to an IP address.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["true"],
    explanation: "Forward lookup goes name-to-IP; reverse lookup goes IP-to-name.",
  },
];
