import { neon } from '@neondatabase/serverless';

const DB = 'postgresql://neondb_owner:npg_F9bTgAy1oveM@ep-icy-mud-ann9hjs5-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DB);
const q = (t, v) => sql.query(t, v);

async function main() {
  console.log('Creating auth tables...\n');

  await q(`CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    duration_days INTEGER NOT NULL DEFAULT 30,
    features JSONB DEFAULT '[]',
    badge_color TEXT DEFAULT '#1B2852',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`, []);
  console.log('✓ subscription_plans');

  await q(`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    status TEXT NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
  )`, []);
  console.log('✓ users');

  await q(`CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    payment_ref TEXT,
    amount_paid NUMERIC(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`, []);
  console.log('✓ user_subscriptions');

  await q(`CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`, []);
  console.log('✓ site_settings');

  // Default subscription plans
  await q(`INSERT INTO subscription_plans
    (name, name_ar, description, description_ar, price, duration_days, features, badge_color, sort_order)
  VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9),
    ($10,$11,$12,$13,$14,$15,$16,$17,$18),
    ($19,$20,$21,$22,$23,$24,$25,$26,$27),
    ($28,$29,$30,$31,$32,$33,$34,$35,$36)
  ON CONFLICT DO NOTHING`, [
    'Free Fan','مشجع مجاني','Basic access to news and standings','وصول مجاني للأخبار والترتيب',
    0, 36500, JSON.stringify(['Access to news','View standings','Match results']), '#6B7280', 1,

    'Silver Member','عضو فضي','Monthly membership with exclusive content','عضوية شهرية مع محتوى حصري',
    99, 30, JSON.stringify(['All Free features','Exclusive news','Match highlights','Member badge','Fan Zone access']), '#9CA3AF', 2,

    'Gold Member','عضو ذهبي','Premium quarterly membership','عضوية مميزة ربع سنوية',
    249, 90, JSON.stringify(['All Silver features','Priority support','HD Videos','Gold badge','Early ticket access','10% merchandise discount']), '#FFB81C', 3,

    'VIP Platinum','عضو بلاتيني','Annual VIP membership','عضوية VIP سنوية بكامل الامتيازات',
    799, 365, JSON.stringify(['All Gold features','Stadium VIP access','Meet & Greet players','Signed merchandise','Platinum badge','25% merchandise discount','Exclusive events']), '#C8102E', 4,
  ]);
  console.log('✓ 4 subscription plans');

  // Default site settings
  const settings = [
    ['site_name', 'Ceramica Cleopatra FC'],
    ['site_logo', 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695e73c9350940eda2779d4d/62a3057fb_Ceramica_Cleopatra_FC_logo.png'],
    ['hero_title', 'Welcome to Ceramica Cleopatra FC'],
    ['hero_subtitle', 'Official Football Club Website'],
    ['primary_color', '#1B2852'],
    ['accent_color', '#FFB81C'],
    ['contact_email', 'info@ceramicacleopatrafc.com'],
    ['social_facebook', 'https://facebook.com/ceramicacleopatrafc'],
    ['social_twitter', 'https://twitter.com/ceramicafc'],
    ['social_instagram', 'https://instagram.com/ceramicacleopatrafc'],
    ['social_youtube', 'https://youtube.com/@ceramicacleopatrafc'],
    ['registration_enabled', true],
    ['maintenance_mode', false],
  ];
  for (const [key, val] of settings) {
    await q(`INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, JSON.stringify(val)]);
  }
  console.log('✓ site settings');

  // Admin user — password: Admin@1234 (bcrypt hash)
  await q(`INSERT INTO users (email, password_hash, full_name, role, status, email_verified)
    VALUES ($1,$2,$3,'admin','active',true) ON CONFLICT (email) DO NOTHING`, [
    'admin@ceramicacleopatra.com',
    '$2b$10$rOmGMXwW9LY8LiH6ZYO9oO9mfS8X2kMKEFMeHkVqW.2qYuFMV7H.m',
    'Club Admin',
  ]);
  console.log('✓ admin user: admin@ceramicacleopatra.com / Admin@1234');

  console.log('\n✅ All auth tables ready!');
  process.exit(0);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
