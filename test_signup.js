const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const email = 'test' + Date.now() + '@example.com';
  const password = 'password123';
  console.log("Signing up...");
  let res = await supabase.auth.signUp({ email, password });
  console.log("First signup:", res.error?.message || "Success");
  console.log("Has session:", !!res.data.session);

  console.log("Signing up again with same email...");
  let res2 = await supabase.auth.signUp({ email, password });
  console.log("Second signup error:", res2.error?.message || "Success (NO ERROR)");
  console.log("Has session:", !!res2.data.session);
  console.log("Fake user object?", !!res2.data.user);
}
run();
