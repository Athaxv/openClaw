#!/usr/bin/env bun   
// shebang (run this file with bun runtime)
import { Command } from "commander";
import { runWakeup } from "./wakeup";

const program = new Command()

program
    .name("claw-job")
    .description("Your desktop automater is here")
    .version("0.0.1")

program
    .command("start")
    .description("Choose the option and get started")
    .action(
        async () => {
            await runWakeup()
        }
    );

await program.parseAsync(process.argv)