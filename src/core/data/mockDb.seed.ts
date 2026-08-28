import type { ModuleMeta } from "./types";

/**
 * The static module catalog -- one module per TESDA CSS NC II unit of
 * competency (UC1-UC4), each built directly from that UC's guide (Learn) and
 * task/job sheets (Try). See the REGISTRY in src/core/content/loader.ts.
 */
export const MODULE_CATALOG: ModuleMeta[] = [
  {
    id: "module-1",
    order: 1,
    title: "Install and Configure Computer Systems",
    description: "Disassemble, assemble, and set up a computer from a blank machine -- bootable media, OS install, drivers, and essential software.",
    requiresModuleId: null,
  },
  {
    id: "module-2",
    order: 2,
    title: "Set Up Computer Networks",
    description: "Cabling standards, IP addressing, DHCP, wireless setup, and diagnosing network faults.",
    requiresModuleId: "module-1",
  },
  {
    id: "module-3",
    order: 3,
    title: "Set Up Computer Servers",
    description: "Active Directory, DNS, DHCP roles, domain controllers, Group Policy, and printer deployment.",
    requiresModuleId: "module-2",
  },
  {
    id: "module-4",
    order: 4,
    title: "Maintain and Repair Computer Systems and Networks",
    description: "Backing up files over a network and proving a restore actually works.",
    requiresModuleId: "module-3",
  },
];
