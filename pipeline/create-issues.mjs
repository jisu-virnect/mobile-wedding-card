#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const backlogPath = join(here, "backlog.json");
const backlog = JSON.parse(readFileSync(backlogPath, "utf8"));

const issueNumbers = {};

for (const task of backlog.tasks) {
  const checklist = task.acceptance.map((a) => `- [ ] ${a}`).join("\n");
  const body = [
    `**Section**: ${task.section}`,
    "",
    `**Goal**`,
    "",
    task.goal,
    "",
    `**Acceptance**`,
    "",
    checklist,
    "",
    "---",
    `Backlog ID: \`${task.id}\``,
    "Queued by the autonomous pipeline. A PR implementing this task should close this issue.",
  ].join("\n");

  const title = `[${task.id}] ${task.title}`;
  const args = [
    "gh",
    "issue",
    "create",
    "--title",
    JSON.stringify(title),
    "--label",
    "autonomous-task,enhancement",
    "--body",
    JSON.stringify(body),
  ].join(" ");

  console.log(`Creating issue for ${task.id}...`);
  const url = execSync(args, { encoding: "utf8" }).trim();
  const match = url.match(/\/issues\/(\d+)/);
  if (!match) {
    console.error(`Could not parse issue number from: ${url}`);
    process.exit(1);
  }
  issueNumbers[task.id] = Number(match[1]);
  console.log(`  → #${match[1]}`);
}

console.log("\nIssue numbers:");
console.log(JSON.stringify(issueNumbers, null, 2));

// Persist into a small mapping file for later steps
writeFileSync(
  join(here, "issues.json"),
  JSON.stringify(issueNumbers, null, 2) + "\n",
);
console.log("\nWrote pipeline/issues.json");
