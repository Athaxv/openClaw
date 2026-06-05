import { confirm, isCancel, text } from "@clack/prompts"
import { createAgentTools } from "./agent-tools";
import { ToolExecutor } from "../agent/tool-executor";
import { defaultAgentConfig } from "../agent/types";
import { ActionTracker } from "../agent/action-tracker";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getAgentModel } from "../../ai/ai.config";
import { renderTerminalMarkdown } from "../../terminal-md";
import { runApprovalFlow } from "../agent/run-approval";

function asMd(question: string, answer: string): string {
    return `# Ask Mode\n\n## Question\n\n${question.trim()}\n\n## Answer\n\n${answer.trim()}\n`;
}

export async function runAskMode() {
    console.log('\n Ask Mode \n')

    const goal = await text({
        message: "What would you like to Ask?",
        placeholder: "Plan here..."
    })

    if (isCancel(goal) || !goal.trim()) return;

    const config = defaultAgentConfig()
    config.tools.allowFileCreation = true;
    config.tools.allowFileModification = false;
    config.tools.allowFolderCreation = false;
    config.tools.allowShellExecution = true;

    const tracker = new ActionTracker();
    const executor = new ToolExecutor(tracker, config)
    const tools = createAgentTools(executor)

    const agent = new ToolLoopAgent({
        model: getAgentModel(),
        stopWhen: stepCountIs(20),
        tools
    })

    const result = await agent.generate({ prompt: goal.trim() })
    const answer = result?.text?.trim() || "(no answer)";

    console.log(renderTerminalMarkdown(answer))

    const wantsSave = await confirm({
        message: "Save this answer to a .md file in the current directory?",
        initialValue: false,
    });

    if (isCancel(wantsSave) || !wantsSave) return;

    const filename = await text({
        message: "Filename",
        initialValue: "ask.md",
        validate: (v) => {
            const s = (v ?? '').trim();
            if (!s) return 'Required';
            if (s.includes('..') || s.includes('/') || s.includes('\\')) return 'No paths';
            if (!s.toLowerCase().endsWith('.md')) return 'Must end with .md';
        },
    })

    if (isCancel(filename)) return;

    executor.createFile(filename, asMd(goal, answer));
    const ok = await runApprovalFlow(tracker);
    if (!ok) return executor.clearStaging();

    executor.applyApprovedFromTracker();
    executor.clearStaging();
}