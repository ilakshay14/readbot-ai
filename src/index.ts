import { Command } from "commander";
import { init } from "./commands/init.js";
import { config } from "./commands/config.js";
import { uninstall } from "./commands/uninstall.js";

const program = new Command();

program
  .name("readbot")
  .description("Give any AI coding tool newsletter digest commands")
  .version("0.1.0");

program
  .command("init")
  .description("Set up ReadBot — install Himalaya, configure email, drop commands")
  .action(init);

program
  .command("config")
  .description("Re-configure email credentials")
  .action(config);

program
  .command("uninstall")
  .description("Remove ReadBot command files")
  .action(uninstall);

program.parse();
