#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from "fs";
import path from "path";
import { Schema } from "../src/schema";
import { printSchema } from "graphql";

const schemaPath = path.resolve(__dirname, "../src/schema.graphql");

fs.writeFileSync(schemaPath, printSchema(Schema));

console.log("Wrote " + schemaPath);
