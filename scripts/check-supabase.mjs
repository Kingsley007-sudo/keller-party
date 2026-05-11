import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const content = readFileSync(envPath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmedLine.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      const value = trimmedLine.slice(separatorIndex + 1).trim();

      if (key && !process.env[key]) {
        process.env[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    throw new Error("Missing .env.local in the project root.");
  }
}

loadLocalEnv();

const requiredVariables = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
  "SESSION_SECRET"
];

const missingVariables = requiredVariables.filter(
  (variableName) => !process.env[variableName]
);

if (missingVariables.length > 0) {
  throw new Error(`Missing environment variables: ${missingVariables.join(", ")}`);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const { count, error } = await supabase
  .from("registrations")
  .select("id", { count: "exact", head: true });

if (error) {
  throw new Error(`Supabase check failed: ${error.message}`);
}

const { error: schemaError } = await supabase
  .from("registrations")
  .select("email, phone_number_normalized, instagram_name_normalized", { head: true })
  .limit(1);

if (schemaError) {
  throw new Error(
    `Supabase schema check failed: ${schemaError.message}. Re-run supabase/schema.sql.`
  );
}

console.log(`Supabase connection OK. registrations rows: ${count ?? 0}`);
