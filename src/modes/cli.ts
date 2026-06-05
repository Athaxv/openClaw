import { isCancel, select } from "@clack/prompts";
import chalk from "chalk";
import { runAgentMode } from "./agent/orchestrator";
import { runAskMode } from "./ask/orchestrator";

export async function runCliMode(){
    while(true){
        const mode = await select({
            message: "Choose CLI sub-mode",
            options: [
                { value: "agent", label: "Agent" },
                { value: "plan", label: "Plan" },
                { value: "ask", label: "Ask" },
                { value: "back", label: "Back to main menu" },
            ]
        })
    
        if (isCancel(mode) || mode === "back") return;
    
        if (mode == "agent"){
            await runAgentMode();
        }
        if (mode == "plan"){
            
        }
        if (mode == "ask"){
            await runAskMode();
        }
    }


}