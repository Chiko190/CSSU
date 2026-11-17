// Voice-over scripts for every lesson video made for this app (see narrate.mjs, which turns these
// into speech and adds it to the videos). Each line starts at `at` seconds -- the moment the matching
// on-screen caption appears -- and must finish before the next line (or the video's end); narrate.mjs
// checks that and speeds a line up slightly if it has to.
//
// Spelling is written for the speech engine, not for reading: "T five sixty-eight B" rather than
// "T568B", "R J forty-five" rather than "RJ45", "css dot org", and so on.
//
// The Wikimedia "computer-components" clip in UC1 has its own sound and isn't listed here.

const T568B = "T five sixty-eight B";

module.exports = {
  // ===== UC1 =====
  "module-1/videos/intro": [
    { at: 0, text: "Unit One: build a working PC." },
    { at: 3.5, text: "First, strip a PC down part by part, then rebuild it in the right order." },
    { at: 9.9, text: "Next, make a bootable USB and install Windows." },
    { at: 14.9, text: "Then add the drivers and the apps the user needs." },
    { at: 19.4, text: "Five tasks are waiting. Start with the briefing." },
  ],

  "module-1/videos/uc1-explainer": [
    { at: 0, text: "Unit One: build it, then bring it to life." },
    { at: 5.4, text: "Safety first: eye protection, the right screwdrivers, and an anti-static strap." },
    { at: 11.4, text: "First check it works, then switch off and unplug it." },
    { at: 16.9, text: "Task one: take it apart. Covers, RAM, power supply, cooler, graphics card, drives, CPU, and the motherboard last." },
    { at: 25.8, text: "Task two: rebuild it in reverse, from the motherboard first to the covers last." },
    { at: 34.9, text: "Power on. A clean boot proves the build is right." },
    { at: 39.9, text: "Task three: use Rufus to make a bootable USB drive, then test that it boots." },
    { at: 46.4, text: "Task four: boot from the USB, install Windows, and split the disk into two partitions." },
    { at: 53.4, text: "A fresh install rarely has every driver. Add the graphics, network, and audio drivers." },
    { at: 59.4, text: "Task five: install a browser, an office suite, and antivirus." },
    { at: 65.4, text: "That's Unit One. Now strip, rebuild, and set up the PC yourself." },
  ],

  "module-1/videos/uc1-wiring": [
    { at: 0, text: "Perfect wiring, cable by cable. Watch where every cable goes." },
    { at: 6, text: "Everything you'll wire is already in place: the same parts you remove and install in the 3D game." },
    { at: 23.5, text: "Step one: plug the big twenty-four pin cable into the motherboard until it clicks." },
    { at: 30, text: "Step two: the eight-pin CPU cable runs along the top." },
    { at: 36.5, text: "Step three: P C I E power feeds the graphics card." },
    { at: 43, text: "Step four: one SATA power cable daisy-chains to both drives." },
    { at: 49.5, text: "Step five: a SATA data cable from each drive to the motherboard." },
    { at: 56, text: "Step six: each case fan plugs into a fan header on the board." },
    { at: 62.5, text: "Step seven: every plug fully seated, cables tied along the edges, and nothing blocking the airflow." },
    { at: 69, text: "Covers back on, then power on to test." },
    { at: 73.5, text: "Now wire it yourself. Power cables go first." },
  ],

  // ===== UC2 =====
  "module-2/videos/intro": [
    { at: 0, text: "Unit Two: connect computers so they can share." },
    { at: 3.5, text: `Crimp network cables, and test every wire.` },
    { at: 8.9, text: "Give each PC an address, then ping to test." },
    { at: 13.9, text: "Set up the router, then share a folder." },
    { at: 18.9, text: "Two tasks are waiting. Start with the briefing." },
  ],

  "module-2/videos/uc2-explainer": [
    { at: 0, text: "Unit Two: cables, IP addresses, the router, and shared folders." },
    { at: 5.5, text: "Two PCs, a switch, and a router. Nothing is connected yet." },
    { at: 11.0, text: "Task one: plan first. Draw a network diagram before cutting any cable." },
    { at: 16.4, text: `Strip the jacket, put the eight wires in ${T568B} order, and crimp. Both ends match.` },
    { at: 24.0, text: "A cable tester checks every wire. All eight lights means it's good." },
    { at: 29.4, text: "Task two: give each PC its own address on the same network, by hand." },
    { at: 36.5, text: "Now ping the other PC. A reply proves everything is right." },
    { at: 41.9, text: "On the router, change the default Wi-Fi name, set a strong password, and turn on DHCP." },
    { at: 48.9, text: "Switch the PCs to obtain an address automatically. Now the router hands them out." },
    { at: 55.4, text: "Share a folder, allow it through the firewall, and find the PCs in the Network view." },
    { at: 62.4, text: "If something fails, check the cable first, then the addresses, then the sharing settings." },
    { at: 68.5, text: "That's Unit Two. Now build the network yourself." },
  ],

  "module-2/videos/make-lan-cable": [
    { at: 0, text: "Making a straight-through LAN cable." },
    { at: 3.5, text: "You need cable, plugs and boots, a stripper, a crimper, and a tester." },
    { at: 9.5, text: "Step one: slide the boot on first, before crimping." },
    { at: 14.5, text: "Step two: strip about three centimeters of jacket, without nicking the wires." },
    { at: 21, text: "Step three: untwist the four pairs, and straighten each wire." },
    { at: 26.5, text: `Step four: ${T568B} order. White-orange, orange, white-green, blue, white-blue, green, white-brown, brown.` },
    { at: 35.5, text: "Step five: cut straight across, leaving about one point three centimeters." },
    { at: 41.5, text: "Step six: clip facing down, push the wires in until all eight touch the front." },
    { at: 48, text: "Step seven: check that every wire reaches the front, in order." },
    { at: 54, text: "Step eight: put the plug in the crimper, and squeeze until it clicks." },
    { at: 60.5, text: `Step nine: make the other end the same way.` },
    { at: 66.5, text: "Step ten: test it. Lights one to eight must flash in the same order on both units." },
    { at: 73.5, text: "It passes. The cable is ready to use." },
  ],

  "module-2/videos/insert-and-crimp-rj45": [
    { at: 0, text: "Inserting the wires, and crimping." },
    { at: 3.5, text: `Hold the eight wires flat, and check the order against the chart.` },
    { at: 10.5, text: "Hold the plug clip down, facing away. Pin one, white-orange, is on the left." },
    { at: 17, text: "Push firmly and straight, so the wires slide all the way to the front." },
    { at: 24, text: "Look through the clear plug. You should see eight copper ends touching the front." },
    { at: 31, text: "Now crimp. Squeeze until it clicks, and each gold pin cuts into its own wire." },
    { at: 39, text: "Common mistakes: a short wire, swapped wires, or the jacket outside the plug. Any of them fails the test, so redo that end." },
    { at: 48, text: "Then test every new cable." },
  ],

  // ===== UC3 =====
  "module-3/videos/intro": [
    { at: 0, text: "Unit Three: build the office server." },
    { at: 3.5, text: "Static IP, server roles, then promote it to a domain controller." },
    { at: 8.9, text: "DHCP hands out addresses, and the PCs join the domain." },
    { at: 14.5, text: "Then add shared folders, Remote Desktop, and a printer for everyone." },
    { at: 20.0, text: "Two tasks, two mission games. Start with the briefing." },
  ],

  "module-3/videos/uc3-explainer": [
    { at: 0, text: "Unit Three: one server runs the whole office network." },
    { at: 5.4, text: "Our lab: one server, a switch, and two client PCs." },
    { at: 11.4, text: "Step one: give the server a static IP address." },
    { at: 16.9, text: "Step two: add the roles. Active Directory, DNS, DHCP, and Print Services." },
    { at: 23.4, text: "Step three: promote it to a domain controller, creating css dot org." },
    { at: 29.4, text: "Step four: authorize DHCP. Now the server hands out addresses automatically." },
    { at: 35.9, text: "DNS turns names into addresses, like css dot org into the server's IP." },
    { at: 42.9, text: "Step five: create an O U called Redirection, with two users." },
    { at: 48.9, text: "Step six: share a folder, and redirect users' files there with Group Policy." },
    { at: 55.9, text: "Step seven: point each client's DNS at the server, then join the domain." },
    { at: 61.9, text: "It works. When user one logs in, their files now save to the server." },
    { at: 68.4, text: "Task two: use Remote Desktop to reach a client, then deploy a network printer with Group Policy." },
    { at: 76.4, text: "That's Unit Three. Now build it yourself." },
  ],

  // ===== UC4 =====
  "module-4/videos/intro": [
    { at: 0, text: "Unit Four: protect data, and fix what breaks." },
    { at: 3.5, text: "First, back up a folder to the server over the network." },
    { at: 9.0, text: "Then delete it, restore it, and check the files are back." },
    { at: 14.5, text: "Then troubleshoot: find the fault, fix it, test it, and report." },
    { at: 20.0, text: "Two missions are waiting. Start with the briefing." },
  ],

  "module-4/videos/uc4-explainer": [
    { at: 0, text: "Unit Four: back up, restore, and troubleshoot." },
    { at: 6.0, text: "Disks fail, and files get deleted. A backup is a copy kept elsewhere." },
    { at: 12.4, text: "Step one: make a test folder on drive D, with a few files." },
    { at: 17.9, text: "Step two: open Backup and Restore in Control Panel, and save the backup on the server." },
    { at: 25.4, text: "Step three: delete the folder, on purpose." },
    { at: 31.0, text: "Step four: choose Restore my files, pick today's backup, and restore it in place." },
    { at: 37.9, text: "Step five: open drive D and check the files are really back." },
    { at: 43.5, text: "Task two: troubleshooting. Every repair follows the same cycle, so you fix the real cause instead of guessing." },
    { at: 52.4, text: "No network? Check the cable first. The tester finds a broken wire, so you replace it." },
    { at: 60.0, text: "An address starting with one sixty-nine means DHCP never answered. Release, renew, then ping." },
    { at: 67.4, text: "Finally, test with the user, and write a service report." },
    { at: 73.5, text: "That's Unit Four. Now do it yourself." },
  ],
};
