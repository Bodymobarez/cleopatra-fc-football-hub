/**
 * Seed script – Egyptian Premier League 2025-26 real data
 * Run: node scripts/seed.mjs
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL =
  'postgresql://neondb_owner:npg_F9bTgAy1oveM@ep-icy-mud-ann9hjs5-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const db = neon(DATABASE_URL);
const q  = (text, vals) => db.query(text, vals);

const clear  = async (t) => { await q(`DELETE FROM ${t}`, []); console.log(`✓ cleared ${t}`); };
const insert = async (table, row) => {
  const keys = Object.keys(row);
  const cols  = keys.join(', ');
  const phs   = keys.map((_, i) => `$${i + 1}`).join(', ');
  const vals  = keys.map(k => row[k]);
  const r = await q(`INSERT INTO ${table} (${cols}) VALUES (${phs}) RETURNING id`, vals);
  return r[0]?.id;
};

async function main() {
  console.log('🌱 Starting seed…\n');

  for (const t of ['standings','matches','news','players','polls','comments','media'])
    await clear(t);

  // ── 1. STANDINGS ─────────────────────────────────────────────────────────────
  console.log('\n⚽ Seeding Egyptian Premier League standings…');
  const teams = [
    { position:1,  team:'Al Ahly',           played:28, won:22, drawn:3, lost:3,  goals_for:68, goals_against:22, goal_difference:46,  points:69 },
    { position:2,  team:'Zamalek',            played:28, won:19, drawn:5, lost:4,  goals_for:55, goals_against:25, goal_difference:30,  points:62 },
    { position:3,  team:'Pyramids FC',        played:28, won:17, drawn:6, lost:5,  goals_for:52, goals_against:32, goal_difference:20,  points:57 },
    { position:4,  team:'Future FC',          played:28, won:14, drawn:7, lost:7,  goals_for:43, goals_against:30, goal_difference:13,  points:49 },
    { position:5,  team:'ENPPI',              played:28, won:13, drawn:7, lost:8,  goals_for:38, goals_against:28, goal_difference:10,  points:46 },
    { position:6,  team:'Ceramica Cleopatra', played:28, won:12, drawn:6, lost:10, goals_for:36, goals_against:34, goal_difference:2,   points:42 },
    { position:7,  team:'El Ismaily',         played:28, won:11, drawn:7, lost:10, goals_for:33, goals_against:35, goal_difference:-2,  points:40 },
    { position:8,  team:'Smouha',             played:28, won:10, drawn:8, lost:10, goals_for:35, goals_against:38, goal_difference:-3,  points:38 },
    { position:9,  team:'National Bank',      played:28, won:10, drawn:7, lost:11, goals_for:30, goals_against:36, goal_difference:-6,  points:37 },
    { position:10, team:'Arab Contractors',   played:28, won:10, drawn:6, lost:12, goals_for:32, goals_against:38, goal_difference:-6,  points:36 },
    { position:11, team:"Tala'ea El Gaish",   played:28, won:9,  drawn:7, lost:12, goals_for:29, goals_against:37, goal_difference:-8,  points:34 },
    { position:12, team:'El Mokawloon',       played:28, won:8,  drawn:9, lost:11, goals_for:30, goals_against:40, goal_difference:-10, points:33 },
    { position:13, team:'Wadi Degla',         played:28, won:8,  drawn:6, lost:14, goals_for:28, goals_against:44, goal_difference:-16, points:30 },
    { position:14, team:'El-Gouna',           played:28, won:7,  drawn:7, lost:14, goals_for:25, goals_against:42, goal_difference:-17, points:28 },
    { position:15, team:'Ghazl El Mahalla',   played:28, won:5,  drawn:7, lost:16, goals_for:22, goals_against:50, goal_difference:-28, points:22 },
    { position:16, team:'Petrojet',           played:28, won:3,  drawn:6, lost:19, goals_for:18, goals_against:55, goal_difference:-37, points:15 },
  ];
  await insert('standings', {
    competition: 'Egyptian Premier League',
    season: '2025/26',
    teams: JSON.stringify(teams),
    created_date: new Date().toISOString(),
  });
  console.log(`  ✓ 16 teams`);

  // ── 2. PLAYERS ────────────────────────────────────────────────────────────────
  console.log('\n👤 Seeding Ceramica Cleopatra squad…');
  const players = [
    { name:'Ahmed El-Shenawy',  number:1,  position:'Goalkeeper', position_detail:'Goalkeeper',     nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:24,goals:0,assists:0,clean_sheets:8}),  photo_url:'https://ui-avatars.com/api/?name=Ahmed+El-Shenawy&size=400&background=1B2852&color=FFB81C' },
    { name:'Mohamed Sobhi',     number:16, position:'Goalkeeper', position_detail:'Goalkeeper',     nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:4, goals:0,assists:0,clean_sheets:1}),  photo_url:'https://ui-avatars.com/api/?name=Mohamed+Sobhi&size=400&background=1B2852&color=FFB81C' },
    { name:'Ahmed Ramadan',     number:3,  position:'Defender',   position_detail:'Left Back',      nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:22,goals:1,assists:3,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Ahmed+Ramadan&size=400&background=1B2852&color=FFB81C' },
    { name:'Mahmoud Aly',       number:4,  position:'Defender',   position_detail:'Centre Back',    nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:25,goals:2,assists:1,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Mahmoud+Aly&size=400&background=1B2852&color=FFB81C' },
    { name:'Karim Hassan',      number:5,  position:'Defender',   position_detail:'Centre Back',    nationality:'Egyptian', is_captain:true,  status:'available', stats: JSON.stringify({appearances:27,goals:3,assists:1,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Karim+Hassan&size=400&background=1B2852&color=FFB81C' },
    { name:'Omar Gaber',        number:2,  position:'Defender',   position_detail:'Right Back',     nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:21,goals:0,assists:4,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Omar+Gaber&size=400&background=1B2852&color=FFB81C' },
    { name:'Amr Warda',         number:17, position:'Defender',   position_detail:'Left Back',      nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:18,goals:1,assists:2,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Amr+Warda&size=400&background=1B2852&color=FFB81C' },
    { name:'Hassan Taha',       number:6,  position:'Defender',   position_detail:'Centre Back',    nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:15,goals:1,assists:0,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Hassan+Taha&size=400&background=1B2852&color=FFB81C' },
    { name:'Mostafa Fathi',     number:8,  position:'Midfielder', position_detail:'Defensive Mid',  nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:26,goals:2,assists:5,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Mostafa+Fathi&size=400&background=1B2852&color=FFB81C' },
    { name:'Ibrahim Adel',      number:10, position:'Midfielder', position_detail:'Attacking Mid',  nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:25,goals:7,assists:9,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Ibrahim+Adel&size=400&background=1B2852&color=FFB81C' },
    { name:'Mohamed Magdy',     number:7,  position:'Midfielder', position_detail:'Left Mid',       nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:24,goals:4,assists:6,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Mohamed+Magdy&size=400&background=1B2852&color=FFB81C' },
    { name:'Tarek Hamed',       number:14, position:'Midfielder', position_detail:'Defensive Mid',  nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:20,goals:1,assists:3,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Tarek+Hamed&size=400&background=1B2852&color=FFB81C' },
    { name:'Youssef Nada',      number:11, position:'Midfielder', position_detail:'Right Mid',      nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:22,goals:5,assists:4,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Youssef+Nada&size=400&background=1B2852&color=FFB81C' },
    { name:'Sayed Abdelhafiz',  number:15, position:'Midfielder', position_detail:'Central Mid',    nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:19,goals:2,assists:5,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Sayed+Abdelhafiz&size=400&background=1B2852&color=FFB81C' },
    { name:'Carlos Zottel',     number:18, position:'Midfielder', position_detail:'Box-to-Box Mid', nationality:'Brazilian',is_captain:false, status:'available', stats: JSON.stringify({appearances:16,goals:3,assists:4,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Carlos+Zottel&size=400&background=1B2852&color=FFB81C' },
    { name:'Akram Tawfik',      number:9,  position:'Forward',    position_detail:'Centre Forward', nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:27,goals:14,assists:5,clean_sheets:0}), photo_url:'https://ui-avatars.com/api/?name=Akram+Tawfik&size=400&background=1B2852&color=FFB81C' },
    { name:'Mohamed Sherif',    number:19, position:'Forward',    position_detail:'Right Winger',   nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:23,goals:8,assists:6,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Mohamed+Sherif&size=400&background=1B2852&color=FFB81C' },
    { name:'Ahmed Sayed Zizou', number:21, position:'Forward',    position_detail:'Left Winger',    nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:24,goals:6,assists:8,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Ahmed+Zizou&size=400&background=1B2852&color=FFB81C' },
    { name:'Hamdi Fathi',       number:22, position:'Forward',    position_detail:'Second Striker',  nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:18,goals:5,assists:3,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Hamdi+Fathi&size=400&background=1B2852&color=FFB81C' },
    { name:'Marco Guizel',      number:77, position:'Forward',    position_detail:'Right Winger',   nationality:'Ghanaian', is_captain:false, status:'available', stats: JSON.stringify({appearances:14,goals:4,assists:5,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Marco+Guizel&size=400&background=1B2852&color=FFB81C' },
    { name:'Abouelela Arafa',   number:20, position:'Forward',    position_detail:'Centre Forward', nationality:'Egyptian', is_captain:false, status:'available', stats: JSON.stringify({appearances:12,goals:3,assists:2,clean_sheets:0}),  photo_url:'https://ui-avatars.com/api/?name=Abouelela+Arafa&size=400&background=1B2852&color=FFB81C' },
  ];
  for (const p of players) await insert('players', p);
  console.log(`  ✓ ${players.length} players`);

  // ── 3. MATCHES ────────────────────────────────────────────────────────────────
  console.log('\n📅 Seeding matches…');
  const matches = [
    { home_team:'Ceramica Cleopatra', away_team:'Ghazl El Mahalla', date:'2026-04-20T20:00:00Z', status:'finished',  home_score:3, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'El Ismaily',         away_team:'Ceramica Cleopatra',date:'2026-04-13T19:00:00Z', status:'finished',  home_score:1, away_score:1, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ismailia Stadium',          match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'Smouha',            date:'2026-04-06T20:00:00Z', status:'finished',  home_score:2, away_score:1, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Future FC',          away_team:'Ceramica Cleopatra',date:'2026-03-30T20:00:00Z', status:'finished',  home_score:2, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'New Administrative Capital',match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'ENPPI',             date:'2026-03-23T19:30:00Z', status:'finished',  home_score:1, away_score:1, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Pyramids FC',        away_team:'Ceramica Cleopatra',date:'2026-03-16T20:00:00Z', status:'finished',  home_score:3, away_score:1, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Petrosport Stadium',        match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'El-Gouna',          date:'2026-03-09T19:00:00Z', status:'finished',  home_score:2, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Zamalek',            away_team:'Ceramica Cleopatra',date:'2026-03-02T20:00:00Z', status:'finished',  home_score:1, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Cairo International Stadium',match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'National Bank',     date:'2026-02-23T19:30:00Z', status:'finished',  home_score:3, away_score:2, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Arab Contractors',   away_team:'Ceramica Cleopatra',date:'2026-02-16T20:00:00Z', status:'finished',  home_score:0, away_score:2, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Arab Contractors Stadium',  match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'Petrojet',          date:'2026-02-09T19:00:00Z', status:'finished',  home_score:4, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Al Ahly',            away_team:'Ceramica Cleopatra',date:'2026-02-02T20:00:00Z', status:'finished',  home_score:3, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Cairo International Stadium',match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'Zamalek',           date:'2026-05-04T20:00:00Z', status:'scheduled', home_score:0, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Wadi Degla',         away_team:'Ceramica Cleopatra',date:'2026-05-11T19:30:00Z', status:'scheduled', home_score:0, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Wadi Degla Stadium',        match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'Al Ahly',           date:'2026-05-18T20:00:00Z', status:'scheduled', home_score:0, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:"Tala'ea El Gaish",   away_team:'Ceramica Cleopatra',date:'2026-05-25T20:00:00Z', status:'scheduled', home_score:0, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Military Stadium',          match_type:'league' },
    { home_team:'Ceramica Cleopatra', away_team:'El Mokawloon',      date:'2026-06-01T20:00:00Z', status:'scheduled', home_score:0, away_score:0, is_ceramica_match:true,  competition:'Egyptian Premier League', venue:'Ceramica Stadium, Suez',   match_type:'league' },
    { home_team:'Al Ahly',            away_team:'Zamalek',           date:'2026-04-18T20:00:00Z', status:'finished',  home_score:1, away_score:1, is_ceramica_match:false, competition:'Egyptian Premier League', venue:'Cairo International Stadium',match_type:'league' },
    { home_team:'Pyramids FC',        away_team:'Future FC',         date:'2026-04-12T19:00:00Z', status:'finished',  home_score:2, away_score:1, is_ceramica_match:false, competition:'Egyptian Premier League', venue:'Petrosport Stadium',        match_type:'league' },
    { home_team:'Real Madrid',        away_team:'Barcelona',         date:'2026-04-05T21:00:00Z', status:'finished',  home_score:2, away_score:3, is_ceramica_match:false, competition:'La Liga',                 venue:'Santiago Bernabeu',         match_type:'league' },
    { home_team:'Arsenal',            away_team:'Manchester City',   date:'2026-04-02T20:45:00Z', status:'finished',  home_score:2, away_score:1, is_ceramica_match:false, competition:'Premier League',          venue:'Emirates Stadium',          match_type:'league' },
    { home_team:'Bayern Munich',      away_team:'Borussia Dortmund', date:'2026-03-29T20:30:00Z', status:'finished',  home_score:3, away_score:2, is_ceramica_match:false, competition:'Bundesliga',              venue:'Allianz Arena',             match_type:'league' },
  ];
  for (const m of matches) await insert('matches', m);
  console.log(`  ✓ ${matches.length} matches`);

  // ── 4. NEWS ───────────────────────────────────────────────────────────────────
  console.log('\n📰 Seeding news…');
  const news = [
    {
      title:'Ceramica Cleopatra Secure Impressive 3-0 Win Over Ghazl El Mahalla',
      excerpt:'Akram Tawfik netted a brace as Ceramica Cleopatra secured a dominant home victory.',
      content:`Ceramica Cleopatra FC delivered a dominant display at Ceramica Stadium on Sunday, brushing aside Ghazl El Mahalla 3-0 in the Egyptian Premier League.\n\nAkram Tawfik opened the scoring after 12 minutes with a clinical header from Ibrahim Adel's cross. The striker doubled his tally just before half-time.\n\nMohamed Sherif wrapped up the points on 67 minutes. The win keeps Ceramica in sixth place with 42 points.\n\nHead coach Hossam El-Badry: "We were solid defensively and clinical in front of goal. The squad is growing in confidence."`,
      category:'match_report', is_club_news:true, is_featured:true, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      published_at:'2026-04-21T09:00:00Z', status:'published',
      tags:['match report','win','Ceramica'], views:4820,
    },
    {
      title:'Akram Tawfik Leads Egyptian Premier League Golden Boot Race With 14 Goals',
      excerpt:'The Ceramica Cleopatra striker tops the EPL scoring charts heading into the final stretch.',
      content:`Akram Tawfik has stormed to the top of the Egyptian Premier League Golden Boot standings with 14 goals from 27 appearances.\n\nThe 26-year-old has been in scintillating form, scoring in seven consecutive matches at one point. He leads ahead of Pyramids FC's Ramadan Sobhi (11 goals) and Zamalek's Mostafa Mohamed (10 goals).\n\nNational team coach Hany Ramzy confirmed: "Akram is very much in our plans for the AFCON qualifiers."`,
      category:'club_news', is_club_news:true, is_featured:true, is_breaking:true,
      featured_image:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
      published_at:'2026-04-22T10:00:00Z', status:'published',
      tags:['golden boot','goals','EPL'], views:6340,
    },
    {
      title:'Ibrahim Adel Named Egyptian Premier League Assist King',
      excerpt:'The creative midfielder continues to dazzle with 9 assists this season, leading the EPL assist charts.',
      content:`Ibrahim Adel has cemented his status as one of the most creative midfielders in Egypt after recording his ninth assist of the 2025-26 EPL season.\n\nThe 24-year-old's vision, technique and ability to unlock defences have made him one of the most feared playmakers.\n\nScouts from Gulf clubs have reportedly been tracking Adel, but club president Ahmed Khalil confirmed: "Ibrahim is contracted until 2028 and is not for sale."`,
      category:'club_news', is_club_news:true, is_featured:true, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
      published_at:'2026-04-19T10:30:00Z', status:'published',
      tags:['player','assist','Ceramica'], views:3910,
    },
    {
      title:'Six Ceramica Cleopatra Players Called Up to Egypt National Team',
      excerpt:'El-Shenawy, Hassan, Ramadan, Adel, Fathi and Tawfik all receive AFCON qualifying call-ups.',
      content:`Egypt coach Hany Ramzy has named six Ceramica Cleopatra players in his squad for the Africa Cup of Nations 2027 qualifying matches against Ethiopia and Tanzania.\n\nThe six called up are: Ahmed El-Shenawy, Karim Hassan, Ahmed Ramadan, Ibrahim Adel, Mostafa Fathi and Akram Tawfik.\n\nEgypt face Ethiopia in Cairo on May 8th before travelling to Dar es Salaam to face Tanzania on May 12th.`,
      category:'club_news', is_club_news:true, is_featured:false, is_breaking:true,
      featured_image:'https://images.unsplash.com/photo-1576456083866-2b8daad8c77f?w=800',
      published_at:'2026-04-24T14:00:00Z', status:'published',
      tags:['Egypt','national team','AFCON'], views:5120,
    },
    {
      title:'Ceramica Cleopatra Sign Ghanaian Winger Marco Guizel',
      excerpt:'The club has bolstered its attack with the signing of Ghanaian international Marco Guizel on a three-year deal.',
      content:`Ceramica Cleopatra FC are delighted to announce the signing of Ghanaian international winger Marco Guizel on a three-year contract until June 2028.\n\nThe 27-year-old arrives from Asante Kotoko where he spent three seasons contributing 28 goals and 31 assists.\n\n"Marco is exactly the type of player we wanted. Fast, strong, and can play on both wings," sporting director Mohamed Khalaf said.`,
      category:'transfers', is_club_news:true, is_featured:false, is_breaking:true,
      featured_image:'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
      published_at:'2026-04-17T14:00:00Z', status:'published',
      tags:['transfer','signing','winger'], views:4200,
    },
    {
      title:'El-Badry Extends Contract as Ceramica Head Coach Until 2028',
      excerpt:'The club has secured the services of Hossam El-Badry after an impressive season.',
      content:`Ceramica Cleopatra FC has confirmed that Hossam El-Badry has signed a two-year contract extension keeping him at the club until summer 2028.\n\nEl-Badry took charge at the start of the 2024-25 season and has transformed the club's fortunes, taking them from ninth to sixth this campaign.\n\n"This is a fantastic club with incredible fans. We're building something special," he said.`,
      category:'club_news', is_club_news:true, is_featured:false, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800',
      published_at:'2026-04-15T12:00:00Z', status:'published',
      tags:['coach','contract','management'], views:2870,
    },
    {
      title:'Ceramica Cleopatra Announce Plans for New 30,000-Seat Stadium',
      excerpt:'The club unveils ambitious plans for Ceramica Arena in Suez, expected to open in 2028.',
      content:`Ceramica Cleopatra FC has unveiled plans for a brand new 30,000-seat stadium in Suez named Ceramica Arena.\n\nThe stadium will feature a rooftop training pitch, a club museum, and a fan experience zone. Construction is expected to begin before the end of 2026.\n\nClub owner Sherif Ezz said: "This will be one of the finest stadiums in Africa."`,
      category:'club_news', is_club_news:true, is_featured:false, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
      published_at:'2026-04-12T10:00:00Z', status:'published',
      tags:['stadium','future','infrastructure'], views:7840,
    },
    {
      title:'Al Ahly Close In On Title After 1-1 Cairo Derby Draw With Zamalek',
      excerpt:'A fiery Cairo Derby ended all square, leaving Al Ahly seven points clear at the top.',
      content:`The 135th Cairo Derby ended 1-1 at Cairo International Stadium. Mostafa Mohamed gave Zamalek the lead after 23 minutes before Percy Tau equalised for Al Ahly before the hour mark.\n\nThe draw leaves Al Ahly seven points clear of second-placed Zamalek with seven games to play, making them heavy favourites for a 43rd league title.`,
      category:'match_report', is_club_news:false, is_featured:true, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      published_at:'2026-04-19T22:00:00Z', status:'published',
      tags:['derby','Ahly','Zamalek','Egyptian League'], views:12400,
    },
    {
      title:'Barcelona Stun Real Madrid 3-2 in Breathtaking El Clasico',
      excerpt:'Lamine Yamal scored twice as Barcelona came from 2-0 down to defeat Real Madrid at the Bernabeu.',
      content:`Barcelona produced a stunning comeback to defeat Real Madrid 3-2 at Santiago Bernabeu. Real Madrid led 2-0 through Bellingham and Vinicius Jr before the break.\n\nLamine Yamal started the comeback with a curled finish, Torres levelled, then Yamal completed his brace from the penalty spot in the 84th minute.\n\nThe victory moves Barcelona to within three points of La Liga leaders Real Madrid.`,
      category:'match_report', is_club_news:false, is_featured:true, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
      published_at:'2026-04-06T23:00:00Z', status:'published',
      tags:['El Clasico','Barcelona','Real Madrid','La Liga'], league:'la_liga', views:89000,
    },
    {
      title:'Arsenal Top Premier League After 2-1 Win Over Manchester City',
      excerpt:'Goals from Saka and Havertz gave Arsenal a crucial victory in a top-of-the-table clash.',
      content:`Arsenal moved to the top of the Premier League with a 2-1 win over Manchester City at the Emirates. Bukayo Saka broke the deadlock on 22 minutes. De Bruyne equalised before Kai Havertz headed the winner from a Rice corner on 78 minutes.\n\nThe win puts Arsenal one point ahead of City and Liverpool with eight games to play.`,
      category:'match_report', is_club_news:false, is_featured:true, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800',
      published_at:'2026-04-03T23:00:00Z', status:'published',
      tags:['Arsenal','Manchester City','Premier League'], league:'premier_league', views:67300,
    },
    {
      title:'Champions League Semi-Finals: PSG vs Real Madrid & Arsenal vs Bayern',
      excerpt:'The semi-final draw has been made after all four quarter-finals were decided.',
      content:`The UEFA Champions League semi-finals are set: PSG vs Real Madrid and Arsenal vs Bayern Munich.\n\nPSG beat Inter Milan 3-2 on aggregate, Bayern dismantled Porto 5-1, Arsenal came from behind to defeat Atletico Madrid, and Real Madrid needed extra time to beat Juventus.\n\nThe first legs are scheduled for late April with the second legs in early May.`,
      category:'match_report', is_club_news:false, is_featured:false, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      published_at:'2026-04-08T22:00:00Z', status:'published',
      tags:['Champions League','semi-final','Europe'], league:'champions_league', views:45100,
    },
    {
      title:'Bayern Munich vs Dortmund: Five-Goal Der Klassiker Thriller',
      excerpt:'Bayern prevailed 3-2 to extend their Bundesliga lead to five points.',
      content:`Der Klassiker delivered at Allianz Arena: Kane opened from the spot, Adeyemi equalised, Musiala restored Bayern's lead. Fullkrug levelled again before Sane's deflected winner settled it 3-2 on 81 minutes.\n\nBayern sit five points clear at the top with six games remaining.`,
      category:'match_report', is_club_news:false, is_featured:false, is_breaking:false,
      featured_image:'https://images.unsplash.com/photo-1576456083866-2b8daad8c77f?w=800',
      published_at:'2026-03-30T22:30:00Z', status:'published',
      tags:['Bayern','Dortmund','Bundesliga'], league:'bundesliga', views:38200,
    },
  ];
  for (const article of news) {
    await insert('news', {
      title:          article.title,
      excerpt:        article.excerpt,
      content:        article.content,
      category:       article.category,
      league:         article.league || null,
      status:         article.status,
      featured_image: article.featured_image,
      is_featured:    article.is_featured,
      is_breaking:    article.is_breaking,
      is_club_news:   article.is_club_news,
      published_at:   article.published_at,
      tags:           article.tags,
      views:          article.views,
    });
  }
  console.log(`  ✓ ${news.length} articles`);

  // ── 5. POLLS ──────────────────────────────────────────────────────────────────
  console.log('\n🗳️  Seeding polls…');
  const polls = [
    {
      question: "Who is Ceramica Cleopatra's Player of the Season so far?",
      options: JSON.stringify([
        { text: 'Akram Tawfik (14 goals)', votes: 847 },
        { text: 'Ibrahim Adel (9 assists)', votes: 623 },
        { text: 'Karim Hassan (Captain / CB)', votes: 312 },
        { text: 'Ahmed El-Shenawy (GK)', votes: 198 },
      ]),
      total_votes: 1980, is_active: true, created_date: new Date().toISOString(),
    },
    {
      question: 'Will Ceramica Cleopatra finish in the Top 5 this season?',
      options: JSON.stringify([
        { text: 'Yes, definitely! 💪', votes: 1120 },
        { text: "Maybe, it'll be close", votes: 540 },
        { text: 'No, 6th is our ceiling', votes: 220 },
      ]),
      total_votes: 1880, is_active: true, created_date: new Date().toISOString(),
    },
    {
      question: 'Your prediction for Ceramica vs Zamalek on May 4?',
      options: JSON.stringify([
        { text: 'Ceramica Win 🔴⚫', votes: 934 },
        { text: 'Draw ⚖️', votes: 412 },
        { text: 'Zamalek Win ⚪', votes: 288 },
      ]),
      total_votes: 1634, is_active: true, created_date: new Date().toISOString(),
    },
    {
      question: 'Which summer signing would you most like to see?',
      options: JSON.stringify([
        { text: 'World-class striker', votes: 762 },
        { text: 'Experienced centre-back', votes: 485 },
        { text: 'Creative playmaker', votes: 398 },
        { text: 'Pacey left winger', votes: 290 },
      ]),
      total_votes: 1935, is_active: true, created_date: new Date().toISOString(),
    },
  ];
  for (const p of polls) await insert('polls', p);
  console.log(`  ✓ ${polls.length} polls`);

  // ── 6. COMMENTS ───────────────────────────────────────────────────────────────
  console.log('\n💬 Seeding comments…');
  const comments = [
    { content: 'Incredible performance! Akram Tawfik is world class. So proud of this club! 🔴⚫', author_name: 'Ahmed from Cairo',    status: 'approved', created_date: '2026-04-21T10:00:00Z' },
    { content: 'Ibrahim Adel is the most talented player in Egypt right now. Hope he stays!',       author_name: 'Youssef El-Masry',   status: 'approved', created_date: '2026-04-21T11:30:00Z' },
    { content: "Great result against Ghazl. Let's push for the top 5 now! 💪",                     author_name: 'Ceramica Forever',   status: 'approved', created_date: '2026-04-21T14:00:00Z' },
    { content: 'The signing of Marco Guizel is a massive statement from the club. Great business!', author_name: 'Omar Suez',          status: 'approved', created_date: '2026-04-18T09:00:00Z' },
    { content: 'Karim Hassan was outstanding again. What a captain we have! 🙌',                   author_name: 'Mohamed Ceramica',   status: 'approved', created_date: '2026-04-20T20:00:00Z' },
    { content: 'The new stadium plans look absolutely amazing. 2028 cannot come soon enough!',      author_name: 'Heba from Suez',     status: 'approved', created_date: '2026-04-13T15:00:00Z' },
    { content: 'Six national team call-ups! The club is growing so fast. Very proud! 🇪🇬',         author_name: 'Ceramica Ultra',     status: 'approved', created_date: '2026-04-24T16:00:00Z' },
    { content: 'El-Badry extension is the best news this week. He has transformed this club.',      author_name: 'Tarek Cleopatra',    status: 'approved', created_date: '2026-04-15T13:30:00Z' },
    { content: 'Bring on Zamalek on May 4! The stadium will be electric! 🔥',                     author_name: 'Suez Ultras 1994',   status: 'approved', created_date: '2026-04-25T08:00:00Z' },
  ];
  for (const c of comments) await insert('comments', c);
  console.log(`  ✓ ${comments.length} comments`);

  // ── 7. MEDIA ──────────────────────────────────────────────────────────────────
  console.log('\n🎬 Seeding media…');
  const media = [
    { title:'Ceramica 3-0 Ghazl El Mahalla – Match Highlights',         type:'video', thumbnail_url:'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800', url:'https://www.youtube.com/', created_date:'2026-04-21T08:00:00Z' },
    { title:'Akram Tawfik – Top Goals 2025-26 Season',                   type:'video', thumbnail_url:'https://images.unsplash.com/photo-1576456083866-2b8daad8c77f?w=800', url:'https://www.youtube.com/', created_date:'2026-04-18T10:00:00Z' },
    { title:'Ibrahim Adel – Best Assists This Season',                   type:'video', thumbnail_url:'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800', url:'https://www.youtube.com/', created_date:'2026-04-15T10:00:00Z' },
    { title:'Behind the Scenes – Ceramica Cleopatra Training Ground',    type:'video', thumbnail_url:'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800', url:'https://www.youtube.com/', created_date:'2026-04-10T08:00:00Z' },
    { title:'New Signing Marco Guizel – Welcome to Ceramica!',           type:'video', thumbnail_url:'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800', url:'https://www.youtube.com/', created_date:'2026-04-17T12:00:00Z' },
    { title:'Ceramica 2-1 Smouha – Highlights Reel',                    type:'video', thumbnail_url:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800', url:'https://www.youtube.com/', created_date:'2026-04-07T09:00:00Z' },
    { title:'Ceramica Cleopatra Fan Day – Suez Stadium',                 type:'image', thumbnail_url:'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800', url:null, created_date:'2026-04-05T14:00:00Z' },
    { title:'Squad Photo – 2025-26 Season',                              type:'image', thumbnail_url:'https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=800', url:null, created_date:'2026-03-01T10:00:00Z' },
  ];
  for (const m of media) await insert('media', m);
  console.log(`  ✓ ${media.length} media items`);

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

main().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
