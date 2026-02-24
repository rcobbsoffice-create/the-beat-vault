const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

async function main() {
  const { data, error } = await supabase
    .from("beats")
    .select("id, title, audio_url")
    .limit(5);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Beats:", JSON.stringify(data, null, 2));
  }
}

main();
