#!/usr/bin/env node

import { program } from "commander";
import { auth } from "./commands/auth.js";
import { url, authconfig } from "./commands/config.js";

program
  .name("breezed")
  .description("CLI tool to quickly spin up and manage remote VPSes")
  .version("1.0.0");

program
  .command("auth")
  .description("Log in or sign up to Breezed")
  .action(auth);

const configCmd = program
  .command("config")
  .description("Configure Breezed CLI settings");

const urlCmd = configCmd
  .command("url")
  .description("Manage the Breezed API URL");

urlCmd
  .command("set <url>")
  .description("Set the Breezed API URL")
  .action(url.set);

urlCmd
  .command("get")
  .description("Get the current Breezed API URL")
  .action(url.get);

const authCmd = configCmd
  .command("auth")
  .description("Manage your authorization token");

authCmd
  .command("set <authtoken>")
  .description("Set your authorization token")
  .action(authconfig.set);

authCmd
  .command("get")
  .description("Get the current authorization token")
  .action(authconfig.get);

program.parse();
