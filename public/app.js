/* =============================================
   NORMIE HIGH YEARBOOK — APP LOGIC
   ============================================= */

const PAGE_SIZE = 48;
let currentPage = 0; // 0-indexed
const TOTAL = 10000;
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

// Cache traits in session so we don't re-fetch
const traitCache = {};

// =============================================
// NAME GENERATOR — deterministic from ID
// =============================================
// 100 globally diverse first names — Asia, Africa, Europe, Americas, Pacific
const FIRST_NAMES = [
  // East Asia (14)
  'Haruto', 'Yuki', 'Sakura', 'Kenji', 'Aiko', 'Ryu', 'Nami',
  'Wei', 'Lin', 'Mei', 'Jian', 'Bo',
  'Minjun', 'Soyeon',
  // South & Southeast Asia (11)
  'Arjun', 'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sanjay', 'Divya',
  'Kai', 'Thuy', 'Linh', 'Surya',
  // Middle East & North Africa (9)
  'Omar', 'Layla', 'Tariq', 'Fatima', 'Khalid',
  'Karim', 'Nadia', 'Yasmin', 'Hamid',
  // West Africa (9)
  'Chidi', 'Amara', 'Emeka', 'Ngozi', 'Kwame',
  'Abena', 'Kofi', 'Adaeze', 'Yaw',
  // East & South Africa (9)
  'Makena', 'Tendai', 'Zuri', 'Jabari',
  'Themba', 'Nomsa', 'Sipho', 'Akinyi', 'Chukwu',
  // Western Europe (14)
  'Emma', 'Sophie', 'Hugo', 'Camille', 'Margot', 'Louis', 'Alice',
  'Luca', 'Isabella', 'Marco', 'Giulia', 'Rafael', 'Diego', 'Elena',
  // Northern & Eastern Europe (10)
  'Felix', 'Lars', 'Astrid', 'Sven', 'Ingrid',
  'Sasha', 'Mila', 'Ivan', 'Anya', 'Dmitri',
  // Latin America (14)
  'Mateo', 'Valentina', 'Sebastian', 'Camila', 'Andres',
  'Lucia', 'Catalina', 'Miguel', 'Rosa', 'Gabriel',
  'Clara', 'Lucas', 'Sofia', 'Ana',
  // North America (8)
  'Tyler', 'Madison', 'Hunter', 'Brandon',
  'Kayla', 'Austin', 'Chelsea', 'Cody',
  // Pacific & Indigenous (2 — brings total to exactly 100)
  'Koa', 'Moana',
];

// 100 last names — mix of real cultural surnames + crypto-flavored fun ones
const LAST_NAMES = [
  // Japan (5)
  'Tanaka', 'Yamamoto', 'Watanabe', 'Nakamura', 'Sato',
  // China (5)
  'Chen', 'Zhang', 'Liu', 'Wang', 'Wu',
  // Korea (4)
  'Kim', 'Park', 'Choi', 'Jung',
  // India (5)
  'Sharma', 'Patel', 'Singh', 'Mehta', 'Nair',
  // Arabic / Middle East (8)
  'Al-Rashid', 'Hassan', 'Ali', 'Umar', 'Hussein', 'Mansour', 'Khalil', 'Aziz',
  // West Africa (6)
  'Okonkwo', 'Mensah', 'Diallo', 'Eze', 'Asante', 'Boateng',
  // East & South Africa (6)
  'Mwangi', 'Kamau', 'Dlamini', 'Nkosi', 'Molefe', 'Odhiambo',
  // North Africa (4)
  'Benali', 'Hadid', 'Toure', 'Bensalah',
  // France (5)
  'Dubois', 'Laurent', 'Moreau', 'Lefebvre', 'Leroy',
  // Germany / Austria (5)
  'Mueller', 'Fischer', 'Wagner', 'Weber', 'Becker',
  // Italy (5)
  'Rossi', 'Ferrari', 'Bianchi', 'Colombo', 'Ricci',
  // Spain / Portugal (5)
  'Garcia', 'Martinez', 'Rodrigues', 'Herrera', 'Castillo',
  // Nordic (5)
  'Andersen', 'Johansson', 'Eriksson', 'Lindqvist', 'Bergstrom',
  // Eastern Europe (5)
  'Volkov', 'Petrov', 'Kowalski', 'Novak', 'Popescu',
  // Latin America (5)
  'Ramirez', 'Flores', 'Morales', 'Vargas', 'Medina',
  // Crypto-flavored fun surnames (25 — brings total to exactly 100)
  'Tokenheimer', 'Blocksworth', 'Mintington', 'Hodlsby', 'Chainsworth',
  'Walletman', 'DegenSmith', 'Wagmington', 'Lambostein', 'Yieldsworth',
  'Paperhands', 'Diamondsworth', 'Bullrunner', 'Satoshiton', 'Whalesworth',
  'Daosworth', 'Permabull', 'Fomobaron', 'Moongate', 'Normington',
  'Cryptoson', 'Pixelsworth',
];

// Bijective shuffle: multiply by 1003 (coprime to 10000) so consecutive IDs
// get DIFFERENT last names — no more 100-in-a-row same surname visible on a page
function generateName(id) {
  const shuffled = (id * 1003) % 10000;
  const first = FIRST_NAMES[shuffled % 100];
  const last  = LAST_NAMES[Math.floor(shuffled / 100)];
  return `${first} ${last}`;
}

// =============================================
// GENDER & TYPE-AWARE NAME POOLS (used in modal only — traits required)
// =============================================

// 50 unambiguously male first names — globally diverse
const MALE_FIRST = [
  // East Asia (10)
  'Haruto','Kenji','Ryu','Wei','Jian','Bo','Minjun','Takeshi','Hiroshi','Ryusei',
  // South & Southeast Asia (8)
  'Arjun','Rahul','Vikram','Sanjay','Surya','Rohan','Kabir','Pradeep',
  // Middle East (6)
  'Omar','Tariq','Khalid','Karim','Hamid','Yusuf',
  // West Africa (6)
  'Chidi','Emeka','Kwame','Kofi','Yaw','Tunde',
  // East & South Africa (4)
  'Jabari','Themba','Sipho','Tendai',
  // Western Europe (8)
  'Hugo','Louis','Luca','Marco','Rafael','Diego','Felix','Lars',
  // Eastern Europe (4)
  'Sven','Ivan','Dmitri','Aleksandr',
  // Latin America (4)
  'Mateo','Sebastian','Andres','Gabriel',
];

// 50 unambiguously female first names — globally diverse
const FEMALE_FIRST = [
  // East Asia (10)
  'Yuki','Sakura','Aiko','Nami','Lin','Mei','Soyeon','Akiko','Hana','Yuna',
  // South & Southeast Asia (8)
  'Priya','Ananya','Divya','Thuy','Linh','Meera','Pooja','Sita',
  // Middle East (6)
  'Layla','Fatima','Nadia','Yasmin','Hind','Salma',
  // West Africa (6)
  'Amara','Ngozi','Abena','Adaeze','Ama','Chidinma',
  // East & South Africa (4)
  'Makena','Zuri','Nomsa','Akinyi',
  // Western Europe (8)
  'Emma','Sophie','Camille','Margot','Alice','Isabella','Giulia','Elena',
  // Eastern Europe (4)
  'Astrid','Ingrid','Mila','Anya',
  // Latin America (4)
  'Valentina','Camila','Lucia','Rosa',
];

// 50 gender-neutral / non-binary first names
const NB_FIRST = [
  'Kai','River','Sage','Quinn','Avery','Rowan','Morgan','Finley','Hayden','Skyler',
  'Blake','Reese','Jordan','Taylor','Parker','Casey','Alex','Drew','Cameron','Peyton',
  'Remy','Wren','Robin','Elliot','Emery','Ash','Ren','Noel','Sable','Lark',
  'Reed','Kit','Cleo','Cypress','Sol','Zephyr','Cyan','Indigo','Moss','Fern',
  'Joss','Lennox','Marlowe','Vesper','Caden','Orion','Soren','Lyric','Briar','Onyx',
];

// Agent Normies — AI model names (no surname needed)
const AGENT_NAMES = [
  'GPT-5','GPT-4o','Claude-4','Gemini-2','Llama-3','Grok-2','Mistral-X','Falcon-180',
  'Phi-4','DeepSeek-R2','Qwen-2.5','Mixtral-8x22','WizardLM-3','Yi-34B','Command-R+',
  'GPT-4 Turbo','Claude-3.5','Gemini-1.5','Perplexity-8','Cohere-R','Solar-10.7',
  'DBRX','Jamba-1.5','Orca-3','Zephyr-7B','Beluga-2','Platypus-2','Airoboros-70B',
  'NeuralChat-7B','Dolphin-2.6',
];

// Alien Normies — alien-sounding first and last names
const ALIEN_FIRST = [
  'Shlorrp','Blixar','Vreel','Zogg','Klaxxon','Xorb','Flargh','Nzzt','Phlox','Glurb',
  'Twizzak','Vexor','Blorpax','Qruu','Sklynn','Zyvax','Mrrgh','Draxil','Fnork','Klurp',
  'Xarb','Gloop','Snorvin','Tlax','Vrrrg','Zylph','Blooze','Qwazz','Floob','Snixxle',
];
const ALIEN_LAST = [
  'Zoggax','Blork','Vrxxl','Klaxon','Snorb','Flarxon','Gruum','Xorble','Drazzle','Phlumm',
  'Twixxle','Slurpax','Blorgax','Qrnx','Vvorg','Zyrax','Mrlgn','Fnaxle','Klobble','Xizzle',
  'Glorbax','Snixxax','Vrumble','Zlopp','Blizz','Qworp','Florpax','Snorble','Tlaxxle','Zyvork',
];

// Animal Normies — pet-style names (no surname)
const ANIMAL_NAMES = [
  'Biscuit','Mochi','Waffles','Pickles','Nugget','Boba','Pretzel','Mango','Tater','Dumpling',
  'Peanut','Cookie','Cheddar','Oreo','Nacho','Chili','Ramen','Soba','Sushi','Papaya',
  'Butterscotch','Caramel','Toffee','Noodle','Grits','Huckleberry','Pepper','Ginger','Cinnamon','Clove',
  'Patches','Freckles','Mittens','Whiskers','Paws','Flopsy','Snuggles','Rascal','Trouble','Pudding',
  'Banjo','Zigzag','Sprout','Juniper','Maple','Cedar','Birch','Clover','Thistle','Hazel',
];

// Uses on-chain traits (Gender + Type) to assign correct name
function generateModalName(id, traits) {
  const typeAttr   = traits.find(a => a.trait_type === 'Type');
  const genderAttr = traits.find(a => a.trait_type === 'Gender');
  const tv = typeAttr   ? typeAttr.value   : 'Human';
  const gv = genderAttr ? genderAttr.value : 'Male';

  if (tv === 'Agent') {
    return AGENT_NAMES[id % AGENT_NAMES.length];
  }

  if (tv === 'Alien') {
    const first = ALIEN_FIRST[id % ALIEN_FIRST.length];
    const last  = ALIEN_LAST[Math.floor(id / 7) % ALIEN_LAST.length];
    return `${first} ${last}`;
  }

  if (tv === 'Animal') {
    return ANIMAL_NAMES[id % ANIMAL_NAMES.length];
  }

  // Human (default) — use gender-appropriate first name
  const shuffled = (id * 1003) % 10000;
  let first;
  if (gv === 'Female') {
    first = FEMALE_FIRST[shuffled % FEMALE_FIRST.length];
  } else if (gv === 'Non-Binary') {
    first = NB_FIRST[shuffled % NB_FIRST.length];
  } else {
    first = MALE_FIRST[shuffled % MALE_FIRST.length];
  }
  const last = LAST_NAMES[Math.floor(shuffled / 100)];
  return `${first} ${last}`;
}

// =============================================
// TRAIT CONTENT ENGINE
// =============================================

// Superlative pools — 15-35 per expression, ID-seeded so same expression ≠ same superlative
const SUPERLATIVE_POOLS = {
  'Confident':  ['Most Likely to Start a Fight at the Reunion','Most Likely to Win Said Fight','Most Likely to Have Already Planned Their Victory Speech','Most Likely to Never Ask for Directions','Most Likely to Be Right and Know It','Most Likely to Walk Into a Room and Own It','Most Likely to Negotiate Their Way Out of Anything','Most Likely to Already Have a Plan B, C, and D','Most Likely to Set the Standard Nobody Else Can Meet','Most Likely to Make the First Move in Any Situation','Most Likely to Inspire You and Intimidate You Simultaneously','Most Likely to Turn a Setback Into a Story','Most Likely to Be the Most Interesting Person at Any Table','Most Likely to Have Made Their Point Before You Finished the Question','Most Likely to Not Need Luck'],
  'Sad':        ['Most Likely to Cry at a Car Insurance Commercial','Most Likely to Feel Things Nobody Else Noticed Were Happening','Most Likely to Write Song Lyrics in Class','Most Likely to Understand You Better Than You Understand Yourself','Most Likely to Remember How Everyone Was Feeling on Any Given Day','Most Likely to Make You Feel Seen Without Saying Much','Most Likely to Still Be Processing That One Thing From 2022','Most Likely to Turn Sadness Into Art','Most Likely to Have the Best Advice Born From Personal Suffering','Most Likely to Feel the Weight of the Room Before Anyone Else','Most Likely to Make You Feel Things at a Party','Most Likely to Be Someone\'s Comfort Person Without Knowing It','Most Likely to Make the Best Playlist You\'ve Never Heard','Most Likely to Write the Most Honest Yearbook Quote','Most Likely to Need a Moment (Takes Several)'],
  'Happy':      ['Most Likely to Ruin Your Bad Mood (For the Better)','Most Likely to Make Friends With Everyone in the Room','Most Likely to Be the Reason Someone Smiled Today','Most Likely to Actually Enjoy Monday Mornings','Most Likely to Find the Silver Lining First','Most Likely to Send Unsolicited Good News','Most Likely to Turn a Bad Day Into a Great Story','Most Likely to Be Exactly Who You Need When Things Go Wrong','Most Likely to Bring Snacks Without Being Asked','Most Likely to Clap for Everyone at Every Ceremony','Most Likely to Actually Mean "I\'m Here If You Need Anything"','Most Likely to Have Zero Enemies Without Even Trying','Most Likely to Be the Reason People Came Back','Most Likely to Make Every Trip a Good Memory','Most Likely to Still Be This Happy in 20 Years'],
  'Angry':      ['Most Likely to Ask for the Manager','Most Likely to Have a Petition Ready','Most Likely to Say the Thing Everyone Was Thinking','Most Likely to Make Valid Points at the Wrong Volume','Most Likely to Hold a Grudge for Exactly the Right Amount of Time','Most Likely to Fight for Something Worth Fighting For','Most Likely to Have Sent an Email They Didn\'t Regret','Most Likely to Be Right About the Thing That Made Them Angry','Most Likely to Be the Person the System Fears Most','Most Likely to File a Formal Complaint and Win','Most Likely to Start a Movement by Accident','Most Likely to Hold the Line When Everyone Else Folded','Most Likely to Win an Argument Nobody Else Realized Was Happening','Most Likely to Turn Frustration Into Change','Most Likely to Have the Best Reason for Being Upset'],
  'Bored':      ['Most Likely to Leave the Party at 9pm','Most Likely to Have Already Left Mentally','Most Likely to Have Seen This Episode Before','Most Likely to Be Five Steps Ahead and Not Impressed','Most Likely to Say "This Could\'ve Been an Email"','Most Likely to Be the Most Interesting Person Who Looks the Least Interested','Most Likely to Have Already Read the Ending','Most Likely to Be Completely Right While Appearing to Not Care','Most Likely to Not Show Up and Be Correct About It','Most Likely to Have Done All This Before','Most Likely to Sigh and Be Right','Most Likely to Have Peaked in a Different Dimension','Most Likely to Be the Most Self-Aware Person in Any Room','Most Likely to Only Show Up When It Actually Matters','Most Likely to Have Already Known How It Ends'],
  'Smug':       ['Most Likely to Correct Your Grammar Mid-Text','Most Likely to Have Predicted This Three Years Ago','Most Likely to Say Nothing and Still Win','Most Likely to Be Right for the Wrong Reasons (Still Counts)','Most Likely to Know More Than They Let On','Most Likely to Be Everyone\'s Secret Role Model','Most Likely to Already Have the Answer Before You Finish the Question','Most Likely to Win Without Appearing to Try','Most Likely to Have Already Moved Past This','Most Likely to Be Technically Correct (The Best Kind)','Most Likely to Remain Unimpressed by Things That Impress Everyone','Most Likely to Know the Difference and Not Explain It','Most Likely to Have Already Been There','Most Likely to Write the Quote That Gets Stolen by Someone Else','Most Likely to Let Their Work Speak (Loudly, By Saying Nothing)'],
  'Nervous':    ['Most Likely to Sweat Through a Zoom Interview','Most Likely to Have a Backup Plan for Their Backup Plan','Most Likely to Triple-Check the Oven','Most Likely to Prepare the Most Thorough Presentation Anyone Has Ever Seen','Most Likely to Have Read the Terms and Conditions','Most Likely to Send the Confirmation Email Nobody Asked For','Most Likely to Know the Emergency Exit in Every Building','Most Likely to Turn Anxiety Into Exceptional Work','Most Likely to Have Rehearsed This Conversation Already','Most Likely to Be the Most Prepared Person in Any Room','Most Likely to Google Symptoms for Things That Are Fine','Most Likely to Arrive 30 Minutes Early to Everything','Most Likely to Have a Go-Bag in Their Car','Most Likely to Lose Sleep Over Something That Goes Perfectly','Most Likely to Be Quietly Responsible for Everything Running Smoothly'],
  'Surprised':  ['Most Likely to Believe Everything They Read Online','Most Likely to Stumble Into the Best Situation by Accident','Most Likely to Find an Opportunity Nobody Saw Coming','Most Likely to React Authentically While Everyone Else Performs','Most Likely to Be Genuinely Shocked by Things That Happen Every Day','Most Likely to Have the Best "How We Met" Story','Most Likely to Fall Into Success Without a Plan','Most Likely to Still Be Processing Last Year\'s Events','Most Likely to Be Surprised by Their Own Talent','Most Likely to Get Lost and Discover Something Better','Most Likely to Have No Plan and Somehow Win Anyway','Most Likely to Open a Door They Didn\'t Know Was There','Most Likely to Have a Great Story They Didn\'t Intend to Have','Most Likely to Make the Best Mistake of Their Life','Most Likely to Be Spontaneously Right'],
  'Disgusted':  ['Most Likely to Send Food Back. Twice.','Most Likely to Have a Standard Nobody Else Has Met','Most Likely to Have Opinions That Are Mostly Correct','Most Likely to Raise the Average Quality of Any Room They Enter','Most Likely to Notice the One Thing Wrong in an Otherwise Perfect Situation','Most Likely to Have Been the Harshest Critic of Their Own Work','Most Likely to Make Something Perfect and Still Find a Flaw','Most Likely to Have Taste Nobody in This Town Deserves','Most Likely to Be Right About the Thing Nobody Wanted to Hear','Most Likely to Set a Standard That Outlasts Them','Most Likely to Improve Everything They Touch (Reluctantly)','Most Likely to Be the Reason Something Got Better','Most Likely to Have Given Feedback That Stung and Helped','Most Likely to Demand Excellence and Actually Get It','Most Likely to Be Correct About the Thing That Annoyed Everyone'],
  'Excited':    ['Most Likely to Already Have Their Five-Year Plan Laminated','Most Likely to Join Three Clubs in the Same Week','Most Likely to Be the Reason Your Event Didn\'t Fail','Most Likely to Make You Feel Like You Can Do Anything','Most Likely to Turn Any Situation Into an Experience','Most Likely to Send the Hype Text Nobody Asked For but Everyone Needed','Most Likely to Be the Energy the Room Needed','Most Likely to Actually Show Up for Everything','Most Likely to Make You Believe in the Project Again','Most Likely to Still Be This Person at 40 (Thankfully)','Most Likely to Have the Most Fun at Any Mandatory Event','Most Likely to Volunteer First and Mean It','Most Likely to Cry Happy Tears at Something That Doesn\'t Warrant It','Most Likely to Leave Every Situation Better Than They Found It','Most Likely to Have Prepared a Welcome Package'],
  'Serious':    ['Most Likely to Not Hear the Joke Because They Were Working','Most Likely to Turn a Casual Chat Into a Strategic Meeting','Most Likely to Have Already Solved It','Most Likely to Do the Thing Nobody Else Finished','Most Likely to Finish What Others Started','Most Likely to Be Right Without Fanfare','Most Likely to Work Through the Party and Get Promoted','Most Likely to Be the Reason It Actually Got Done','Most Likely to Not Need Recognition and Receive It Anyway','Most Likely to Set a Standard Others Spend Years Meeting','Most Likely to Know Exactly What They\'re Doing at All Times','Most Likely to Build Something That Lasts','Most Likely to Be the One Everyone Called When It Mattered','Most Likely to Have No Time for Small Talk and Still Win','Most Likely to Be the Most Prepared Person in Any Room'],
  'Tired':      ['Most Likely to Fall Asleep at Their Own Graduation','Most Likely to Have Already Sent That Email From Bed','Most Likely to Do Everything on Four Hours of Sleep and Nail It','Most Likely to Be Done Before They\'ve Started','Most Likely to Need Five Minutes That Turn Into Twenty','Most Likely to Have the Best Ideas at 2am and Forget Them','Most Likely to Be Technically Present','Most Likely to Have Earned Every Single Nap','Most Likely to Already Be Looking Forward to Going Home','Most Likely to Make Exhaustion Look Like Wisdom','Most Likely to Be Running on Fumes and Still Come Through','Most Likely to Fall Asleep Mid-Sentence and Still Be Right','Most Likely to Do the Most on the Least Sleep','Most Likely to Retire Early and Mean It','Most Likely to Sleep Through the Alarm and Still Be on Time'],
  'Cheeky':     ['Most Likely to Get Away With Everything','Most Likely to Find a Loophole in Any System','Most Likely to Talk Their Way Out of Anything','Most Likely to Have a Story That Can\'t Be Verified','Most Likely to Have the Most Interesting Permanent Record','Most Likely to Make Breaking the Rules Look Like Common Sense','Most Likely to Get Called Out and Still Win','Most Likely to Have Been Warned and Continued Anyway','Most Likely to Turn Chaos Into a Strategy','Most Likely to Make the Rules Regret Existing','Most Likely to Have a Story for Every Rule They Broke','Most Likely to Have Made a Good Decision That Looked Like a Bad One','Most Likely to Find Out What They Can Get Away With (And Test It)','Most Likely to Have a Reason for Everything That Makes No Sense and Also Works','Most Likely to Have Made Something Better by Not Following Instructions'],
  'Suspicious': ['Most Likely to Find the Hidden Agenda','Most Likely to Have Already Figured It Out','Most Likely to Be Right About the Thing That Sounded Paranoid','Most Likely to Read the Fine Print','Most Likely to Notice What Everyone Else Missed','Most Likely to Have a Theory That Turns Out to Be Correct','Most Likely to Ask the Question Nobody Thought to Ask','Most Likely to Find the One Inconsistency Nobody Else Noticed','Most Likely to Have Been Right the Whole Time','Most Likely to Not Trust the Obvious Answer','Most Likely to Verify Everything Before Committing to Anything','Most Likely to Have Documentation of Everything Just in Case','Most Likely to Find the Flaw in Any Seemingly Perfect Plan','Most Likely to Have Seen It Coming From Miles Away','Most Likely to Know Where the Bodies Are Buried (Metaphorically)'],
  'Content':    ['Most Likely to Be Annoyingly Unbothered','Most Likely to Actually Have Their Life Together and Say Nothing About It','Most Likely to Be Fine With Whatever Happens','Most Likely to Not Need Validation (And Mean It)','Most Likely to Have Found Inner Peace and Kept It Quiet','Most Likely to Not Check Their Phone for Hours and Be Completely Fine','Most Likely to Skip the Drama and Take a Walk Instead','Most Likely to Be the Calm Person in Every Emergency','Most Likely to Be Genuinely Happy With a Simple Life','Most Likely to Still Be Fine When Everything Around Them Isn\'t','Most Likely to Give Good Advice Without Being Asked','Most Likely to Say "I\'m Good" and Actually Mean It','Most Likely to Leave a Situation Without Explanation and Be Right','Most Likely to Thrive Quietly','Most Likely to Have No Drama Because They Simply Don\'t Engage','Most Likely to Live Well Without Posting About It','Most Likely to Be the Only One Not Stressed','Most Likely to Leave Group Chats and Never Look Back','Most Likely to Have Already Made Peace With That','Most Likely to Watch Chaos Unfold and Quietly Make Tea','Most Likely to Log Off and Not Come Back','Most Likely to Say Less and Be Heard More','Most Likely to Be the Person Everyone Calls When Things Go Wrong','Most Likely to Not Know What the Drama Was Even About','Most Likely to Already Be On Vacation Mentally','Most Likely to Have No Enemies Because They Can\'t Be Bothered','Most Likely to Make Peace Look Like a Superpower','Most Likely to Be Completely Unbothered by Things That Bother Everyone Else','Most Likely to Not Need a Five-Year Plan and Still Be Fine','Most Likely to Be Mistaken for Enlightened','Most Likely to Have Low Needs in the Best Possible Way','Most Likely to Be Exactly Who They Are, Quietly, Forever','Most Likely to Not Have an Opinion and Mean It','Most Likely to Be Doing Well and Not Need You to Know','Most Likely to Make Being Unbothered Look Like an Art Form'],
  '_default':   ['Most Likely to Have a Strong Opinion About This','Most Likely to Be Exactly What You Didn\'t Expect','Most Likely to Do Their Own Thing and Be Fine','Most Likely to Show Up When It Counts','Most Likely to Have the Last Laugh','Most Likely to Defy Expectations','Most Likely to Write Their Own Story','Most Likely to Have a Plan Nobody Knows About','Most Likely to Outlast Everyone\'s Predictions','Most Likely to Turn Out Exactly Right','Most Likely to Be Remembered for Something Nobody Saw Coming','Most Likely to Make It Work','Most Likely to Still Be Themselves No Matter What','Most Likely to Figure It Out','Most Likely to Quietly Win','Most Likely to Have the Right Idea at the Right Time','Most Likely to Not Need a Label','Most Likely to Be Fine With That','Most Likely to Be Exactly Who They Always Were','Most Likely to Have a Very Strong Opinion About This'],
};

const SUPERLATIVES = {
  eyesSuffix: {
    'Round Glasses': ' — while citing three sources',
    'Monocle':       ' — with completely unearned dignity',
    'Sunglasses':    ' — and somehow make it look cool',
    'Squinting':     ' — but not 100% sure what they saw',
    '_default':      '',
  },
  award: {
    'Headband':   '🏃 Class Overachiever',
    'Chain':      '💰 Most Likely to Make It',
    'Hat':        '🎙️ Has a Podcast. Didn\'t Ask.',
    'Pipe':       '📚 Most Likely to Be Quoted Out of Context',
    'Earring':    '✨ Certified Main Character',
    'Monocle':    '🧐 Most Distinguished (Allegedly)',
    'Bow Tie':    '🎩 Peak Formality Award',
    'Crown':      '👑 Class Royalty (Self-Proclaimed)',
    '_default':   '',
  },
};

// =============================================
// =============================================
// FAV QUOTE — real famous quotes, attributed to real people
// Deterministic: same Normie ID = same quote every time
// =============================================

const FAMOUS_QUOTES = {
  'Confident': [
    { text: "I am the greatest.", author: "Muhammad Ali" },
    { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "I can accept failure — everyone fails at something. But I can't accept not trying.", author: "Michael Jordan" },
    { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Champions are made from something deep inside them — a desire, a dream, a vision.", author: "Muhammad Ali" },
    { text: "To be yourself in a world constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is not final; failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Don't watch the clock. Do what it does — keep going.", author: "Sam Levenson" },
    { text: "I was not delivered unto this world in defeat.", author: "Og Mandino" },
    { text: "Life is not about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
    { text: "The man who has no imagination has no wings.", author: "Muhammad Ali" },
    { text: "If you're going through hell, keep going.", author: "Winston Churchill" },
    { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
    { text: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
    { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
    { text: "Be so good they can't ignore you.", author: "Steve Martin" },
    { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
    { text: "It's not bragging if you can back it up.", author: "Muhammad Ali" },
    { text: "Do or do not. There is no try.", author: "Yoda" },
  ],
  'Sad': [
    { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
    { text: "In the middle of winter, I at last discovered that there was in me an invincible summer.", author: "Albert Camus" },
    { text: "The most beautiful people are those who have known defeat, suffering, struggle, and loss.", author: "Elisabeth Kübler-Ross" },
    { text: "Tears are words that need to be written.", author: "Paulo Coelho" },
    { text: "Grief is the price we pay for love.", author: "Queen Elizabeth II" },
    { text: "Out of suffering have emerged the strongest souls.", author: "Kahlil Gibran" },
    { text: "I can be changed by what happens to me. But I refuse to be reduced by it.", author: "Maya Angelou" },
    { text: "Pain is inevitable. Suffering is optional.", author: "Haruki Murakami" },
    { text: "You can't go back and change the beginning, but you can start where you are and change the ending.", author: "C.S. Lewis" },
    { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
    { text: "Hope is being able to see that there is light despite all of the darkness.", author: "Desmond Tutu" },
    { text: "What is to give light must endure burning.", author: "Viktor Frankl" },
    { text: "Give sorrow words; the grief that does not speak whispers to the heart and bids it break.", author: "William Shakespeare" },
    { text: "There is a sacredness in tears. They are not marks of weakness, but of power.", author: "Washington Irving" },
    { text: "Sometimes the bravest thing you can do is show up.", author: "Brené Brown" },
    { text: "You don't drown by falling in the water; you drown by staying there.", author: "Edwin Louis Cole" },
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "The wound is the place where the light enters you.", author: "Rumi" },
    { text: "Nothing in the universe can stop you from letting go and starting over.", author: "Guy Finley" },
    { text: "Although the world is full of suffering, it is also full of the overcoming of it.", author: "Helen Keller" },
    { text: "The darkest nights produce the brightest stars.", author: "John Green" },
    { text: "Stars can't shine without darkness.", author: "D.H. Sidebottom" },
  ],
  'Happy': [
    { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
    { text: "For every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson" },
    { text: "Happiness is when what you think, what you say, and what you do are in harmony.", author: "Mahatma Gandhi" },
    { text: "The most important thing is to enjoy your life — to be happy.", author: "Audrey Hepburn" },
    { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
    { text: "When you do things from your soul, you feel a river moving in you, a joy.", author: "Rumi" },
    { text: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault" },
    { text: "Count your age by friends, not years. Count your life by smiles, not tears.", author: "John Lennon" },
    { text: "Very little is needed to make a happy life; it is all within yourself.", author: "Marcus Aurelius" },
    { text: "Be happy for this moment. This moment is your life.", author: "Omar Khayyam" },
    { text: "Life is short, and it's up to you to make it sweet.", author: "Sadie Delany" },
    { text: "The secret of happiness is not in doing what one likes, but in liking what one does.", author: "J.M. Barrie" },
    { text: "Joy is not in things; it is in us.", author: "Richard Wagner" },
    { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
    { text: "Gratitude is the healthiest of all human emotions.", author: "Zig Ziglar" },
    { text: "Happiness is not a station you arrive at, but a manner of traveling.", author: "Margaret Lee Runbeck" },
    { text: "Think of all the beauty still left around you and be happy.", author: "Anne Frank" },
    { text: "There is no way to happiness — happiness is the way.", author: "Thich Nhat Hanh" },
    { text: "The world is full of magic things, patiently waiting for our senses to grow sharper.", author: "W.B. Yeats" },
    { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  ],
  'Angry': [
    { text: "I am no longer accepting the things I cannot change. I am changing the things I cannot accept.", author: "Angela Davis" },
    { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
    { text: "The time is always right to do what is right.", author: "Martin Luther King Jr." },
    { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
    { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin" },
    { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
    { text: "Never be afraid to raise your voice for honesty and truth against injustice.", author: "William Faulkner" },
    { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus" },
    { text: "A man who stands for nothing will fall for anything.", author: "Malcolm X" },
    { text: "What you do speaks so loudly that I cannot hear what you say.", author: "Ralph Waldo Emerson" },
    { text: "Get up, stand up. Stand up for your rights.", author: "Bob Marley" },
    { text: "In a time of deceit, telling the truth is a revolutionary act.", author: "George Orwell" },
    { text: "We must always take sides. Neutrality helps the oppressor, never the victim.", author: "Elie Wiesel" },
    { text: "Change does not roll in on the wheels of inevitability, but comes through continuous struggle.", author: "Martin Luther King Jr." },
    { text: "The most courageous act is still to think for yourself. Aloud.", author: "Coco Chanel" },
    { text: "Our lives begin to end the day we become silent about things that matter.", author: "Martin Luther King Jr." },
    { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott" },
    { text: "The revolution will not be televised.", author: "Gil Scott-Heron" },
    { text: "Well-behaved women seldom make history.", author: "Laurel Thatcher Ulrich" },
    { text: "You don't make progress by standing on the sidelines, whimpering and complaining.", author: "Shirley Chisholm" },
  ],
  'Bored': [
    { text: "The cure for boredom is curiosity. There is no cure for curiosity.", author: "Dorothy Parker" },
    { text: "Without great solitude, no serious work is possible.", author: "Pablo Picasso" },
    { text: "I'd rather die of passion than boredom.", author: "Vincent van Gogh" },
    { text: "There are no uninteresting things, only uninterested people.", author: "G.K. Chesterton" },
    { text: "I am never bored; to be bored is an insult to oneself.", author: "Jules Renard" },
    { text: "The secret of being boring is to say everything.", author: "Voltaire" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
    { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
    { text: "The quieter you become, the more you can hear.", author: "Ram Dass" },
    { text: "Solitude is fine but you need someone to tell that solitude is fine.", author: "Honoré de Balzac" },
    { text: "Wisely and slow; they stumble that run fast.", author: "William Shakespeare" },
    { text: "I am a slow walker, but I never walk back.", author: "Abraham Lincoln" },
    { text: "Silence is a source of great strength.", author: "Lao Tzu" },
    { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { text: "The time you enjoy wasting is not wasted time.", author: "Bertrand Russell" },
    { text: "Doing nothing is better than being busy doing nothing.", author: "Lao Tzu" },
    { text: "Rest is not idleness.", author: "John Lubbock" },
    { text: "The secret to a long life is to not rush it.", author: "Anonymous" },
    { text: "A quiet life is worth living.", author: "Bertrand Russell" },
    { text: "I owe my success to having listened respectfully to the very best advice, and then going away and doing the exact opposite.", author: "G.K. Chesterton" },
  ],
  'Smug': [
    { text: "I am so clever that sometimes I don't understand a single word of what I am saying.", author: "Oscar Wilde" },
    { text: "I can resist everything except temptation.", author: "Oscar Wilde" },
    { text: "Always forgive your enemies — nothing annoys them so much.", author: "Oscar Wilde" },
    { text: "The truth is rarely pure and never simple.", author: "Oscar Wilde" },
    { text: "Some cause happiness wherever they go; others whenever they go.", author: "Oscar Wilde" },
    { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "The problem with the world is that the intelligent people are full of doubts, while the stupid ones are full of confidence.", author: "Bertrand Russell" },
    { text: "Be careful about reading health books. You may die of a misprint.", author: "Mark Twain" },
    { text: "I am extraordinarily patient, provided I get my own way in the end.", author: "Margaret Thatcher" },
    { text: "I have nothing to declare except my genius.", author: "Oscar Wilde" },
    { text: "When a stupid man is doing something he is ashamed of, he always declares that it is his duty.", author: "George Bernard Shaw" },
    { text: "I speak two languages — Body and English.", author: "Mae West" },
    { text: "It's not bragging if you can back it up.", author: "Muhammad Ali" },
    { text: "I am not arguing. I am simply explaining why I am right.", author: "Anonymous" },
    { text: "I'm on a seafood diet. I see food and I eat it.", author: "Anonymous" },
    { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
    { text: "We are all born originals — why is it so many of us die copies?", author: "Edward Young" },
    { text: "Genius is 1% inspiration and 99% perspiration.", author: "Thomas Edison" },
    { text: "Behind every great man is a woman rolling her eyes.", author: "Jim Carrey" },
  ],
  'Nervous': [
    { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
    { text: "Everything you want is on the other side of fear.", author: "Jack Canfield" },
    { text: "Courage is resistance to fear, mastery of fear — not absence of fear.", author: "Mark Twain" },
    { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
    { text: "You gain strength, courage and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt" },
    { text: "Inaction breeds doubt and fear. Action breeds confidence and courage.", author: "Dale Carnegie" },
    { text: "Feel the fear and do it anyway.", author: "Susan Jeffers" },
    { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
    { text: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
    { text: "Anxiety is the dizziness of freedom.", author: "Søren Kierkegaard" },
    { text: "What we fear doing most is usually what we most need to do.", author: "Tim Ferriss" },
    { text: "It's okay to be scared. Being scared means you're about to do something really brave.", author: "Mandy Hale" },
    { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
    { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
    { text: "Nerves and butterflies are fine — they're a physical sign that you're mentally ready.", author: "Steve Bull" },
    { text: "Pressure is a privilege.", author: "Billie Jean King" },
    { text: "He who is not every day conquering some fear has not learned the secret of life.", author: "Ralph Waldo Emerson" },
    { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
  ],
  'Surprised': [
    { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
    { text: "Reality is merely an illusion, albeit a very persistent one.", author: "Albert Einstein" },
    { text: "The most beautiful thing we can experience is the mysterious.", author: "Albert Einstein" },
    { text: "Coincidence is God's way of remaining anonymous.", author: "Albert Einstein" },
    { text: "Two roads diverged in a wood, and I took the one less traveled by.", author: "Robert Frost" },
    { text: "We don't see things as they are; we see them as we are.", author: "Anaïs Nin" },
    { text: "Life shrinks or expands in proportion to one's courage.", author: "Anaïs Nin" },
    { text: "Sometimes the questions are complicated and the answers are simple.", author: "Dr. Seuss" },
    { text: "It ain't what you don't know that gets you into trouble. It's what you know for sure that just ain't so.", author: "Mark Twain" },
    { text: "The best things in life are unexpected — because there were no expectations.", author: "Eli Khamarov" },
    { text: "We accept the love we think we deserve.", author: "Stephen Chbosky" },
    { text: "Expect nothing, appreciate everything.", author: "Anonymous" },
    { text: "The only source of knowledge is experience.", author: "Albert Einstein" },
    { text: "When you stumble, make it part of the dance.", author: "Anonymous" },
    { text: "Life is full of surprises. Remain curious.", author: "Anonymous" },
    { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
    { text: "The road not taken makes all the difference.", author: "Robert Frost" },
    { text: "I never dreamed about success. I worked for it.", author: "Estée Lauder" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  ],
  'Disgusted': [
    { text: "Facts do not cease to exist because they are ignored.", author: "Aldous Huxley" },
    { text: "If you tell the truth, you don't have to remember anything.", author: "Mark Twain" },
    { text: "The only thing worse than being blind is having sight but no vision.", author: "Helen Keller" },
    { text: "The masses have never thirsted after truth. They demand illusions.", author: "Sigmund Freud" },
    { text: "Mediocrity knows nothing higher than itself.", author: "Arthur Conan Doyle" },
    { text: "The measure of a man is what he does with power.", author: "Plato" },
    { text: "Men occasionally stumble over the truth, but most of them pick themselves up and hurry off as if nothing ever happened.", author: "Winston Churchill" },
    { text: "Integrity is doing the right thing, even when no one is watching.", author: "C.S. Lewis" },
    { text: "An eye for an eye only ends up making the whole world blind.", author: "Mahatma Gandhi" },
    { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
    { text: "It is no measure of health to be well adjusted to a profoundly sick society.", author: "Jiddu Krishnamurti" },
    { text: "The secret of life is honesty and fair dealing. If you can fake that, you've got it made.", author: "Groucho Marx" },
    { text: "To be great is to be misunderstood.", author: "Ralph Waldo Emerson" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Excellence is never an accident.", author: "Aristotle" },
    { text: "I will not lower my standards to accommodate those who refuse to raise theirs.", author: "Anonymous" },
    { text: "Those who mind don't matter, and those who matter don't mind.", author: "Bernard Baruch" },
    { text: "The real problem is not whether machines think but whether men do.", author: "B.F. Skinner" },
    { text: "Be who you are and say what you feel, because those who mind don't matter.", author: "Dr. Seuss" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  ],
  'Excited': [
    { text: "The best is yet to come.", author: "Frank Sinatra" },
    { text: "Nothing is impossible — the word itself says I'm possible!", author: "Audrey Hepburn" },
    { text: "Shoot for the moon. Even if you miss, you'll land among the stars.", author: "Les Brown" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "If opportunity doesn't knock, build a door.", author: "Milton Berle" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "Whatever you are, be a good one.", author: "Abraham Lincoln" },
    { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
    { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
    { text: "Do it with passion or not at all.", author: "Rosa Couchman" },
    { text: "If you can dream it, you can do it.", author: "Walt Disney" },
    { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
    { text: "In twenty years you'll be more disappointed by the things you didn't do than by the ones you did.", author: "Mark Twain" },
  ],
  'Serious': [
    { text: "Well done is better than well said.", author: "Benjamin Franklin" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "Bruce Lee" },
    { text: "Genius is 1% talent and 99% hard work.", author: "Albert Einstein" },
    { text: "Work hard in silence; let your success be your noise.", author: "Frank Ocean" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Without labor, nothing prospers.", author: "Sophocles" },
    { text: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas Edison" },
    { text: "Do or do not. There is no try.", author: "Yoda" },
    { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
    { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
    { text: "Plans are nothing; planning is everything.", author: "Dwight D. Eisenhower" },
    { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
    { text: "If you think education is expensive, try ignorance.", author: "Robert Orben" },
    { text: "Knowledge is power.", author: "Francis Bacon" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Think twice before you speak, because your words and influence will plant the seed of either success or failure.", author: "Napoleon Hill" },
    { text: "The man who reads nothing at all is better educated than the man who reads nothing but newspapers.", author: "Thomas Jefferson" },
  ],
  'Tired': [
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "Rest is not idleness.", author: "John Lubbock" },
    { text: "Sometimes the most productive thing you can do is rest.", author: "Mark Black" },
    { text: "For fast-acting relief, try slowing down.", author: "Lily Tomlin" },
    { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
    { text: "You can't pour from an empty cup. Take care of yourself first.", author: "Anonymous" },
    { text: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese Proverb" },
    { text: "The price of anything is the amount of life you exchange for it.", author: "Henry David Thoreau" },
    { text: "The woods are lovely, dark and deep. But I have promises to keep, and miles to go before I sleep.", author: "Robert Frost" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "Fatigue is the best pillow.", author: "Benjamin Franklin" },
    { text: "Sleep is the best meditation.", author: "Dalai Lama" },
    { text: "Burnout is what happens when you try to avoid being human for too long.", author: "Michael Gungor" },
    { text: "Doing nothing is better than being busy doing nothing.", author: "Lao Tzu" },
    { text: "Even the strongest person needs rest.", author: "Anonymous" },
    { text: "Be gentle with yourself. You are a child of the universe.", author: "Max Ehrmann" },
    { text: "You don't always need a plan. Sometimes you just need to breathe, trust, let go.", author: "Mandy Hale" },
    { text: "Slow down and enjoy life. It's not only the scenery you miss by going too fast.", author: "Eddie Cantor" },
    { text: "One step at a time is all it takes to get you there.", author: "Emily Dickinson" },
    { text: "There is virtue in work and there is virtue in rest. Use both and overlook neither.", author: "Alan Cohen" },
  ],
  'Cheeky': [
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
    { text: "The trouble with having an open mind is that people will insist on coming along and trying to put things in it.", author: "Terry Pratchett" },
    { text: "I find television very educational. Every time someone switches it on, I go into another room and read a good book.", author: "Groucho Marx" },
    { text: "The best revenge is massive success.", author: "Frank Sinatra" },
    { text: "If you think you are too small to make a difference, try sleeping with a mosquito.", author: "Dalai Lama" },
    { text: "We are all here on earth to help others; what on earth the others are here for, I don't know.", author: "W.H. Auden" },
    { text: "A day without sunshine is like, you know, night.", author: "Steve Martin" },
    { text: "Never put off till tomorrow what you can do the day after.", author: "Mark Twain" },
    { text: "The road to success is always under construction.", author: "Lily Tomlin" },
    { text: "I never make the same mistake twice. I make it five or six times, just to be sure.", author: "Anonymous" },
    { text: "People say nothing is impossible, but I do nothing every day.", author: "A.A. Milne" },
    { text: "The trouble is, you think you have time.", author: "Buddha" },
    { text: "I don't have a short temper. I just have a quick reaction to stupidity.", author: "Anonymous" },
    { text: "When in doubt, nap it out.", author: "Anonymous" },
    { text: "I walk slowly, but I never walk backward.", author: "Abraham Lincoln" },
    { text: "I am not lazy. I am just in my energy saving mode.", author: "Anonymous" },
    { text: "By the time a man realizes that his father was right, he has a son who thinks he's wrong.", author: "Charles Wadsworth" },
    { text: "Wine is bottled poetry.", author: "Robert Louis Stevenson" },
    { text: "Age is an issue of mind over matter. If you don't mind, it doesn't matter.", author: "Mark Twain" },
  ],
  'Suspicious': [
    { text: "Just because you're paranoid doesn't mean they aren't after you.", author: "Joseph Heller" },
    { text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", author: "Richard Feynman" },
    { text: "In a time of deceit, telling the truth is a revolutionary act.", author: "George Orwell" },
    { text: "It is easier to fool people than to convince them that they have been fooled.", author: "Mark Twain" },
    { text: "A lie gets halfway around the world before the truth has a chance to get its pants on.", author: "Winston Churchill" },
    { text: "Never attribute to malice that which is adequately explained by stupidity.", author: "Hanlon's Razor" },
    { text: "Trust, but verify.", author: "Ronald Reagan" },
    { text: "The truth will set you free, but first it will make you miserable.", author: "James Garfield" },
    { text: "Doubt is the beginning, not the end, of wisdom.", author: "George Iles" },
    { text: "Question everything. Learn something. Answer nothing.", author: "Euripides" },
    { text: "Don't believe everything you think.", author: "Anonymous" },
    { text: "The most dangerous person is the one who listens, thinks and observes.", author: "Bruce Lee" },
    { text: "Fool me once, shame on you. Fool me twice, shame on me.", author: "Traditional Proverb" },
    { text: "Things are not always what they seem; the first appearance deceives many.", author: "Phaedrus" },
    { text: "Nothing is as it seems, nor is it otherwise.", author: "Buddhist Proverb" },
    { text: "I keep my friends close and my receipts closer.", author: "Anonymous" },
    { text: "Read between the lines — the real story is always there.", author: "Anonymous" },
    { text: "The devil is in the details.", author: "Traditional Proverb" },
    { text: "One must always be suspicious of those who claim to have all the answers.", author: "Anonymous" },
    { text: "Believe nothing of what you hear, and only half of what you see.", author: "Edgar Allan Poe" },
  ],
  'Content': [
    { text: "Be here now.", author: "Ram Dass" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
    { text: "He who is contented is rich.", author: "Lao Tzu" },
    { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
    { text: "Be content with what you have; rejoice in the way things are.", author: "Lao Tzu" },
    { text: "Gratitude is not only the greatest of virtues, but the parent of all others.", author: "Cicero" },
    { text: "The best things in life aren't things.", author: "Art Buchwald" },
    { text: "Wherever you are, be all there.", author: "Jim Elliot" },
    { text: "The present moment always will have been.", author: "Eckhart Tolle" },
    { text: "I am enough.", author: "Marisa Peer" },
    { text: "Happiness is not something you postpone for the future; it is something you design for the present.", author: "Jim Rohn" },
    { text: "Enough is a feast.", author: "Buddhist Proverb" },
    { text: "There is no way to happiness — happiness is the way.", author: "Thich Nhat Hanh" },
    { text: "The present moment is the only moment available to us.", author: "Thich Nhat Hanh" },
    { text: "Be still and know.", author: "Psalms 46:10" },
    { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
    { text: "It is enough to do good even if you don't do it perfectly.", author: "Anonymous" },
    { text: "A quiet life is worth living.", author: "Bertrand Russell" },
  ],
  '_default': [
    { text: "Know thyself.", author: "Socrates" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "We are all stars and we deserve to twinkle.", author: "Marilyn Monroe" },
    { text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
    { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
    { text: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
    { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { text: "The only journey is the one within.", author: "Rainer Maria Rilke" },
    { text: "We are all just walking each other home.", author: "Ram Dass" },
    { text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.", author: "Maya Angelou" },
    { text: "Here's to the crazy ones — the misfits, the rebels, the troublemakers.", author: "Steve Jobs" },
    { text: "It is our choices that show what we truly are, far more than our abilities.", author: "J.K. Rowling" },
    { text: "To thine own self be true.", author: "William Shakespeare" },
    { text: "We know what we are, but know not what we may be.", author: "William Shakespeare" },
    { text: "I am large, I contain multitudes.", author: "Walt Whitman" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "When the going gets weird, the weird turn pro.", author: "Hunter S. Thompson" },
    { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson" },
    { text: "The world is a book and those who do not travel read only one page.", author: "Saint Augustine" },
    { text: "Two roads diverged in a wood, and I—I took the one less traveled by.", author: "Robert Frost" },
    { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "If you tell the truth, you don't have to remember anything.", author: "Mark Twain" },
  ],
};

const WHERE_ARE_THEY_NOW = {
  // Combos: expression+eyes
  combos: {
    'Confident+Round Glasses': 'Founded a startup. It\'s "in stealth mode." Has been for three years.',
    'Confident+Sunglasses':    'DJ. "On the come up." Has been saying this since 2019.',
    'Confident+Monocle':       'Partner at a law firm. Nobody likes them. They know.',
    'Sad+Round Glasses':       'Assistant professor. Published one paper in 2019. Still mentions it.',
    'Sad+Monocle':             'Writes poetry. Some of it is very good. Won\'t tell you which.',
    'Happy+Sunglasses':        'Travel influencer. The good kind. Actually answers DMs.',
    'Angry+Round Glasses':     'Union organizer. Extremely effective.',
    'Angry+Monocle':           'Lawyer. Wins a lot. Feared at every firm.',
    'Bored+Sunglasses':        'Won\'t tell you what they do. Won\'t explain.',
    'Smug+Monocle':            'Art critic. Has opinions about your art. Didn\'t ask.',
    'Nervous+Round Glasses':   'Senior data analyst. Very good at Excel. Cries about it sometimes.',
    'Surprised+Sunglasses':    'Reacts to things on YouTube. 847K subscribers. Genuinely shocked.',
    'Excited+Headband':        'Runs a marathon every month. Tells everyone.',
  },
  byExpression: {
    'Confident':  ['Running a supplement brand. 4.7 stars, 2,400 reviews.','Founded a startup. Going well. Will tell you unprompted.','CEO of something. Third company. Learning from the others.','Negotiating a deal somewhere warm. Can\'t say more.','Named partner. Took four years. Worth it.','Running their city. Quietly. Efficiently.','Playing professional something. Told you.','Headlining an event nobody thought they\'d headline.','Running the thing they said they\'d run. Did it.','Closed a deal this morning. Third this week.','Managing a team of people who respect them. Earned.','Built something real. Not talking about it much.','Running the show. Has been for a while.','At the top of a field they entered confidently. Still there.','Somewhere with excellent Wi-Fi and a signed term sheet.'],
    'Sad':        ['Working on a novel. Says it\'s almost done. (Started in 2018.)','Writing something beautiful that not enough people have read yet.','Therapist. Genuinely good at it.','Making music quietly. Not releasing it publicly. It\'s incredible.','Teaching. More effective than they know.','Working in a field that takes more than it gives. Still showing up.','In a small apartment. Writing. A lot.','Getting better. Slowly. Meaningfully.','Has found something that helps. Protecting it.','Living somewhere quiet. It suits them.','Has figured some things out. Took a while. Worth it.','Found a therapist they trust. That\'s a win.','Building something at their own pace. Getting there.','Found their people eventually. Didn\'t expect to. Grateful.','Doing okay. Which, genuinely, is everything.'],
    'Happy':      ['Professional dog photographer. Thriving, actually.','Planning other people\'s best days. Loves every minute of it.','Teaching second grade. Everyone\'s favorite teacher by March.','Running a small community thing. Everybody shows up.','Working at a shelter. Has adopted more than the policy allows.','Still friends with everyone from school. Hosts the reunion.','Making people\'s days better as a career. Found a way.','Owns a flower shop. Obviously.','Volunteering more hours than most people work. Happy about it.','Somehow still this cheerful. It\'s not an act.','Has made a life out of good vibes. Sustainable, apparently.','Working somewhere that gives back. Their choice.','Spreading the same energy, new city.','Exactly where they wanted to be. Knew they\'d get here.','Still sending the first birthday text. Every year. For everyone.'],
    'Angry':      ['Life coach. Extremely effective. Nobody asks how.','Fighting something worth fighting. Still at it.','Lawyer. Wins more than they lose. The system knows their name.','Union rep. Thorn in the right sides.','Running for office. First try or fourth, doesn\'t matter.','Investigative journalist. Three major exposés and counting.','Policy director. Changed something real. Working on the next.','Civil rights attorney. Billing fewer hours than they should.','Organizer. More effective than three departments combined.','Has filed a complaint that mattered. Has the judgment to prove it.','Teaching civics. Making it relevant. Genuinely good at this.','Advocates for something every day. Without burning out (somehow).','Working in accountability journalism. Takes it seriously.','Has won an argument that changed a policy. Not their last.','Running something that was broken. Fixing it.'],
    'Bored':      ['Retired early somehow. Won\'t explain. You won\'t get it.','Managing something that basically runs itself. That was the plan.','Working from home. Has been for years. Thriving.','Found a job that doesn\'t need them to care. Perfect fit.','Technically employed. Functionally retired.','Made a system. The system works. They don\'t have to anymore.','Collecting passive income. Won\'t say from what.','Somewhere quiet. Nobody bothers them.','Has optimized their life to require as little effort as possible.','Working fewer days than normal. Getting paid more. No notes.','Made one good move. Living off it.','Has found the exact right amount of work and does exactly that.','Peaked. Accepted it. Now coasting elegantly.','Out. As predicted. Doing fine.','Doing the minimum required. It\'s enough. They knew it would be.'],
    'Smug':       ['Writes long LinkedIn posts. They perform well. Infuriatingly.','Art critic. Has opinions about your art. Didn\'t ask.','Consultant. Expensive. Worth it (allegedly).','Named something after themselves. Justified.','Editor-at-large somewhere. Influential. Knows it.','Has a waiting list. Won\'t say for what.','Proved everyone wrong. Didn\'t say it. Didn\'t have to.','In a position people underestimated them for. Thriving.','Running the thing. Has been for longer than people realized.','Published. Twice. Third is in progress.','Invited onto the panel. Third time this year.','Gets called for quotes by journalists. Gives them sparingly.','At the table they always planned to be at. Pulled their chair in themselves.','Has a biography. It\'s accurate.','The person others name-drop. Does not name-drop back.'],
    'Nervous':    ['Senior data analyst. Very good at Excel. Cries about it sometimes.','Risk manager. Best in the department. No one is surprised.','Has every certificate they could get. On a wall. Alphabetized.','Compliance officer. Job security: eternal. Stress: also eternal.','Pharmacist. Checks everything twice. Patients love them for it.','Project manager. Nothing is late. Nothing is over budget. Somehow.','Has a planner. Still. Three of them.','Works in safety. Appropriate.','Medical professional. Triple-checks everything. You want this.','Has a system for everything. Systems are working.','Architect. The structures do not fall. Intentional.','Quality assurance. The best at finding the one thing wrong.','Making it work through pure preparation. Always has.','Running things behind the scenes. Nothing fails when they\'re around.','Still color-coding. Still right.'],
    'Surprised':  ['Reacts to things on YouTube. 847K subscribers.','Stumbled into a career that fits perfectly. No plan involved.','Accidental expert in a niche nobody expected. Wrote a book about it.','Went somewhere for a week. Stayed for three years. Still there.','Made a decision on a whim. Best one of their life.','Applied as a joke. Got the job. Still processing.','Has a life that makes no narrative sense and is genuinely great.','Started something to see what would happen. It became their thing.','Was in the right place at the right time. Has since made it permanent.','Found something by accident. Built something on purpose.','Did the thing everyone said wouldn\'t work. It worked.','Still figuring it out. Ahead of most people doing the same.','The pivot worked. Nobody is more surprised than them.','Following a path that didn\'t exist when they started.','Made the unexpected choice. It was the right one.'],
    'Disgusted':  ['Food critic. Impossible to please. Writes beautifully about it.','Editor-in-chief. Standards are exacting. Publication is excellent.','Restaurant inspector. Has closed things. Rightly.','Executive producer. Nothing gets past them. That\'s the point.','Art director. Has opinions. They\'re correct.','Film critic. Harsh. Accurate. Read widely.','Quality director. Standards haven\'t dropped. Won\'t.','Runs a Michelin-starred kitchen. Was the only option.','Publishing editor. Has rejected famous manuscripts for correct reasons.','Consultant who tells companies what\'s wrong. Always right.','Making things better by refusing to accept less than excellent.','Has improved every institution they\'ve passed through.','Still the only person willing to say the thing out loud. Still correct.','Running standards at an organization that actually has them now.','Has found a job that rewards their refusal to settle. Finally.'],
    'Excited':    ['Motivational speaker. Has a TED talk. Working on the second.','Running every event they can get their hands on.','Adventure guide. Gets paid to do their favorite thing.','Marketing director. Makes campaigns people actually like.','Youth program director. Has changed more lives than they know.','Still this enthusiastic. It\'s a gift. People don\'t know how rare it is.','Chief of energy at a startup. Unofficial title. Most important role.','Making things happen in a field they invented for themselves.','Organized something huge. Doing it again.','Turned their enthusiasm into a career. Full circle.','Brand ambassador. Doesn\'t feel like work. That was the plan.','Events director. In their element. Never leaving.','Coaching people who needed exactly this energy. Finding them.','Running programs that give other people their starts.','Still saying yes to everything. Still right to.'],
    'Serious':    ['Surgeon. Excellent. Doesn\'t say much about it.','Research scientist. Published. Cited. Working on what\'s next.','Military officer. Respected. Earned.','Running an operation others would have simplified. Keeping it rigorous.','Head of something that actually matters. Quiet about it.','Working at a level that doesn\'t require explaining.','Building something designed to outlast them. On track.','The person in the room who has actually read everything.','Doing work that requires silence to do properly. Doing it properly.','In a field that rewards precision. Rewarded.','The one they call when it has to be right the first time.','Somewhere that matches their standards. Took a while. Here now.','Has built a career on reliability. Collected on it.','Still working. Still the best at it. No fanfare required.','Did the thing they said they would do. Exactly how they said they would.'],
    'Tired':      ['Asleep. Leave a message.','Remote work. Has not left the house in four days. Fine.','Night shift. Always. By choice now.','Has found a schedule that lets them sleep. Protective of it.','Working from bed when possible. Has made this sustainable.','On sabbatical. Extended.','Barista. Good at it. Tired of people but fine.','Freelancing. The freedom is real. So is the exhaustion.','Has simplified everything to require less energy. Smart.','Found a rhythm that doesn\'t destroy them. Keeping it.','Working on not working as much. Progress.','Has learned to say no. Game-changing. Still recovering.','The exact right amount of okay.','Has earned the naps. Taking all of them.','Found the balance. It involved doing less. Still counts.'],
    'Cheeky':     ['Something in crypto. Doing fine. Suspiciously fine.','Running a startup. Third one. Learning from the others.','Comedian. Has a special. It\'s good. Don\'t tell them yet.','Found the loophole in the industry. Exploiting it legally.','Influencer. The good kind. Has standards. Selectively.','Grey area consultant. Billing well.','Has three things going. None of them quite explainable.','Making money doing something that sounds made up but isn\'t.','Started something as a joke. Wouldn\'t stop being profitable.','Technically self-employed. Actually thriving.','The most interesting LinkedIn profile in the feed.','Got away with it. Still getting away with it.','Running something. Not explaining it. It\'s fine.','Has figured out a thing. Not sharing it.','Doing extremely well. Cause unknown. Outcome: real.'],
    'Suspicious': ['Private investigator. Won\'t confirm or deny their own location.','Cybersecurity. Knows things. Not saying what.','Forensic accountant. Has found things. Has proven things.','Intelligence analyst. Can\'t discuss it. Literally.','Works in verification. Appropriate.','Security consultant. Finds the hole before others do.','Investigative journalist. Three deep investigations in progress.','Fact-checker. The most valuable person in any newsroom.','Cold case researcher. Has solved two. Working on the third.','Knows more than they\'re saying. Professionally.','Works somewhere that requires a clearance. Has it.','Audits things. Everything is different after.','OSINT researcher. Publicly available information has never been more useful.','Has a job nobody fully understands. That\'s the point.','Still watching everything. Now getting paid for it.'],
    'Content':    ['Park ranger. Loves every day.','Runs a small bookshop. Knows all the regulars. Has cats.','Beekeeper. This was not the plan. It\'s perfect.','Librarian. Exactly right.','Small business owner. Local. Loyal customer base. No plans to scale.','Makes cheese. This is not a joke. Award-winning.','Teaches art. Students remember them years later.','Landscape architect. Makes places beautiful. Quietly satisfied.','Community garden manager. The garden is thriving. So are they.','Archivist. Perfect job. Nobody bothers them.','Slow food restaurateur. Four tables. Reservation two months out.','Rural vet. The animals can\'t thank them. The owners do.','Found their thing early. Protected it ever since.','Living the life others would move for. Never left.','In the right place, finally, with no plans to leave.'],
    '_default':   ['Doing their thing. Unbothered. Thriving.','Living their best life somewhere nobody knows about.','Fine. Genuinely fine.','Exactly where they planned to be. Maybe.','Still figuring it out but winning somehow.','Out here. Making it work.','Thriving quietly. Doesn\'t need you to know.','Making it look easy.','Keeping a low profile. Doing great.','Somewhere warm, probably.','Off the grid. By choice.','Living simply. Happy about it.','Not on social media. Doing better because of it.','Building something. Quietly.','Somewhere between "figuring it out" and "figured it out."','Alive and well. That\'s all the update we\'re getting.','Doing okay. Which is more than okay.','Somewhere unexpected. Somehow thriving.','Living rent-free in nobody\'s head. Bliss.','Making moves. Not announcing them.','Living their life. Posting nothing. Happy.','Still here. Still them. Still fine.','Moved. Thriving. Didn\'t tell anyone where.','Working on something. Won\'t say what. It\'s good.','Doing things at their own pace. Getting there.','Found their thing. Running with it quietly.','Good. Really good. Annoyingly good.','Living the version of life they always meant to.','Out there. Untracked. Content.','Growing. Slowly. Steadily. Saying nothing about it.','Where they belong. Took a while. Worth it.','In their element, wherever that turned out to be.','Making it work every single day. Quietly proud of that.','Has no complaints. Genuinely.','Still themselves. After everything. Still them.'],
  },
};

const CLUBS = {
  byEyes: {
    'Round Glasses': ['Chess Club', 'Debate Team', 'AV Club'],
    'Monocle':       ['Philosophy Society', 'Antiquities Appreciation'],
    'Sunglasses':    ['Photography Club', 'Film Society'],
    'Squinting':     ['Vision Board Club (Ironic)'],
  },
  byExpression: {
    'Confident':  ['Student Council', 'Varsity Sports'],
    'Sad':        ['Poetry Club', 'Drama Club'],
    'Happy':      ['Pep Squad', 'Volunteer Corps'],
    'Angry':      ['Debate Team', 'Boxing Club'],
    'Bored':      ['Library Monitor', 'Competitive Sitting'],
    'Smug':       ['Spelling Bee', 'Academic Decathlon'],
    'Nervous':    ['Yearbook Committee', 'Math Team'],
    'Surprised':  ['Conspiracy Theory Awareness Club'],
    'Disgusted':  ['Culinary Critics Circle'],
    'Excited':    ['Everything Club', 'Pep Squad', 'Student Government'],
    'Suspicious': ['Fact-Checking Club', 'Mystery Novel Society'],
    'Content':    ['Gardening Club', 'Quiet Hours Enforcer'],
    'Tired':      ['Nap Club (Founding Member)'],
    'Cheeky':     ['Drama Club', 'Detention Regular'],
  },
  byAccessory: {
    'Headband':   ['Track & Field', 'Student Council'],
    'Chain':      ['Entrepreneurship Club', 'Future Moguls Society'],
    'Hat':        ['Media Production', 'Podcast Club (Unofficial)'],
    'Pipe':       ['Literature Circle', 'Stoics Anonymous'],
    'Earring':    ['Art Club', 'Self-Expression Society'],
    'Bow Tie':    ['Model UN', 'Etiquette Society'],
    'Crown':      ['Student Council (Unchallenged)'],
  },
  byFacial: {
    'Scar':      ['Fight Club (1st rule applies)'],
    'Beard':     ['Faculty Lounge (Honorary)'],
    'Freckles':  ['Photography Club', 'Art Club'],
    'Mustache':  ['Grooming Excellence Society'],
    'Tattoo':    ['Art Club', 'Rebellion Committee'],
  },
};

const GPA_MODIFIERS = {
  eyes:       { 'Round Glasses': 0.7, 'Monocle': 0.5, 'Sunglasses': -0.4, 'Squinting': -0.1 },
  expression: { 'Confident': 0.3, 'Smug': 0.5, 'Nervous': 0.2, 'Bored': -0.7, 'Angry': -0.5, 'Happy': 0.1, 'Sad': -0.1, 'Excited': 0.4, 'Tired': -0.8, 'Cheeky': -0.3 },
  accessory:  { 'Headband': 0.6, 'Chain': -0.3, 'Pipe': 0.4, 'Hat': -0.1, 'Crown': 0.2 },
  age:        { 'Young': -0.3, 'Teen': -0.5, 'Middle-Aged': 0.1, 'Old': 0.2, 'Elderly': 0.4, 'Adult': 0.05 },
  facial:     { 'Freckles': 0.1, 'Scar': -0.4, 'Beard': 0.2, 'Mustache': 0.1, 'Tattoo': -0.2 },
};

const SIGNATURES = {
  'Confident':  'You\'re going places. Don\'t forget us when you\'re there.\n— The Yearbook Committee',
  'Sad':        'It gets better. At least, that\'s what they keep saying.\n— Your Classmates (mostly)',
  'Happy':      'Never change. You\'re the only thing holding this class together.\n— Everyone',
  'Angry':      'Direct your energy wisely. We believe in you. Mostly.\n— Faculty Adviser (reluctantly)',
  'Bored':      'You\'ve seen through all of us from day one. Fair enough.\n— Class of \'26',
  'Smug':       'You were right. Probably. It\'s fine.\n— The Rest of Us',
  'Nervous':    'You\'re more ready than you know. We mean it.\n— Homeroom',
  'Surprised':  'The world is genuinely full of surprises. You\'ll fit right in.\n— Yearbook Staff',
  'Disgusted':  'Your standards are a problem and also kind of inspiring.\n— The Cafeteria',
  'Excited':    'Save some enthusiasm for the rest of us.\n— Exhausted Classmates',
  '_default':   'Good luck out there. Don\'t do anything we wouldn\'t do.\n— Class of \'26',
};

// =============================================
// CONTENT GENERATORS
// =============================================

function getTraitVal(traits, type) {
  const t = traits.find(t => t.trait_type === type);
  return t ? t.value : null;
}

function getSuperlative(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const eyes = getTraitVal(traits, 'Eyes');

  const pool   = SUPERLATIVE_POOLS[expr]        || SUPERLATIVE_POOLS['_default'];
  const base   = pool[id % pool.length];
  const suffix = SUPERLATIVES.eyesSuffix[eyes]  || SUPERLATIVES.eyesSuffix['_default'];
  return base + suffix;
}

function getAward(traits) {
  const acc = getTraitVal(traits, 'Accessory');
  return SUPERLATIVES.award[acc] || SUPERLATIVES.award['_default'];
}

function getSeniorQuote(traits, id) {
  const expr  = getTraitVal(traits, 'Expression');
  const pool  = FAMOUS_QUOTES[expr] || FAMOUS_QUOTES['_default'];
  const entry = pool[id % pool.length];
  return { text: entry.text, author: entry.author };
}

function getGPA(traits) {
  const expr  = getTraitVal(traits, 'Expression');
  const eyes  = getTraitVal(traits, 'Eyes');
  const acc   = getTraitVal(traits, 'Accessory');
  const age   = getTraitVal(traits, 'Age');
  const face  = getTraitVal(traits, 'Facial Feature');

  let gpa = 2.8;
  gpa += (GPA_MODIFIERS.eyes[eyes]       || 0);
  gpa += (GPA_MODIFIERS.expression[expr] || 0);
  gpa += (GPA_MODIFIERS.accessory[acc]   || 0);
  gpa += (GPA_MODIFIERS.age[age]         || 0);
  gpa += (GPA_MODIFIERS.facial[face]     || 0);

  gpa = Math.max(1.2, Math.min(4.0, gpa));
  return gpa.toFixed(2);
}

function getClubs(traits) {
  const expr  = getTraitVal(traits, 'Expression');
  const eyes  = getTraitVal(traits, 'Eyes');
  const acc   = getTraitVal(traits, 'Accessory');
  const face  = getTraitVal(traits, 'Facial Feature');

  const clubs = new Set();
  (CLUBS.byExpression[expr]  || []).forEach(c => clubs.add(c));
  (CLUBS.byEyes[eyes]        || []).forEach(c => clubs.add(c));
  (CLUBS.byAccessory[acc]    || []).forEach(c => clubs.add(c));
  (CLUBS.byFacial[face]      || []).forEach(c => clubs.add(c));

  const arr = [...clubs];
  return arr.length > 0 ? arr.slice(0, 5).join(', ') : 'None on record';
}

function getWhereNow(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const eyes = getTraitVal(traits, 'Eyes');

  // Specific combos stay as-is (e.g. Confident+Monocle has a special line)
  const comboKey = `${expr}+${eyes}`;
  if (WHERE_ARE_THEY_NOW.combos[comboKey]) {
    return WHERE_ARE_THEY_NOW.combos[comboKey];
  }

  const pool = WHERE_ARE_THEY_NOW.byExpression[expr]
            || WHERE_ARE_THEY_NOW.byExpression['_default'];
  return pool[Math.floor(id / 5) % pool.length];
}

function getSignature(traits) {
  const expr = getTraitVal(traits, 'Expression');
  return SIGNATURES[expr] || SIGNATURES['_default'];
}

// =============================================
// STUDENT FILE — Sport, Profession, Drink,
//               Energy, Hidden Talent, Kryptonite
// =============================================

const SPORT_POOLS = {
  'Confident':  ['Basketball','Competitive Swimming','Track & Field','Tennis','CrossFit','American Football','Soccer','Weightlifting','Competitive Cycling','Volleyball','Rowing','Triathlon','Sprint','High Jump','Competitive Surfing'],
  'Angry':      ['Boxing','MMA','Wrestling','Rugby','Ice Hockey','Judo','Kickboxing','Powerlifting','Lacrosse','Water Polo','Muay Thai','Arm Wrestling','Competitive Rage-Quitting','Full-Contact Chess','Dodgeball (too aggressively)'],
  'Happy':      ['Ultimate Frisbee','Doubles Tennis','Recreational Soccer','Surfing','Dance','Cheerleading','Badminton','Pickleball','Kayaking','Volleyball (beach)','Disc Golf','Zumba','Competitive Smiling','Synchronized Swimming','Group Yoga'],
  'Bored':      ['Golf','Curling','Bocce Ball','Slow-pitch Softball','Darts','Billiards','Fishing Derby','Cornhole (competitive)','Watching Sports','Bowling','Shuffleboard','Croquet','Napping (competitive)','Chair Yoga','Spectating'],
  'Nervous':    ['Archery','Gymnastics','Figure Skating','Fencing','Diving','Table Tennis','Precision Rifle','Rhythmic Gymnastics','Competitive Chess','Shooting Sports','Parallel Bars','Balance Beam','Dressage','Snooker','Competitive Knitting (timed)'],
  'Smug':       ['Polo','Fencing','Squash','Sailing','Rowing','Croquet','Equestrian','Golf','Cricket','Real Tennis','Competitive Wine Tasting','Polo (water)','Dressage','Regatta','Competitive Antiquing'],
  'Sad':        ['Long-distance Running','Solo Rowing','Cross Country','Marathon','Solo Swimming','Solo Cycling','Free Diving','Trail Running','Ultra-marathon','Nordic Skiing','Open Water Swimming','Solo Mountaineering','Competitive Journaling','Iron Man (alone)','Night Running'],
  'Surprised':  ['Bungee Jumping','Skydiving','Rock Climbing','Parkour','Whitewater Rafting','Snowboarding','Kitesurfing','Motocross','Obstacle Racing','BASE Jumping','Cliff Diving','Wingsuit Flying','Barefoot Skiing','Extreme Pogo','Fell Running'],
  'Excited':    ['Triathlon','Rock Climbing','Competitive Cheerleading','CrossFit','Breakdancing','Adventure Racing','Obstacle Racing','Competitive Dance','Gymnastics','Parkour','Aerial Yoga','Acrobatics','Sprint Triathlon','Heptathlon','Everything at Once'],
  'Disgusted':  ['Equestrian','Artistic Swimming','Technical Diving','Ballroom Dance','Golf','Sailing','Tennis','Dressage','Competitive Cooking (sport version)','Figure Skating','Synchronized Swimming','Archery (traditional)','Polo','Croquet','Fencing'],
  'Serious':    ['Competitive Rowing','Powerlifting','Olympic Weightlifting','Decathlon','Marathon','Competitive Swimming','Military Pentathlon','Judo','Wrestling','Stage Cycling','Biathlon','Modern Pentathlon','Heavyweight Boxing','Ironman','Rucking'],
  'Tired':      ['Yoga','Fishing','Slow Hiking','Tai Chi','Recreational Swimming','Lawn Bowls','Gentle Cycling','Restorative Yoga','Bird Watching (competitive)','Napping (aggressively)','Hot Tub Sitting','Hammock Racing','Competitive Resting','Slow Roll','Leisurely Bocce'],
  'Cheeky':     ['Skateboarding','Parkour','Snowboarding','Surfing','BMX','Slacklining','Disc Golf','Spikeball','Street Racing','Underground Fight Club (hypothetical)','Competitive Graffiti','Capoeira','Trick Shots','Illegal Racing','Free Running'],
  'Suspicious': ['Orienteering','Escape Room Racing','Geocaching','Competitive Chess','Poker','Precision Archery','Sniper Shooting','Go','Puzzle Racing','Drone Racing','Surveillance Walking','Competitive Reading (speed)','Cipher Solving','Tracking','Lock Picking (sport)'],
  'Content':    ['Hiking','Recreational Bowling','Casual Cycling','Paddleboarding','Bird Watching','Disc Golf','Nature Walking','Kayaking','Gardening Olympics','Casual Swimming','Fishing','Hammocking','Stargazing','Foraging','Gentle Rowing'],
  '_default':   ['Running','Swimming','Cycling','Tennis','Soccer','Basketball','Volleyball','Hiking','Yoga','Weightlifting'],
};

const PROFESSION_POOLS = {
  'Confident':  ['Startup Founder','Trial Lawyer','Venture Capitalist','CEO','Hedge Fund Manager','Head Coach','Fighter Pilot','Sports Agent','Investment Banker','Neurosurgeon','Political Candidate','Brand Strategist','Real Estate Developer','Senior Partner','Executive Director'],
  'Sad':        ['Therapist','Author','Social Worker','Grief Counselor','Documentary Filmmaker','Clinical Psychologist','Museum Curator','Music Composer','Hospice Worker','Crisis Counselor','Literary Translator','Environmental Activist','Public Radio Host','Poet','Nonprofit Founder'],
  'Happy':      ['Elementary Teacher','Event Planner','Pediatric Nurse','Community Organizer','Yoga Instructor','Wedding Photographer','Life Coach','Camp Director','Children\'s Book Author','Florist','Animal Trainer','Parks Manager','Social Media Manager (the good kind)','Wellness Coach','Travel Blogger'],
  'Angry':      ['Public Defender','Union Organizer','Investigative Journalist','Labor Lawyer','Whistleblower Advocate','Civil Rights Lawyer','Consumer Rights Attorney','Reform Politician','Protest Organizer','Anti-Corruption Investigator','Ethics Officer','Environmental Lawyer','Public Ombudsman','Accountability Journalist','Campaign Manager'],
  'Bored':      ['Actuary','Compliance Auditor','Insurance Adjuster','Tax Preparer','Government Form Reviewer','Middle Manager (Indefinitely)','Quality Assurance Tester (Mobile Games)','Parking Enforcement Officer','DMV Supervisor','Elevator Inspector','Manual Tester','File Clerk (Senior)','Administrative Assistant','Data Entry Specialist (Retired at 35)','Toll Booth Operator (Part-time)'],
  'Smug':       ['Art Director','Literary Agent','Venture Capitalist','Art Critic','Brand Consultant','Architecture Critic','Fashion Editor','Opinion Columnist','Wine Sommelier','Luxury Real Estate Agent','Curator (Major Museum)','Publishing Executive','Trend Forecaster','Critic-at-Large','Hedge Fund Manager'],
  'Nervous':    ['Risk Analyst','Compliance Officer','Pharmacist','Actuary','Safety Inspector','Insurance Underwriter','Quality Control Manager','Food Safety Auditor','Cybersecurity Analyst','Backup Systems Engineer','Disaster Recovery Specialist','Medical Coder','Legal Proofreader','Emergency Preparedness Director','Clinical Trial Coordinator'],
  'Surprised':  ['Accidental Entrepreneur','Improv Coach','Career Transition Coach','Startup Advisor (Fell Into It)','Product Manager (Still Figuring It Out)','Accidental Influencer','Pivot Strategist','Serial Experimenter','Discovery Officer','Spontaneous Inventor','Content Creator (Unexpectedly)','Freelance Consultant','Journey Documenter','Trend Spotter','Accidental Expert'],
  'Disgusted':  ['Food Critic','Editor-in-Chief','Restaurant Inspector','Quality Assurance Director','Literary Editor','Film Critic','Standards Board Member','Consumer Advocate','Michelin Inspector','Health Inspector','Menu Consultant','Product Recall Manager','Executive Producer','Yelp Elite (Professional)','Negative Space Designer'],
  'Excited':    ['Marketing Director','PE Teacher','Adventure Tour Guide','TED Speaker','Startup Evangelist','Brand Ambassador','Motivational Speaker','Events Director','Youth Program Director','Product Launch Specialist','Fitness Influencer','Chief Enthusiasm Officer','Experience Designer','Campaign Manager','Hype Person (Official)'],
  'Serious':    ['Surgeon','Military Officer','Research Scientist','Federal Judge','Chief of Staff','Structural Engineer','Nuclear Engineer','Forensic Pathologist','Diplomat','Air Traffic Controller','Neurosurgeon','Aerospace Engineer','Defense Attorney','UN Negotiator','National Security Analyst'],
  'Tired':      ['Night Shift Nurse','Remote Worker (Perpetually)','Overnight Security Guard','Late Night Radio DJ','Insomniac Blogger','Part-time Everything','Perpetual Graduate Student','Barista (Ten Years Running)','Crisis Hotline Operator','Overnight Bread Baker','Early Retirement Claimant','Sabbatical Specialist','24hr Diner Owner','Professional Napper (Aspiring)','Freelancer (Barely)'],
  'Cheeky':     ['Startup Founder (Third One)','Comedian','Loophole Consultant','Escape Room Designer','Poker Professional','Street Artist','Con Artist (Reformed)','Grey Area Specialist','Technically Legal Advisor','Chaos Consultant','Disruptive Innovator','Professional Provocateur','Improv Performer','Hustler (Various Industries)','Content Creator'],
  'Suspicious': ['Private Investigator','Forensic Accountant','Cybersecurity Analyst','Intelligence Analyst','Fraud Investigator','Cold Case Detective','Background Check Specialist','InfoSec Researcher','OSINT Investigator','Fact-Checker','Counterintelligence Officer','Digital Forensics Expert','Leak Investigator','Whistleblower (Twice)','Corporate Spy (Allegedly)'],
  'Content':    ['Park Ranger','Librarian','Landscape Architect','Small Business Owner','Beekeeper','Local Journalist','Elementary Art Teacher','Bookshop Owner','Botanical Garden Curator','Archivist','Community Garden Manager','Slow Food Restaurateur','Rural Veterinarian','Independent Bookseller','Cheese Maker'],
  '_default':   ['Project Manager','Consultant','Freelancer','Entrepreneur','Marketing Manager','Designer','Writer','Analyst','Engineer','Researcher'],
};

const SIGNATURE_DRINK = {
  'Confident':  'Black coffee. No sugar. Obviously.',
  'Sad':        'Cold brew that got warm. Didn\'t notice.',
  'Happy':      'Sparkling water with fruit in it. Named it.',
  'Angry':      'Espresso. Double. Right now.',
  'Bored':      'Whatever\'s closest.',
  'Smug':       'Single origin pour-over. Explained the process.',
  'Nervous':    'Chamomile tea. Decaf. Just in case.',
  'Surprised':  'Accidentally ordered a matcha latte. It\'s their thing now.',
  'Disgusted':  'Filtered water. Exactly the right temperature.',
  'Excited':    'Energy drink and green juice. Simultaneously.',
  'Serious':    'Black coffee. Scheduled.',
  'Tired':      'Whatever has the most caffeine in it.',
  'Cheeky':     'Something they technically shouldn\'t have been served.',
  'Suspicious': 'Sealed bottle. From a store they personally vetted.',
  'Content':    'Herbal tea. Made slowly. Enjoyed fully.',
  '_default':   'Water. Sometimes with ice.',
};

const ENERGY_TYPE = {
  'Confident':  'Final Boss Energy',
  'Sad':        'Tragic Backstory Arc Energy',
  'Happy':      'Support Character Carrying The Whole Team Energy',
  'Angry':      'Villain Origin Story Energy',
  'Bored':      'Background NPC Energy',
  'Smug':       'Already Knows The Ending Energy',
  'Nervous':    'Still On The Tutorial Level Energy',
  'Surprised':  'Perpetual Loading Screen Energy',
  'Disgusted':  'Too Good For This Quest Energy',
  'Excited':    'Side Quest Completionist Energy',
  'Serious':    'Main Character Zero Dialogue Energy',
  'Tired':      'Respawn Timer Energy',
  'Cheeky':     'Found A Glitch And Used It Energy',
  'Suspicious': 'Watching The Cutscene For Hidden Clues Energy',
  'Content':    'Retired Veteran NPC With Lore Energy',
  '_default':   'Unnamed Background Character Energy',
};

const HIDDEN_TALENT_POOLS = {
  'Frumpy Hair':   ['Can find parking anywhere, instantly.','Remembers every Wi-Fi password they\'ve ever connected to.','Can assemble IKEA furniture without instructions.','Always arrives exactly on time. Never a second early.','Knows every shortcut in any city.'],
  'Mohawk':        ['Can silence a room by walking in.','Has never lost a staring contest. Not once.','Intimidates vending machines into working.','Always ends up with the aux cord.','Makes entire crowds part instinctively.'],
  'Bald':          ['Extraordinary poker face. Unreadable.','Can bluff anyone about anything, successfully.','Appears in the background of strangers\' important photos.','Reads people within 10 seconds of meeting them.','Never gives away what they\'re actually thinking.'],
  'Afro':          ['Always knows where the best food in any city is.','Can navigate anywhere without GPS.','Finds hidden gem restaurants others walk past daily.','Knows every local secret spot within 24hrs of arriving.','Sniffs out the best table in any restaurant.'],
  'Ponytail':      ['Can read a room in under 3 seconds.','Always knows what time it is without checking.','Detects when someone is lying with 94% accuracy.','Has perfect organizational instincts.','Never forgets a face, ever.'],
  'Buzz Cut':      ['Photographic memory for faces.','Can memorize a phone number after hearing it once.','Always knows exactly how long something will take.','Never gets lost. Not once.','Perfect spatial awareness in any environment.'],
  'Half Shaved':   ['Turns any mistake into an aesthetic choice.','Can make anything look intentional.','Natural trend-setter. Everything they wear becomes a thing.','Pulls off combinations nobody else can explain.','Makes every outfit work regardless of logic.'],
  'Dreadlocks':    ['Can nap anywhere in under 90 seconds.','Wakes up refreshed from 12-minute naps.','Maintains a running mental catalogue of everything.','Perfect recall of conversations from years ago.','Always knows where everything is, in any space.'],
  'Curly Hair':    ['Can find the exact meme for any situation in seconds.','Always has the perfect reply, three days later.','Guesses song names from two notes.','Knows the exact calorie count of most foods by eye.','Consistently picks the fastest checkout line.'],
  'Straight Hair': ['Can parallel park perfectly first try, every time.','Always picks the right queue.','Knows the exact moment a silence has gone awkward.','Correctly guesses what someone was about to say.','Can type without looking at the keyboard at 95 WPM.'],
  '_default':      ['Unknown. Even to them.','Still being discovered.','Classified. Even from themselves.','TBD.','Exists. Yet to be named.'],
};

const KRYPTONITE = {
  'Confident':  'Someone who genuinely isn\'t impressed.',
  'Sad':        '"Are you okay?" asked with real eye contact.',
  'Happy':      'People who choose to be miserable, loudly.',
  'Angry':      'Paperwork. So much paperwork.',
  'Bored':      'Being asked to perform enthusiasm.',
  'Smug':       'Being publicly, demonstrably wrong.',
  'Nervous':    'An unscheduled change of plans.',
  'Surprised':  'Spoilers. Any spoilers. All spoilers.',
  'Disgusted':  'Other people\'s unexamined choices.',
  'Excited':    'Being told to calm down.',
  'Serious':    'Small talk with no exit.',
  'Tired':      '"Just one more thing."',
  'Cheeky':     'Actual, real consequences.',
  'Suspicious': '"Just trust me on this one."',
  'Content':    'Drama they didn\'t invite.',
  '_default':   'Mondays.',
};

// ── Playlist Vibe ──────────────────────────────
const PLAYLIST_VIBE_BASE = {
  'Confident':  'Pump-Up Rap & Stadium Anthems',
  'Sad':        'Sad Indie at 2am',
  'Happy':      'Feel-Good Pop & Summer Hits',
  'Angry':      'Rage Metal & Aggressive EDM',
  'Bored':      'Lo-fi Hip Hop (didn\'t choose it)',
  'Smug':       'Jazz & Obscure Vinyl Imports',
  'Nervous':    'Ambient & Soft Instrumentals',
  'Surprised':  'Random Shuffle — Whatever Plays',
  'Disgusted':  'Classical & Absolutely Nothing Else',
  'Excited':    'High-BPM Everything, All the Time',
  'Serious':    'Film Scores & Epic Orchestral',
  'Tired':      'Slow Jams at 0.75x Speed',
  'Cheeky':     'Early 2000s Chaotic Mix',
  'Suspicious': 'True Crime Podcasts & Conspiracy Docs',
  'Content':    'Acoustic Folk & Rainy Day Playlist',
  '_default':   'Shuffle Everything, No Skip',
};
const PLAYLIST_VIBE_SUFFIX = {
  'Round Glasses': ' (curated, no skips allowed)',
  'Monocle':       ' (vinyl only, obviously)',
  'Sunglasses':    ' (never shares the playlist)',
  'Classic Shades':'(the vibe is non-negotiable)',
  '_default':      '',
};

// ── Spirit Animal ──────────────────────────────
const SPIRIT_ANIMAL_BASE = {
  'Confident':  'Lion',
  'Sad':        'Whale (the singing kind)',
  'Happy':      'Golden Retriever',
  'Angry':      'Bull',
  'Bored':      'Sloth',
  'Smug':       'Persian Cat',
  'Nervous':    'Meerkat',
  'Surprised':  'Startled Deer',
  'Disgusted':  'Elegant Swan',
  'Excited':    'Labrador Puppy',
  'Serious':    'Wolf',
  'Tired':      'Panda (always napping)',
  'Cheeky':     'Raccoon',
  'Suspicious': 'Owl',
  'Content':    'Tortoise',
  '_default':   'Chameleon',
};
const SPIRIT_ANIMAL_SUFFIX = {
  'Freckles':      ' with unexpected depth',
  'Scar':          ' with a story',
  'Beard':         ' but distinguished',
  'Mustache':      ' but dapper',
  'Clean Shaven':  ' in peak condition',
  'Tattoo':        ' with full commitment',
  'Freckles':      ' secretly very wise',
  '_default':      '',
};

// ── Relationship Status ───────────────────────
const RELATIONSHIP_STATUS = {
  'Confident':  'In a relationship with their own potential.',
  'Sad':        'It\'s complicated. Always has been.',
  'Happy':      'In love with everyone. Platonically. Mostly.',
  'Angry':      'Single. By choice. Repeatedly.',
  'Bored':      'Together but mentally elsewhere.',
  'Smug':       'Dating someone who\'s very aware how lucky they are.',
  'Nervous':    'Talking. For the last eleven months.',
  'Surprised':  'Somehow in a situationship they didn\'t plan.',
  'Disgusted':  'Standards are high. They\'re aware.',
  'Excited':    'In love! With everything! With everyone!',
  'Serious':    'Focused. Relationships are Q4.',
  'Tired':      'Together. Asleep by 9.',
  'Cheeky':     'It\'s a vibe. Don\'t label it.',
  'Suspicious': 'Seeing someone. Still verifying their alibi.',
  'Content':    'Happily settled. Zero drama.',
  '_default':   'It\'s complicated.',
};

// ── Most Likely To Say ────────────────────────
const MOST_LIKELY_TO_SAY_POOLS = {
  'Confident':  ['"Watch this."','"I already knew that."','"That\'s exactly what I predicted."','"Let me take the lead."','"Done. What\'s next?"','"I\'ve been saying this for years."','"Trust me."','"I got this."','"Not a problem."','"I\'ll handle it."'],
  'Sad':        ['"It\'s fine."','"No, don\'t worry about me."','"I\'m just tired."','"It\'s whatever."','"I knew this would happen."','"Maybe another time."','"I\'m okay. Just thinking."','"Never mind."','"It doesn\'t matter."','"I\'ll be fine."'],
  'Happy':      ['"Oh my god, same!"','"I love that for you."','"This is literally my favorite thing."','"We should do this every week."','"You\'re so amazing, genuinely."','"Best day ever, actually."','"I\'m so proud of you."','"This is everything."','"I\'m obsessed."','"You made my whole day."'],
  'Angry':      ['"Excuse me?"','"That\'s not okay."','"No, actually, let me finish."','"This is unacceptable."','"I said what I said."','"You knew exactly what you were doing."','"We\'re not done here."','"I have receipts."','"Someone needs to be held accountable."','"I need to speak to a manager."'],
  'Bored':      ['"Sure."','"Yeah, whatever."','"Are we done?"','"When does this end?"','"I\'ve seen this before."','"Fine."','"I don\'t care either way."','"Could be worse."','"Okay."','"Sure, why not."'],
  'Smug':       ['"I called it."','"As I said."','"You\'ll understand eventually."','"I\'ve known about this since 2019."','"Interesting. I disagree."','"Actually—"','"Well, technically—"','"I predicted this."','"I was right, as usual."','"Some of us saw this coming."'],
  'Nervous':    ['"Sorry, is this okay?"','"Just to confirm—"','"What time does this start exactly?"','"I prepared something, just in case."','"Is everyone sure about this?"','"I just want to double-check—"','"What\'s the backup plan?"','"Did everyone get the email I sent?"','"I\'m fine. Are you fine?"','"Did I do that right?"'],
  'Surprised':  ['"Wait, WHAT?"','"How did I not know this?"','"That\'s not what I expected at all."','"When did that happen?"','"I\'m shocked."','"Hold on, let me process this."','"Nobody told me!"','"I did not see that coming."','"Wait, seriously?"','"How is that even possible?"'],
  'Disgusted':  ['"Absolutely not."','"Who approved this?"','"I wouldn\'t."','"That\'s a choice."','"No thank you."','"I have concerns."','"This isn\'t it."','"Was no one going to say anything?"','"I need a moment."','"The bar was low and somehow—"'],
  'Excited':    ['"OH MY GOD."','"I\'m literally obsessed."','"We HAVE to do this."','"Best thing I\'ve ever seen."','"I\'m so excited I could cry."','"Can you believe this exists?"','"I\'ve already told everyone."','"We\'re doing this, right?"','"I\'ve been waiting my whole life for this."','"Say yes. Just say yes."'],
  'Serious':    ['"Let\'s focus."','"What\'s the objective here?"','"I need this in writing."','"That\'s not relevant to the task."','"What\'s the timeline?"','"Let\'s not waste time."','"Define success first."','"I\'ll need the data."','"Moving on."','"Results speak."'],
  'Tired':      ['"I just need five minutes."','"One more thing and I\'m done."','"Can we reschedule?"','"I\'ll do it tomorrow."','"Is this absolutely necessary?"','"Give me a second."','"I\'m almost ready."','"Just five more minutes."','"I\'m awake. I\'m awake."','"I was going to, and then I didn\'t."'],
  'Cheeky':     ['"Technically, that\'s not a rule."','"What are they gonna do?"','"I didn\'t NOT do it."','"In my defense—"','"Allegedly."','"That\'s one way to look at it."','"I found a workaround."','"No one said I couldn\'t."','"Worth it."','"Okay but hear me out."'],
  'Suspicious': ['"Who told you that?"','"And you believed them?"','"That\'s convenient timing."','"I\'m going to need sources."','"Something doesn\'t add up."','"Let me look into it."','"I had a feeling."','"Define \'trust\'."','"What exactly were you doing at that time?"','"I\'m not saying anything. I\'m just noting."'],
  'Content':    ['"I\'m good, thanks."','"That works for me."','"No complaints."','"Happy either way."','"Sounds good."','"I\'m easy."','"Whatever you\'d like."','"That\'s fine with me."','"I don\'t mind either way."','"All good here."'],
  '_default':   ['"Let me think about that."','"Good point."','"I\'ll get back to you."','"Fair enough."','"That tracks."','"Interesting."','"Could be."','"Maybe."','"We\'ll see."','"Sure."'],
};

// ── Dream Vacation ────────────────────────────
const DREAM_VACATION_POOLS = {
  'Young':       ['Tokyo, Japan','Bali, Indonesia','Barcelona, Spain','New York City','Seoul, South Korea','Ibiza, Spain','Tulum, Mexico','Mykonos, Greece','Berlin, Germany','Dubai, UAE','Santorini, Greece','Los Angeles','Coachella (technically counts)','Amsterdam, Netherlands','Miami Beach'],
  'Teen':        ['Tokyo, Japan','Seoul, South Korea','London, UK','New York City','Los Angeles','Paris, France','Anywhere with good Wi-Fi','Universal Studios Orlando','Comic-Con San Diego','Anywhere their parents said no to'],
  'Middle-Aged': ['Tuscany, Italy','Paris, France','Kyoto, Japan','Costa Rica','Iceland','The Amalfi Coast','New Zealand','Patagonia, Argentina','Swiss Alps','Lisbon, Portugal','Santorini, Greece','Prague','London, UK','Copenhagen, Denmark','The Scottish Highlands'],
  'Old':         ['Southern France','Portugal','The Greek Islands','Vienna, Austria','Seville, Spain','Lake Como, Italy','The Algarve, Portugal','Bruges, Belgium','Bath, England','Salzburg, Austria','Prague, Czech Republic','The Dolomites','Tuscany, Italy','A River Cruise Through Europe','The Loire Valley'],
  'Elderly':     ['A long cruise','Somewhere warm, always','Wherever the grandchildren are','The old country','A small Italian village','Southern France, quietly','Somewhere with good food and no stairs','The lake house','Wherever they went on their honeymoon','The same place they always go — it\'s perfect'],
  '_default':    ['Anywhere but here, honestly','Somewhere warm','Somewhere with great food','Somewhere quiet','Somewhere loud','The road, no plan','TBD — open to suggestions','Wherever looks good on a map','Somewhere nobody knows them','The next flight out'],
};
const DREAM_VACATION_ACCESSORY = {
  'Headband':  ' (training camp booked alongside)',
  'Chain':     ' (VIP everything, obviously)',
  'Hat':       ' (recording a podcast episode there)',
  'Pipe':      ' (for the history and architecture)',
  'Earring':   ' (entirely for the photos)',
  'Crown':     ' (entire floor reserved)',
  '_default':  '',
};

// ─────────────────────────────────────────────
function getSport(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const pool = SPORT_POOLS[expr] || SPORT_POOLS['_default'];
  return pool[id % pool.length];
}

function getProfession(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const pool = PROFESSION_POOLS[expr] || PROFESSION_POOLS['_default'];
  // Different seed than sport so they don't always pair the same way
  return pool[Math.floor(id / 3) % pool.length];
}

function getHiddenTalent(traits, id) {
  const hair = getTraitVal(traits, 'Hair Style');
  const pool = HIDDEN_TALENT_POOLS[hair] || HIDDEN_TALENT_POOLS['_default'];
  return pool[Math.floor(id / 11) % pool.length];
}

function getPlaylistVibe(traits) {
  const expr = getTraitVal(traits, 'Expression');
  const eyes = getTraitVal(traits, 'Eyes');
  const base   = PLAYLIST_VIBE_BASE[expr]   || PLAYLIST_VIBE_BASE['_default'];
  const suffix = PLAYLIST_VIBE_SUFFIX[eyes] || PLAYLIST_VIBE_SUFFIX['_default'];
  return base + suffix;
}

function getSpiritAnimal(traits) {
  const expr = getTraitVal(traits, 'Expression');
  const face = getTraitVal(traits, 'Facial Feature');
  const base   = SPIRIT_ANIMAL_BASE[expr]    || SPIRIT_ANIMAL_BASE['_default'];
  const suffix = SPIRIT_ANIMAL_SUFFIX[face]  || SPIRIT_ANIMAL_SUFFIX['_default'];
  return base + suffix;
}

function getMostLikelyToSay(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const pool = MOST_LIKELY_TO_SAY_POOLS[expr] || MOST_LIKELY_TO_SAY_POOLS['_default'];
  return pool[Math.floor(id / 13) % pool.length];
}

function getDreamVacation(traits, id) {
  const age  = getTraitVal(traits, 'Age');
  const acc  = getTraitVal(traits, 'Accessory');
  const pool = DREAM_VACATION_POOLS[age] || DREAM_VACATION_POOLS['_default'];
  const dest = pool[Math.floor(id / 17) % pool.length];
  const mod  = DREAM_VACATION_ACCESSORY[acc] || DREAM_VACATION_ACCESSORY['_default'];
  return dest + mod;
}

// ── Favorite Anime Character ──────────────────
const ANIME_CHARACTER_POOLS = {
  'Confident': [
    'Vegeta (Dragon Ball Z)', 'Roy Mustang (Fullmetal Alchemist: Brotherhood)',
    'Lelouch vi Britannia (Code Geass)', 'Light Yagami (Death Note)',
    'Gilgamesh (Fate/Stay Night)', 'Dio Brando (JoJo\'s Bizarre Adventure)',
    'Seto Kaiba (Yu-Gi-Oh!)', 'Madara Uchiha (Naruto Shippuden)',
    'Sosuke Aizen (Bleach)', 'Meruem (Hunter x Hunter)',
    'Kaguya Shinomiya (Kaguya-sama: Love is War)', 'Sinbad (Magi)',
    'Ainz Ooal Gown (Overlord)', 'Anos Voldigoad (Misfit of Demon King Academy)',
    'Ryomen Sukuna (Jujutsu Kaisen)', 'Escanor (The Seven Deadly Sins)',
    'Yami Sukehiro (Black Clover)', 'Byakuya Kuchiki (Bleach)',
    'Itachi Uchiha (Naruto Shippuden)', 'Rimuru Tempest (That Time I Got Reincarnated as a Slime)',
    'Erwin Smith (Attack on Titan)', 'Hisoka (Hunter x Hunter)',
    'Trafalgar Law (One Piece)', 'Doflamingo (One Piece)',
    'Izaya Orihara (Durarara!!)', 'Rin Tohsaka (Fate/Stay Night)',
    'Reinhard van Astrea (Re:Zero)', 'Charlotte Katakuri (One Piece)',
    'Shoto Todoroki (My Hero Academia)', 'Gintoki Sakata (Gintama)',
    'Muzan Kibutsuji (Demon Slayer)', 'Azami Nakiri (Food Wars!)',
    'Fumikage Tokoyami (My Hero Academia)', 'Shanks (One Piece)', 'Satoru Gojo (Jujutsu Kaisen)',
  ],
  'Sad': [
    'Kaneki Ken (Tokyo Ghoul)', 'Shinji Ikari (Neon Genesis Evangelion)',
    'Homura Akemi (Puella Magi Madoka Magica)', 'Rei Ayanami (Neon Genesis Evangelion)',
    'Violet Evergarden (Violet Evergarden)', 'Gaara (Naruto — early arc)',
    'Frieren (Frieren: Beyond Journey\'s End)', 'Edward Elric (Fullmetal Alchemist: Brotherhood)',
    'Alphonse Elric (Fullmetal Alchemist: Brotherhood)', 'Guts (Berserk)',
    'Casca (Berserk)', 'Nana Osaki (NANA)',
    'Hanabi Yasuraoka (Scum\'s Wish)', 'Yuki Nagato (The Melancholy of Haruhi Suzumiya)',
    'Annie Leonhart (Attack on Titan)', 'Historia Reiss (Attack on Titan)',
    'Yuu Koito (Bloom Into You)', 'Ciel Phantomhive (Black Butler)',
    'Zero Two (Darling in the FranXX)', 'Retsuko (Aggretsuko)',
    'Simon (Gurren Lagann — post-Kamina)', 'Tomoya Okazaki (Clannad)',
    'Yuzuru Otonashi (Angel Beats!)', 'Rin Matsuoka (Free!)',
    'Kousei Arima (Your Lie in April)', 'Kaori Miyazono (Your Lie in April)',
    'Anohana (AnoHana: The Flower We Saw That Day)', 'Jinta Yadomi (AnoHana)',
    'Riko Amaniya (A Silent Voice)', 'Shoya Ishida (A Silent Voice)',
    'Subaru Natsuki (Re:Zero)', 'Soma Cruz (Castlevania — anime)',
    'Akame (Akame ga Kill)', 'Mikasa Ackerman (Attack on Titan)', 'L Lawliet (Death Note)',
  ],
  'Happy': [
    'Monkey D. Luffy (One Piece)', 'Naruto Uzumaki (Naruto)',
    'Izuku Midoriya (My Hero Academia)', 'Goku (Dragon Ball Z)',
    'Tohru Honda (Fruits Basket)', 'Koro-sensei (Assassination Classroom)',
    'Usopp (One Piece)', 'Rock Lee (Naruto)',
    'Mako Mankanshoku (Kill la Kill)', 'Hinata Shoyo (Haikyuu!!)',
    'Takeshi Goda / Giant (Doraemon)', 'Doraemon (Doraemon)',
    'Chika Fujiwara (Kaguya-sama: Love is War)', 'Sasha Blouse (Attack on Titan)',
    'Asta (Black Clover)', 'Zenitsu Agatsuma (Demon Slayer — happy mode)',
    'Yui Hirasawa (K-On!)', 'Ritsu Tainaka (K-On!)',
    'Chiyo Sakura (Monthly Girls\' Nozaki-kun)', 'Tohru (Miss Kobayashi\'s Dragon Maid)',
    'Emilia (Re:Zero)', 'Winry Rockbell (Fullmetal Alchemist: Brotherhood)',
    'Nami (One Piece — when rich)', 'Nezuko Kamado (Demon Slayer)',
    'Klee (Genshin Impact anime-adjacent)', 'Yuiko Hawthorne (Angel Beats!)',
    'Sena Kashiwazaki (Haganai)', 'Haruhi Fujioka (Ouran High School Host Club)',
    'Hachiman Hikigaya (OreGairu — rare happy moments)', 'Tsukasa Yuzaki (Tonikawa)',
    'Nasa Yuzaki (Tonikawa)', 'Sakura Kinomoto (Cardcaptor Sakura)',
    'Konosuba Megumin (KonoSuba)', 'Aqua (KonoSuba)', 'Taiga Aisaka (Toradora)',
  ],
  'Angry': [
    'Bakugo Katsuki (My Hero Academia)', 'Vegeta (Dragon Ball Z — early)',
    'Asuka Langley Soryu (Neon Genesis Evangelion)', 'Ryuko Matoi (Kill la Kill)',
    'Revy (Black Lagoon)', 'Yusuke Urameshi (Yu Yu Hakusho)',
    'Inosuke Hashibira (Demon Slayer)', 'Asta (Black Clover — yelling mode)',
    'Denji (Chainsaw Man)', 'Power (Chainsaw Man)',
    'Natsu Dragneel (Fairy Tail)', 'Gray Fullbuster (Fairy Tail)',
    'Grimmjow Jaegerjaquez (Bleach)', 'Kenpachi Zaraki (Bleach)',
    'Eijiro Kirishima (My Hero Academia)', 'Muscular (My Hero Academia)',
    'Thorfinn (Vinland Saga — young)', 'Askeladd (Vinland Saga)',
    'Levi Ackerman (Attack on Titan — on titan-killing missions)', 'Tomioka Giyuu (Demon Slayer)',
    'Killua Zoldyck (Hunter x Hunter — assassin mode)', 'Ging Freecss (Hunter x Hunter)',
    'Guy Sensei (Naruto)', 'Tsunade (Naruto)',
    'Scar (Fullmetal Alchemist: Brotherhood)', 'Kimblee (Fullmetal Alchemist: Brotherhood)',
    'Ghoul Kaneki (Tokyo Ghoul)', 'Toga Himiko (My Hero Academia)',
    'Muscular (My Hero Academia)', 'Dabi (My Hero Academia)',
    'Ladd Russo (Baccano!)', 'Yuno (Black Clover — intense)',
    'Yoruichi Shihoin (Bleach)', 'Sanji (One Piece)', 'Nami (One Piece — debt mode)',
  ],
  'Bored': [
    'Shikamaru Nara (Naruto)', 'Saitama (One Punch Man)',
    'Tanaka-kun (Tanaka-kun Is Always Listless)', 'Hachiman Hikigaya (My Teen Romantic Comedy SNAFU)',
    'Oreki Houtarou (Hyouka)', 'Umaru Doma (Himouto! Umaru-chan)',
    'Tomoko Kuroki (WataMote)', 'Kirino Kousaka (Oreimo — bored with normies)',
    'Tsukishima Kei (Haikyuu!!)', 'Tsuyu Asui (My Hero Academia — low-affect)',
    'Killua Zoldyck (Hunter x Hunter — at school)', 'Gon Freecss (Hunter x Hunter — waiting)',
    'Mob / Shigeo Kageyama (Mob Psycho 100)', 'Araragi Koyomi (Monogatari Series)',
    'Hikaru (Hikaru no Go — post-Sai)', 'Spike Spiegel (Cowboy Bebop)',
    'Faye Valentine (Cowboy Bebop)', 'Jet Black (Cowboy Bebop)',
    'Haruhi Suzumiya (Haruhi — on slow days)', 'Yuki Nagato (Haruhi — always)',
    'Kyoya Ootori (Ouran High School Host Club)', 'Izaya Orihara (Durarara!! — when unstimulated)',
    'Hisoka (HxH — between fights)', 'Gilgamesh (Fate — during peace)',
    'Anos Voldigoad (Misfit — when not challenged)', 'Rimuru Tempest (Slime — admin days)',
    'Hyouka Chitanda\'s foil Oreki (Hyouka)', 'Shoto Todoroki (MHA — off-duty)',
    'Megumi Fushiguro (Jujutsu Kaisen)', 'Ryuuji Takasu (Toradora)',
    'Shinpachi Shimura (Gintama)', 'Itaru Chigasaki (A3!)',
    'Kenma Kozume (Haikyuu!!)', 'Oikawa Tooru (Haikyuu!! — post-loss)',
    'Tomura Shigaraki (MHA — off-scheming)',
  ],
  'Smug': [
    'Light Yagami (Death Note)', 'Lelouch vi Britannia (Code Geass)',
    'Hisoka Morow (Hunter x Hunter)', 'Dio Brando (JoJo\'s Bizarre Adventure)',
    'Sosuke Aizen (Bleach)', 'Kaguya Shinomiya (Kaguya-sama)',
    'Byakuya Kuchiki (Bleach)', 'Ryomen Sukuna (Jujutsu Kaisen)',
    'Gilgamesh (Fate/Zero)', 'Frieza (Dragon Ball Z)',
    'Izaya Orihara (Durarara!!)', 'Seto Kaiba (Yu-Gi-Oh!)',
    'Reigen Arataka (Mob Psycho 100)', 'Hange Zoe (Attack on Titan — explaining things)',
    'Shiroe (Log Horizon)', 'Layla Hamilton (Carole & Tuesday)',
    'Fumiya Tomozaki (Bottom-Tier Character Tomozaki)', 'Medaka Kurokami (Medaka Box)',
    'Nnoitra Gilga (Bleach)', 'Grimmjow Jaegerjaquez (Bleach)',
    'Kyoya Ootori (Ouran)', 'Tamaki Suoh (Ouran — when winning)',
    'Shiki Granbell (Edens Zero)', 'Osamu Dazai (Bungo Stray Dogs)',
    'Chuuya Nakahara (Bungo Stray Dogs)', 'Yumeko Jabami (Kakegurui)',
    'Mary Saotome (Kakegurui)', 'Kirari Momobami (Kakegurui)',
    'Ryoma Echizen (Prince of Tennis)', 'Atobe Keigo (Prince of Tennis)',
    'Bisco Akaboshi (Sabikui Bisco)', 'Mikaela Hyakuya (Seraph of the End)',
    'Mahiru Shirota (Servamp)', 'Izuku Midoriya (MHA — strategic mode)',
    'Senku Ishigami (Dr. Stone)',
  ],
  'Nervous': [
    'Zenitsu Agatsuma (Demon Slayer)', 'Shinji Ikari (Neon Genesis Evangelion)',
    'Izuku Midoriya (My Hero Academia — pre-quirk)', 'Hinata Shoyo (Haikyuu!! — first game)',
    'Tamaki Amajiki (My Hero Academia)', 'Mitsuki Bakugo (MHA — school events)',
    'Nagato Yuki (Haruhi — social)', 'Tomoko Kuroki (WataMote)',
    'Mei Misaki (Another)', 'Aoba Seragaki (DRAMAtical Murder)',
    'Subaru Natsuki (Re:Zero — new loops)', 'Armin Arlert (Attack on Titan — early)',
    'Connie Springer (Attack on Titan)', 'Chihiro Ogino (Spirited Away)',
    'Asuna Yuuki (SAO — first floor)', 'Kirito (SAO — meeting people)',
    'Megumi Tadokoro (Food Wars! — early)', 'Usagi Tsukino/Sailor Moon (Sailor Moon)',
    'Gon Freecss (HxH — Killua\'s family)', 'Koichi Hirose (JoJo\'s Part 4)',
    'Yusuke Urameshi (YYH — talking to girls)', 'Nobara Kugisaki (JK — new situations)',
    'Yuji Itadori (JK — first encounter)', 'Sakura Haruno (Naruto — early)',
    'Hinata Hyuga (Naruto)', 'Tohru Honda (Fruits Basket — secret exposed)',
    'Retsuko (Aggretsuko — at work)', 'Ryuuji Takasu (Toradora — talking to Taiga)',
    'Haruhi Fujioka (Ouran — Tamaki moments)', 'Yuki Sohma (Fruits Basket)',
    'Eita Kidou (Toilet-Bound Hanako-kun)', 'Tsukune Aono (Rosario + Vampire)',
    'Issei Hyoudou (High School DxD — first club meeting)', 'Mizuki Inaba (Rascal Does Not Dream)',
    'Kona Furugoori (ROBOTICS;NOTES)',
  ],
  'Surprised': [
    'Gon Freecss (Hunter x Hunter)', 'Luffy (One Piece)',
    'Koichi Hirose (JoJo\'s Part 4)', 'Yoshikage Kira\'s victims (JoJo\'s Part 4)',
    'Natsu Dragneel (Fairy Tail)', 'Ryner Lute (Legend of the Legendary Heroes)',
    'Haruka Nanase (Free! — when surprised)', 'Erina Nakiri (Food Wars! — first divine taste)',
    'Soma Yukihira (Food Wars! — new ingredients)', 'Alibaba Saluja (Magi)',
    'Alibaba (Magi — Sinbad reveals)', 'Akira Fudou (Devilman Crybaby)',
    'Yuya Sakaki (Yu-Gi-Oh! Arc-V)', 'Yugi Muto (Yu-Gi-Oh! — Kaiba plays)',
    'Minato Namikaze (Naruto — flashbacks)', 'Kakashi Hatake (Naruto)',
    'Boruto Uzumaki (Boruto)', 'Sarada Uchiha (Boruto — plot twists)',
    'Rimuru Tempest (Slime — unexpected evolution)', 'Ainz Ooal Gown (Overlord — plans work)',
    'Seiya Ryuuguuin (Cautious Hero)', 'Kazuma Satou (KonoSuba)',
    'Aqua (KonoSuba — anything)', 'Megumin (KonoSuba — explosion aftermath)',
    'Bell Cranel (Is It Wrong to Try to Pick Up Girls in a Dungeon?)',
    'Hestia (DanMachi)', 'Hajime Nagumo (Arifureta — before fall)',
    'Naofumi Iwatani (Shield Hero — betrayal)', 'Maple (Bofuri)',
    'Masato Oosuki (Okaa-san Online)', 'Shirou Emiya (Fate/Stay Night)',
    'Rin Tohsaka (Fate — summoning Archer)', 'Kiritsugu Emiya (Fate/Zero — wish granted)',
    'Lester MacPhail (The Asterisk War)', 'Tatsuya Shiba (The Irregular at Magic High School)',
  ],
  'Disgusted': [
    'Erina Nakiri (Food Wars!)', 'Byakuya Kuchiki (Bleach)',
    'Sasuke Uchiha (Naruto — around Naruto)', 'Killua Zoldyck (HxH — weak enemies)',
    'Gilgamesh (Fate — mongrels)', 'Frieza (Dragon Ball Z — Saiyans)',
    'Satsuki Kiryuin (Kill la Kill)', 'Medaka Kurokami (Medaka Box)',
    'Mikoto Misaka (A Certain Magical Index)', 'Accelerator (Index — early)',
    'Light Yagami (Death Note — criminals)', 'L Lawliet (Death Note — other suspects)',
    'Rias Gremory (High School DxD — enemies)', 'Akeno Himejima (DxD)',
    'Reinhard van Astrea (Re:Zero — incompetence)', 'Subaru reaction to Felix (Re:Zero)',
    'Kirino Kousaka (Oreimo — normies)', 'Chitoge Kirisaki (Nisekoi — Raku early)',
    'Kotegawa Yui (To Love-Ru)', 'Sena Kashiwazaki (Haganai)',
    'Kanade Tachibana (Angel Beats!)', 'Saber/Artoria (Fate — dishonor)',
    'Saeko Busujima (Highschool of the Dead)', 'Nami (One Piece — Luffy\'s plans)',
    'Robin (One Piece — fools)', 'Kyoko Sakura (Madoka)',
    'Ryuko Matoi (Kill la Kill — Satsuki early)', 'Asuka Langley (Eva — Shinji)',
    'Fumino Furuhashi (We Never Learn)', 'Iona Hikawa (Precure series)',
    'Shoko Komi (Komi Can\'t Communicate)', 'Ami Kawashima (Toradora)',
    'Yin (Darker than Black)', 'Yuki Cross (Vampire Knight)',
    'Kuroyukihime (Accel World)',
  ],
  'Excited': [
    'Might Guy (Naruto)', 'Rock Lee (Naruto)',
    'Asta (Black Clover)', 'Kirishima Eijiro (My Hero Academia)',
    'Goku (Dragon Ball — Saiyan transformation)', 'Gohan (DBZ — power-up)',
    'Soma Yukihira (Food Wars! — challenge accepted)', 'Ryuko Matoi (Kill la Kill — determined)',
    'Simon (Gurren Lagann — post-timeskip)', 'Kamina (Gurren Lagann)',
    'Yoko Littner (Gurren Lagann)', 'Leorio Paradinight (Hunter x Hunter)',
    'Gon Freecss (HxH — fighting)', 'Sasha Blouse (AoT — food)',
    'Connie Springer (AoT — enthusiasm)', 'Maka Albarn (Soul Eater)',
    'Black Star (Soul Eater)', 'Soul Evans (Soul Eater)',
    'Natsu Dragneel (Fairy Tail)', 'Elfman (Fairy Tail)',
    'Ippo Makunouchi (Hajime no Ippo)', 'Takamura Mamoru (Hajime no Ippo)',
    'Ryuji Sakamoto (Persona 5 anime)', 'Yusuke Kitagawa (Persona 5)',
    'Hinata Shoyo (Haikyuu!!)', 'Bokuto Kotaro (Haikyuu!!)',
    'Nishinoya Yuu (Haikyuu!!)', 'Tanaka Ryunosuke (Haikyuu!!)',
    'Usopp (One Piece)', 'Chopper (One Piece)',
    'Franky (One Piece)', 'Brook (One Piece)',
    'Chika Fujiwara (Kaguya-sama)', 'Mimi Tachikawa (Digimon)',
    'Tai Kamiya (Digimon)',
  ],
  'Serious': [
    'Levi Ackerman (Attack on Titan)', 'Erwin Smith (Attack on Titan)',
    'Itachi Uchiha (Naruto Shippuden)', 'Neji Hyuga (Naruto)',
    'Roy Mustang (FMA:B — battlefield)', 'Riza Hawkeye (Fullmetal Alchemist: Brotherhood)',
    'Olivier Mira Armstrong (Fullmetal Alchemist: Brotherhood)', 'Greed (FMA:B — Ling arc)',
    'Meruem (Hunter x Hunter)', 'Netero (Hunter x Hunter)',
    'Killua Zoldyck (HxH — serious mode)', 'Gintoki Sakata (Gintama — serious arc)',
    'Kenshin Himura (Rurouni Kenshin)', 'Hajime Saito (Rurouni Kenshin)',
    'Aoshi Shinomori (Rurouni Kenshin)', 'Spike Spiegel (Cowboy Bebop)',
    'Jet Black (Cowboy Bebop)', 'Vincent Law (Ergo Proxy)',
    'Re-L Mayer (Ergo Proxy)', 'Kogami Shinya (Psycho-Pass)',
    'Akane Tsunemori (Psycho-Pass)', 'Ginoza Nobuchika (Psycho-Pass)',
    'Hana (Wolf Children)', 'Tohru\'s father (Fruits Basket — Kyo arc)',
    'Shikamaru Nara (Naruto — war arc)', 'Tsunade (Naruto — serious)',
    'Hiruzen Sarutobi (Naruto)', 'Minato Namikaze (Naruto — 4th Hokage)',
    'Satoru Gojo (JJK — serious fights)', 'Megumi Fushiguro (JJK)',
    'Nanami Kento (Jujutsu Kaisen)', 'Yuta Okkotsu (JJK)',
    'Izuku Midoriya (MHA — blackwhip mode)', 'All Might (MHA — fight mode)',
    'Endeavor (My Hero Academia)',
  ],
  'Tired': [
    'Tanaka-kun (Tanaka-kun Is Always Listless)', 'Saitama (One Punch Man — after fights)',
    'Sakamoto Tatsuma (Gintama)', 'Hachiman Hikigaya (OreGairu — all the time)',
    'Oreki Houtarou (Hyouka)', 'Umaru Doma (Himouto! Umaru-chan — after events)',
    'Tobio Kageyama (Haikyuu!! — recovery)', 'Kenma Kozume (Haikyuu!! — gaming nights)',
    'Tsukishima Kei (Haikyuu!! — practices)', 'Ryuuji Takasu (Toradora — cleaning)',
    'Kirito (SAO — long sessions)', 'Klein (SAO — early grind)',
    'Shigeo Kageyama/Mob (Mob Psycho 100)', 'Osamu Dazai (Bungo Stray Dogs — acting)',
    'Shinpachi Shimura (Gintama)', 'Nobita Nobi (Doraemon)',
    'Kira Yoshikage (JoJo\'s Part 4 — after a long day)', 'Rohan Kishibe (JoJo\'s Part 4)',
    'Shinji Ikari (Eva — after sync)', 'Faye Valentine (Cowboy Bebop — broke)',
    'Gintoki Sakata (Gintama — Monday morning)', 'Kazuma Satou (KonoSuba — party issues)',
    'Ryner Lute (Legend of Legendary Heroes)', 'Takemichi Hanagaki (Tokyo Revengers)',
    'Haruhi Suzumiya (Haruhi — slow days)', 'Reigen Arataka (Mob Psycho 100 — fraud guilt)',
    'Junta Shiraishi (Talentless Nana)', 'Euphemia li Britannia (Code Geass)',
    'Koichi Hirose (JoJo\'s Part 4 — all the time)', 'Naofumi Iwatani (Shield Hero — early)',
    'Makoto Tachibana (Free! — off-season)', 'Kaoru Hitachiin (Ouran)',
    'Banri Tada (Golden Time)', 'Ryuuji Takasu (Toradora)',
    'Anos Voldigoad (Misfit — bored of being unchallenged)',
  ],
  'Cheeky': [
    'Kamina (Gurren Lagann)', 'Usopp (One Piece)',
    'Gintoki Sakata (Gintama)', 'Nura Rikuo (Nura: Rise of the Yokai Clan)',
    'Kuwabara Kazuma (Yu Yu Hakusho)', 'Jin (Yu Yu Hakusho)',
    'Reigen Arataka (Mob Psycho 100)', 'Osamu Dazai (Bungo Stray Dogs)',
    'Chuuya Nakahara (BSD — trolling Dazai)', 'Hisoka Morow (Hunter x Hunter)',
    'Ging Freecss (HxH — parenthood fails)', 'Izaya Orihara (Durarara!!)',
    'Ladd Russo (Baccano!)', 'Isaac Dian (Baccano!)',
    'Miria Harvent (Baccano!)', 'Ayano Sugiura (Yuru Yuri)',
    'Megumin (KonoSuba)', 'Darkness (KonoSuba)',
    'Chris Christoferson (KonoSuba)', 'Chitoge Kirisaki (Nisekoi — teasing)',
    'Kana Arima (Oshi no Ko)', 'Aquamarine Hoshino (Oshi no Ko)',
    'Ryuko Matoi (Kill la Kill — mocking)', 'Inuyasha (Inuyasha)',
    'Miroku (Inuyasha)', 'Korosensei (Assassination Classroom)',
    'Nagisa Shiota (Assassination Classroom)', 'Karma Akabane (Assassination Classroom)',
    'Yusuke Urameshi (YYH — smack talk)', 'Denji (Chainsaw Man)',
    'Power (Chainsaw Man)', 'Hange Zoe (AoT — experimenting)',
    'Sasha Blouse (AoT)', 'Benimaru (Slime)',
    'Gobta (Slime)',
  ],
  'Suspicious': [
    'L Lawliet (Death Note)', 'Near (Death Note)',
    'Mello (Death Note)', 'Conan Edogawa (Detective Conan)',
    'Shinichi Kudo (Case Closed)', 'Hajime Kindaichi (Kindaichi Case Files)',
    'Fuutarou Uesugi (Quintessential Quintuplets — early)', 'Osamu Dazai (BSD — info gathering)',
    'Shiroe (Log Horizon — planning)', 'Lelouch vi Britannia (Code Geass — scheming)',
    'Light Yagami (Death Note — being watched)', 'Kurapika (Hunter x Hunter)',
    'Gon Freecss (HxH — Greed Island)', 'Killua Zoldyck (HxH — Zoldyck instincts)',
    'Roy Mustang (FMA — Führer Intel)', 'Scar (FMA — tracking)',
    'Riza Hawkeye (FMA — always)', 'Akane Tsunemori (Psycho-Pass)',
    'Shinya Kogami (Psycho-Pass)', 'Shougo Makishima (Psycho-Pass)',
    'Hei (Darker than Black)', 'Misaki Kirihara (Darker than Black)',
    'Yin (Darker than Black)', 'Alibaba Saluja (Magi — politics)',
    'Morgiana (Magi)', 'Koichi Hirose (JoJo — identifying stands)',
    'Jotaro Kujo (JoJo\'s Part 4)', 'Josuke Higashikata (JoJo — Kira hunt)',
    'Rohan Kishibe (JoJo — research)', 'Megumi Fushiguro (JJK — intel)',
    'Ryomen Sukuna (JJK — observing)', 'Guts (Berserk — travel)',
    'Griffith (Berserk)', 'Balsa Yonsa (Moribito)',
    'Loran Cehack (Turn A Gundam)',
  ],
  'Content': [
    'Thorfinn (Vinland Saga — adult)', 'Koro-sensei (Assassination Classroom — peaceful days)',
    'Tanjiro Kamado (Demon Slayer — off-mission)', 'Zenitsu (Demon Slayer — asleep)',
    'Hashirama Senju (Naruto — founding era)', 'Iruka Umino (Naruto)',
    'Minato Namikaze (Naruto — home)', 'Kushina Uzumaki (Naruto)',
    'Tsunade (Naruto — retirement dreams)', 'Kakashi Hatake (Naruto — post-war)',
    'Jiraiya (Naruto — writing mode)', 'Shikamaru Nara (Naruto — clouds)',
    'Choji Akimichi (Naruto)', 'Ino Yamanaka (Naruto)',
    'Rock Lee (Naruto — post-training)', 'Oreki Houtarou (Hyouka)',
    'Holo (Spice & Wolf)', 'Lawrence (Spice & Wolf)',
    'Yona (Yona of the Dawn — late arc)', 'Hak (Yona of the Dawn)',
    'Shinichi Izumi (Parasyte)', 'Migi (Parasyte — peaceful mode)',
    'Mushi-shi Ginko (Mushishi)', 'Kou Mabuchi (Ao Haru Ride)',
    'Futaba Yoshioka (Ao Haru Ride)', 'Kousei Arima (Your Lie in April — end)',
    'Saber/Artoria (Fate — Shirou\'s home)', 'Rider/Medusa (Fate/Stay Night)',
    'Natsume Takashi (Natsume\'s Book of Friends)', 'Kaname Madoka (Madoka — peaceful timeline)',
    'Sayaka Miki (Madoka — pre-witch)', 'Yui Hirasawa (K-On!)',
    'Ritsu Tainaka (K-On!)', 'Mio Akiyama (K-On!)',
    'Frieren (Frieren: Beyond Journey\'s End — late journey)',
  ],
  '_default': [
    'Naruto Uzumaki (Naruto)', 'Monkey D. Luffy (One Piece)',
    'Goku (Dragon Ball Z)', 'Edward Elric (Fullmetal Alchemist: Brotherhood)',
    'Levi Ackerman (Attack on Titan)', 'Tanjiro Kamado (Demon Slayer)',
    'Satoru Gojo (Jujutsu Kaisen)', 'Ichigo Kurosaki (Bleach)',
    'Spike Spiegel (Cowboy Bebop)', 'Rem (Re:Zero)',
    'Mikasa Ackerman (Attack on Titan)', 'Roronoa Zoro (One Piece)',
    'Sasuke Uchiha (Naruto)', 'Itachi Uchiha (Naruto)',
    'Saber/Artoria Pendragon (Fate/Stay Night)', 'Killua Zoldyck (Hunter x Hunter)',
    'Alucard (Hellsing Ultimate)', 'Yuno (Black Clover)',
    'Kirito (Sword Art Online)', 'Asuna Yuuki (Sword Art Online)',
    'Tohru Honda (Fruits Basket)', 'Violet Evergarden (Violet Evergarden)',
    'Frieren (Frieren: Beyond Journey\'s End)', 'Denji (Chainsaw Man)',
    'Makima (Chainsaw Man)', 'Anya Forger (Spy x Family)',
    'Loid Forger (Spy x Family)', 'Yor Forger (Spy x Family)',
    'Mob / Shigeo Kageyama (Mob Psycho 100)', 'Reigen Arataka (Mob Psycho 100)',
    'Osamu Dazai (Bungo Stray Dogs)', 'Holo (Spice & Wolf)',
    'Yumeko Jabami (Kakegurui)', 'Thorfinn (Vinland Saga)', 'Legoshi (Beastars)',
  ],
};

function getAnimeCharacter(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const pool = ANIME_CHARACTER_POOLS[expr] || ANIME_CHARACTER_POOLS['_default'];
  // Use id/19 as seed so it doesn't sync with other attributes
  return pool[Math.floor(id / 19) % pool.length];
}

function buildStudentFile(traits, id) {
  const expr = getTraitVal(traits, 'Expression');
  const items = [
    { icon: '🏅', label: 'Favorite Sport',      value: getSport(traits, id) },
    { icon: '💼', label: 'Profession',           value: getProfession(traits, id) },
    { icon: '☕', label: 'Signature Drink',      value: SIGNATURE_DRINK[expr]    || SIGNATURE_DRINK['_default'] },
    { icon: '⚡', label: 'Energy Type',          value: ENERGY_TYPE[expr]        || ENERGY_TYPE['_default'] },
    { icon: '✨', label: 'Hidden Talent',        value: getHiddenTalent(traits, id) },
    { icon: '💀', label: 'Kryptonite',           value: KRYPTONITE[expr]         || KRYPTONITE['_default'] },
    { icon: '🎵', label: 'Playlist Vibe',        value: getPlaylistVibe(traits) },
    { icon: '🐾', label: 'Spirit Animal',        value: getSpiritAnimal(traits) },
    { icon: '💘', label: 'Relationship Status',  value: RELATIONSHIP_STATUS[expr] || RELATIONSHIP_STATUS['_default'] },
    { icon: '🗣️', label: 'Most Likely to Say',  value: getMostLikelyToSay(traits, id) },
    { icon: '🧳', label: 'Dream Vacation',       value: getDreamVacation(traits, id) },
    { icon: '🎌', label: 'Favorite Anime Character', value: getAnimeCharacter(traits, id) },
  ];
  return items.map(s =>
    `<div class="stat-card">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-body">
        <div class="stat-label">${s.label}</div>
        <div class="stat-val">${s.value}</div>
      </div>
    </div>`
  ).join('');
}

// =============================================
// API
// =============================================

async function fetchTraits(id) {
  if (traitCache[id]) return traitCache[id];

  const res  = await fetch(`/api/normie/${id}/traits`);
  if (!res.ok) throw new Error(`Traits fetch failed: ${res.status}`);
  const data = await res.json();
  traitCache[id] = data.attributes || [];
  return traitCache[id];
}

// =============================================
// GRID RENDERING
// =============================================

function buildGrid(page) {
  const grid     = document.getElementById('normieGrid');
  const subtitle = document.getElementById('gridSubtitle');
  const start    = page * PAGE_SIZE;
  const end      = Math.min(start + PAGE_SIZE, TOTAL) - 1;

  subtitle.textContent = `Showing Normies #${start} – #${end}`;
  grid.innerHTML = '';

  for (let i = start; i <= end; i++) {
    grid.appendChild(buildCard(i));
  }

  // Lazy-load images with IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const wrap = entry.target;
      const id   = parseInt(wrap.dataset.id);

      const img  = document.createElement('img');
      img.alt    = `Normie #${id}`;
      img.onload = () => {
        wrap.innerHTML = '';
        wrap.appendChild(img);
      };
      img.onerror = () => {
        wrap.querySelector('.placeholder-id').textContent = `#${id}`;
      };
      img.src = `/api/normie/${id}/image.svg`;

      observer.unobserve(wrap);
    });
  }, { rootMargin: '120px' });

  grid.querySelectorAll('.card-img-wrap').forEach(w => observer.observe(w));
  updatePagination();
}

function buildCard(id) {
  const card = document.createElement('div');
  card.className = 'normie-card';
  card.dataset.id = id;

  card.innerHTML = `
    <div class="card-img-wrap" data-id="${id}">
      <div class="card-img-placeholder">
        <div class="placeholder-id">#${id}</div>
        <div>Loading...</div>
      </div>
    </div>
    <div class="card-overlay"><div class="card-overlay-text">View Profile</div></div>
    <div class="card-body">
      <div class="card-num">NORMIE #${id}</div>
      <div class="card-name">${generateName(id)}</div>
    </div>
  `;

  card.addEventListener('click', () => openModal(id));
  return card;
}

// =============================================
// MODAL
// =============================================

let currentModalId     = null;
let currentModalTraits = null;

// Rounded rectangle path helper for canvas
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Word-wrap helper for native canvas text
function wrapTextCanvas(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines  = [];
  let   current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function downloadYearbookPage() {
  if (currentModalId === null) return;
  const id     = currentModalId;
  const traits = currentModalTraits || [];
  const btn    = document.getElementById('downloadBtn');

  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg><span class="dl-label">Saving…</span>`;
  btn.disabled = true;

  try {
    // Collect all data
    const name        = generateModalName(id, traits);
    const award       = getAward(traits);
    const superlative = getSuperlative(traits, id);
    const fq          = getSeniorQuote(traits, id);
    const gpaNum      = parseFloat(getGPA(traits));
    const gpaHonor    = gpaNum >= 3.7 ? ' 🏆 Honors' : gpaNum >= 3.3 ? ' ⭐ Dean\'s List' : gpaNum < 2.0 ? ' 📉 Probation' : '';
    const gpaStr      = gpaNum.toFixed(2) + gpaHonor;
    const clubs       = getClubs(traits);
    const whereNow    = getWhereNow(traits, id);
    const signature   = getSignature(traits);
    const expr        = getTraitVal(traits, 'Expression');
    const fileItems = [
      { icon: '🏅', label: 'Fav Sport',     value: getSport(traits, id)                               },
      { icon: '💼', label: 'Profession',    value: getProfession(traits, id)                          },
      { icon: '☕', label: 'Sig Drink',     value: SIGNATURE_DRINK[expr] || SIGNATURE_DRINK['_default'] },
      { icon: '⚡', label: 'Energy',        value: ENERGY_TYPE[expr]     || ENERGY_TYPE['_default']     },
      { icon: '✨', label: 'Hidden Talent', value: getHiddenTalent(traits, id)                        },
      { icon: '💀', label: 'Kryptonite',   value: KRYPTONITE[expr]      || KRYPTONITE['_default']     },
      { icon: '🎵', label: 'Playlist',     value: getPlaylistVibe(traits)                             },
      { icon: '🐾', label: 'Spirit Animal',value: getSpiritAnimal(traits)                             },
      { icon: '💘', label: 'Status',       value: RELATIONSHIP_STATUS[expr] || RELATIONSHIP_STATUS['_default'] },
      { icon: '🗣', label: 'Most Says',    value: getMostLikelyToSay(traits, id)                      },
      { icon: '🧳', label: 'Dream Trip',   value: getDreamVacation(traits, id)                        },
      { icon: '🎌', label: 'Anime Fave',   value: getAnimeCharacter(traits, id)                       },
    ];

    // Fetch portrait as base64 (avoids canvas taint issues)
    const pngResp    = await fetch(`/api/normie/${id}/image.png`);
    if (!pngResp.ok) throw new Error(`Portrait fetch failed: ${pngResp.status}`);
    const pngBlob    = await pngResp.blob();
    const pngDataUrl = await new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(pngBlob);
    });
    const portrait = await new Promise((res, rej) => {
      const img   = new Image();
      img.onload  = () => res(img);
      img.onerror = rej;
      img.src     = pngDataUrl;
    });

    const W = 600, H = 900, DPR = 2;
    const GAP = 12; // gap between front and back

    // Front card
    const fc   = document.createElement('canvas');
    fc.width   = W * DPR;
    fc.height  = H * DPR;
    const fCtx = fc.getContext('2d');
    fCtx.scale(DPR, DPR);
    drawFrontCard(fCtx, W, H, { id, name, award, fq, portrait });

    // Back card
    const bc   = document.createElement('canvas');
    bc.width   = W * DPR;
    bc.height  = H * DPR;
    const bCtx = bc.getContext('2d');
    bCtx.scale(DPR, DPR);
    drawBackCard(bCtx, W, H, { id, traits, superlative, fq, gpaStr, clubs, whereNow, signature, fileItems });

    // Combine side-by-side into one image (avoids browser blocking second download)
    const combined   = document.createElement('canvas');
    combined.width   = (W * 2 + GAP) * DPR;
    combined.height  = H * DPR;
    const cCtx       = combined.getContext('2d');
    cCtx.fillStyle   = '#222222';
    cCtx.fillRect(0, 0, combined.width, combined.height);
    cCtx.drawImage(fc, 0, 0);
    cCtx.drawImage(bc, (W + GAP) * DPR, 0);
    _dlCanvas(combined, `normie-${id}-yearbook.png`);

  } catch (err) {
    console.error('Download failed:', err);
    alert('Download failed: ' + err.message);
  } finally {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span class="dl-label">Save Card</span>`;
    btn.disabled = false;
  }
}

function _dlCanvas(canvas, filename) {
  const a    = document.createElement('a');
  a.download = filename;
  a.href     = canvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── FRONT CARD ─────────────────────────────────────────────────────────────
// Black background, pixel-art portrait hero, white/gray frame + ornaments
function drawFrontCard(ctx, W, H, { id, name, award, fq, portrait }) {
  const NAVY  = '#111111';
  const GOLD  = '#BBBBBB';
  const GOLD2 = '#888888';
  const WHITE = '#FFFFFF';

  // Background
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);

  // Diagonal stripe texture (subtle gold lines)
  ctx.save();
  ctx.globalAlpha = 0.045;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = 10;
  for (let i = -H; i < W + H; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  ctx.restore();

  // Double border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = 2;
  ctx.strokeRect(13, 13, W - 26, H - 26);
  ctx.strokeStyle = GOLD2;
  ctx.lineWidth   = 1;
  ctx.strokeRect(21, 21, W - 42, H - 42);

  // Corner ornaments
  ctx.fillStyle    = GOLD;
  ctx.font         = 'bold 15px serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✶', 34,     34    );
  ctx.fillText('✶', W - 34, 34    );
  ctx.fillText('✶', 34,     H - 34);
  ctx.fillText('✶', W - 34, H - 34);

  // School name header
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle    = GOLD;
  ctx.font         = 'bold 21px "Playfair Display", Georgia, serif';
  ctx.fillText('NORMIE HIGH SCHOOL', W / 2, 66);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(52, 76); ctx.lineTo(W - 52, 76); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font      = '10.5px Georgia, serif';
  ctx.fillText('✶  THE BLOCKCHAIN  ·  ANNUAL YEARBOOK  ✶', W / 2, 93);

  // Portrait
  const PX = 150, PY = 110, PS = 300;

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(PX + 6, PY + 6, PS, PS);

  // Gold outer frame
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = 4;
  ctx.strokeRect(PX, PY, PS, PS);

  // Inner frame accent
  ctx.strokeStyle = GOLD2;
  ctx.lineWidth   = 1.5;
  ctx.strokeRect(PX + 6, PY + 6, PS - 12, PS - 12);

  // Pixel art — disable smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(portrait, PX + 4, PY + 4, PS - 8, PS - 8);

  // Identity block below portrait
  const baseY = PY + PS;

  ctx.fillStyle    = GOLD;
  ctx.font         = '13px Georgia, serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`NORMIE  #${id}`, W / 2, baseY + 30);

  ctx.fillStyle = WHITE;
  ctx.font      = 'bold 27px "Playfair Display", Georgia, serif';
  let dName = name;
  while (ctx.measureText(dName).width > W - 80 && dName.length > 4) dName = dName.slice(0, -1);
  if (dName !== name) dName += '…';
  ctx.fillText(dName, W / 2, baseY + 62);

  // Award badge pill
  if (award) {
    ctx.font = 'bold 10.5px Georgia, serif';
    const bW = Math.min(ctx.measureText(award).width + 28, W - 120);
    const bX = W / 2 - bW / 2;
    const bY = baseY + 76;
    roundRect(ctx, bX, bY, bW, 22, 11);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.fillStyle    = NAVY;
    ctx.textBaseline = 'middle';
    let aText = award;
    while (ctx.measureText(aText).width > bW - 16 && aText.length > 3) aText = aText.slice(0, -1);
    if (aText !== award) aText += '…';
    ctx.fillText(aText, W / 2, bY + 11);
    ctx.textBaseline = 'alphabetic';
  }

  // Ornament divider
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font      = '13px serif';
  ctx.textAlign = 'center';
  ctx.fillText('✶  ✶  ✶', W / 2, baseY + 120);

  // Quote teaser (2 lines max)
  if (fq && fq.text) {
    ctx.font      = 'italic 12px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const qLines  = wrapTextCanvas(ctx, `"${fq.text}"`, W - 130);
    const qY      = baseY + 142;
    qLines.slice(0, 2).forEach((line, i) => {
      if (i === 1 && qLines.length > 2) line = line.slice(0, -3) + '…"';
      ctx.fillText(line, W / 2, qY + i * 20);
    });
    ctx.font      = '10.5px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(`— ${fq.author}`, W / 2, qY + Math.min(qLines.length, 2) * 20 + 6);
  }

  // Footer
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(42, H - 44); ctx.lineTo(W - 42, H - 44); ctx.stroke();
  ctx.fillStyle    = 'rgba(255,255,255,0.3)';
  ctx.font         = '9px Georgia, serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText("CLASS OF '26  ·  ETHEREUM MAINNET  ·  normies.art", W / 2, H - 28);
}

// ── BACK CARD ──────────────────────────────────────────────────────────────
// White paper, all yearbook data: voted, quote, GPA, traits, file, where-now
function drawBackCard(ctx, W, H, { id, traits, superlative, fq, gpaStr, clubs, whereNow, signature, fileItems }) {
  const NAVY  = '#111111';
  const NAVY2 = '#000000';
  const GOLD  = '#888888';
  const CREAM = '#F8F8F8';
  const MUTED = '#777777';
  const PILL  = '#E4E4E4';

  // Background
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);

  // Aged paper ruled lines
  ctx.strokeStyle = 'rgba(26,43,92,0.055)';
  ctx.lineWidth   = 1;
  for (let ry = 86; ry < H - 38; ry += 21) {
    ctx.beginPath(); ctx.moveTo(30, ry); ctx.lineTo(W - 30, ry); ctx.stroke();
  }

  // Borders
  ctx.strokeStyle = NAVY2;
  ctx.lineWidth   = 2.5;
  ctx.strokeRect(12, 12, W - 24, H - 24);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Corner ornaments
  ctx.fillStyle    = GOLD;
  ctx.font         = 'bold 13px serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✶', 33,     33    );
  ctx.fillText('✶', W - 33, 33    );
  ctx.fillText('✶', 33,     H - 33);
  ctx.fillText('✶', W - 33, H - 33);

  // Header
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle    = NAVY;
  ctx.font         = 'bold 17px "Playfair Display", Georgia, serif';
  ctx.fillText('NORMIE HIGH SCHOOL', W / 2, 53);
  ctx.fillStyle = MUTED;
  ctx.font      = '9.5px Georgia, serif';
  ctx.fillText("STUDENT RECORD  ·  CLASS OF '26", W / 2, 69);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(38, 77); ctx.lineTo(W - 38, 77); ctx.stroke();

  let y    = 96;
  const LM = 38, RM = W - 38, CW = RM - LM;

  const divider = () => {
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(LM, y); ctx.lineTo(RM, y); ctx.stroke();
    y += 11;
  };

  const sectionLabel = (text) => {
    ctx.fillStyle    = GOLD;
    ctx.font         = 'bold 8.5px Georgia, serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, LM, y);
    y += 13;
  };

  // ── VOTED ──
  sectionLabel('V O T E D');
  ctx.fillStyle    = NAVY;
  ctx.font         = 'bold 15px "Playfair Display", Georgia, serif';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
  wrapTextCanvas(ctx, superlative, CW).slice(0, 2).forEach(line => {
    ctx.fillText(line, LM, y); y += 21;
  });
  y += 4;
  divider();

  // ── FAV QUOTE ──
  sectionLabel('F A V  Q U O T E');
  const qBarTop = y - 3;
  ctx.font      = 'italic 12px Georgia, serif';
  ctx.fillStyle = '#3D2B10';
  ctx.textAlign = 'left';
  const qLines  = wrapTextCanvas(ctx, `"${fq.text}"`, CW - 16);
  qLines.slice(0, 3).forEach((line, i) => {
    if (i === 2 && qLines.length > 3) line = line.slice(0, -3) + '…"';
    ctx.fillText(line, LM + 13, y); y += 18;
  });
  // Gold left bar
  ctx.fillStyle = GOLD;
  ctx.fillRect(LM + 3, qBarTop, 3, y - qBarTop);
  ctx.font      = '10px Georgia, serif';
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'right';
  ctx.fillText(`— ${fq.author}`, RM, y);
  ctx.textAlign = 'left';
  y += 12;
  divider();

  // ── GPA + ACTIVITIES ──
  ctx.font      = '9.5px Georgia, serif';
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'left';
  ctx.fillText('GPA', LM, y);
  ctx.fillStyle = NAVY;
  ctx.font      = 'bold 9.5px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(gpaStr, RM, y);
  y += 16;

  ctx.font      = '9.5px Georgia, serif';
  ctx.fillStyle = MUTED;
  ctx.textAlign = 'left';
  ctx.fillText('Activities', LM, y);
  ctx.fillStyle = NAVY;
  ctx.textAlign = 'right';
  const cLines  = wrapTextCanvas(ctx, clubs, CW - 72);
  ctx.fillText(cLines[0] || '', RM, y);
  if (cLines[1]) { y += 13; ctx.fillText(cLines[1], RM, y); }
  y += 13;
  divider();

  // ── STUDENT RECORD (trait pills) ──
  sectionLabel('S T U D E N T  R E C O R D');
  const pillW = Math.floor(CW / 2) - 5;
  let   col   = 0;
  traits.forEach(t => {
    const tx = LM + col * (pillW + 10);
    roundRect(ctx, tx, y - 11, pillW, 16, 4);
    ctx.fillStyle = PILL;
    ctx.fill();
    ctx.strokeStyle = 'rgba(26,43,92,0.18)';
    ctx.lineWidth   = 0.75;
    ctx.stroke();
    ctx.fillStyle    = NAVY;
    ctx.font         = '8.5px Georgia, serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
    let tTxt = `${t.trait_type}: ${t.value}`;
    while (ctx.measureText(tTxt).width > pillW - 8 && tTxt.length > 4) tTxt = tTxt.slice(0, -1);
    if (tTxt.length < (`${t.trait_type}: ${t.value}`).length) tTxt += '…';
    ctx.fillText(tTxt, tx + 5, y);
    col++;
    if (col >= 2) { col = 0; y += 18; }
  });
  if (col > 0) y += 18;
  y += 5;
  divider();

  // ── STUDENT FILE (2-col icon grid) ──
  sectionLabel('S T U D E N T  F I L E');
  const halfW = Math.floor(CW / 2) - 6;
  let   fcol  = 0;
  fileItems.forEach(item => {
    const fx = LM + fcol * (halfW + 12);
    ctx.font         = '11px serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle    = NAVY;
    ctx.fillText(item.icon, fx, y);
    ctx.font      = '7.5px Georgia, serif';
    ctx.fillStyle = MUTED;
    let lbl = item.label.length > 13 ? item.label.slice(0, 12) + '…' : item.label;
    ctx.fillText(lbl, fx + 17, y - 6);
    ctx.font      = 'bold 8.5px Georgia, serif';
    ctx.fillStyle = NAVY;
    let vTxt = item.value;
    while (ctx.measureText(vTxt).width > halfW - 22 && vTxt.length > 3) vTxt = vTxt.slice(0, -1);
    if (vTxt !== item.value) vTxt += '…';
    ctx.fillText(vTxt, fx + 17, y + 5);
    fcol++;
    if (fcol >= 2) { fcol = 0; y += 21; }
  });
  if (fcol > 0) y += 21;
  y += 5;
  divider();

  // ── WHERE ARE THEY NOW ──
  sectionLabel('WHERE ARE THEY NOW?');
  ctx.fillStyle    = NAVY;
  ctx.font         = '9.5px Georgia, serif';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
  wrapTextCanvas(ctx, whereNow, CW).slice(0, 3).forEach(line => {
    ctx.fillText(line, LM, y); y += 15;
  });
  y += 5;

  // ── SIGNATURE (only if space remains) ──
  if (y < H - 80) {
    divider();
    signature.split('\n').forEach(line => {
      if (line.startsWith('—') || line.startsWith('\u2014')) {
        ctx.font      = '9.5px Georgia, serif';
        ctx.fillStyle = MUTED;
      } else {
        ctx.font      = '14px "Caveat", cursive';
        ctx.fillStyle = '#3D2B1F';
      }
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(line, LM, y);
      y += 17;
    });
  }

  // Footer
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(38, H - 38); ctx.lineTo(W - 38, H - 38); ctx.stroke();
  ctx.fillStyle    = MUTED;
  ctx.font         = '8.5px Georgia, serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`Normie #${id}  ·  Normie High  ·  Class of '26  ·  normies.art`, W / 2, H - 24);
}

async function openModal(id) {
  currentModalId = id;
  const modal    = document.getElementById('modal');
  const loading  = document.getElementById('modalLoading');
  const spread   = document.getElementById('yearbookSpread');

  // Show modal in loading state
  modal.classList.remove('hidden');
  loading.classList.remove('hidden');
  spread.classList.add('hidden');

  document.body.style.overflow = 'hidden';

  try {
    const traits = await fetchTraits(id);
    populateModal(id, traits);
    loading.classList.add('hidden');
    spread.classList.remove('hidden');
    // Patch the grid card name so it matches gender/type too
    const correctedName = document.getElementById('modalName').textContent;
    document.querySelectorAll(`.normie-card[data-id="${id}"] .card-name`)
      .forEach(el => { el.textContent = correctedName; });
  } catch (err) {
    loading.innerHTML = `<p style="color:#8B1A1A">Couldn't load Normie #${id}.<br><small>${err.message}</small><br>Try again?</p>`;
    console.error(err);
  }
}

function populateModal(id, traits) {
  currentModalTraits = traits;
  const name = generateModalName(id, traits);

  // Photo
  const img = document.getElementById('modalImg');
  img.src   = `/api/normie/${id}/image.svg`;
  img.alt   = `Normie #${id}`;

  // Identity
  document.getElementById('modalId').textContent          = `NORMIE #${id}`;
  document.getElementById('modalName').textContent        = name;
  document.getElementById('modalAward').textContent       = getAward(traits);
  document.getElementById('modalSuperlative').textContent = getSuperlative(traits, id);
  const fq = getSeniorQuote(traits, id);
  document.getElementById('modalQuote').textContent       = `"${fq.text}"`;
  document.getElementById('modalQuoteAuthor').textContent = `— ${fq.author}`;

  // GPA
  const gpa     = parseFloat(getGPA(traits));
  const gpaStr  = gpa.toFixed(2);
  const gpaHonor = gpa >= 3.7 ? ' 🏆 Honors' : gpa >= 3.3 ? ' ⭐ Dean\'s List' : gpa < 2.0 ? ' 📉 Probation' : '';
  document.getElementById('modalGpa').textContent = gpaStr + gpaHonor;

  // Clubs
  document.getElementById('modalClubs').textContent = getClubs(traits);

  // Traits
  const traitsEl = document.getElementById('modalTraits');
  traitsEl.innerHTML = traits.map(t =>
    `<div class="trait-badge"><span>${t.trait_type}</span>${t.value}</div>`
  ).join('');

  // Where are they now
  document.getElementById('modalWhereNow').textContent  = getWhereNow(traits, id);
  document.getElementById('modalStudentFile').innerHTML = buildStudentFile(traits, id);

  // Signature
  const sig = getSignature(traits);
  document.getElementById('modalSignature').innerHTML = sig
    .split('\n')
    .map(line => line.startsWith('—') ? `<div style="font-size:14px;color:var(--text-muted);margin-top:4px">${line}</div>` : `<div>${line}</div>`)
    .join('');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.body.style.overflow = '';
  currentModalId     = null;
  currentModalTraits = null;
}

// =============================================
// PAGINATION
// =============================================

function updatePagination() {
  document.getElementById('pageInfo').textContent = `Page ${currentPage + 1} of ${TOTAL_PAGES}`;

  const prevBtns = [document.getElementById('prevPage'), document.getElementById('prevPage2')];
  const nextBtns = [document.getElementById('nextPage'), document.getElementById('nextPage2')];

  prevBtns.forEach(b => { if (b) b.disabled = currentPage === 0; });
  nextBtns.forEach(b => { if (b) b.disabled = currentPage >= TOTAL_PAGES - 1; });
}

function goToPage(page) {
  currentPage = Math.max(0, Math.min(TOTAL_PAGES - 1, page));
  buildGrid(currentPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================
// EVENT LISTENERS
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initial load
  buildGrid(0);

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => goToPage(currentPage - 1));
  document.getElementById('nextPage').addEventListener('click', () => goToPage(currentPage + 1));
  document.getElementById('prevPage2').addEventListener('click', () => goToPage(currentPage - 1));
  document.getElementById('nextPage2').addEventListener('click', () => goToPage(currentPage + 1));

  // Search by ID
  document.getElementById('searchBtn').addEventListener('click', () => {
    const val = parseInt(document.getElementById('idSearch').value);
    if (isNaN(val) || val < 0 || val > 9999) {
      alert('Enter a valid Normie ID between 0 and 9999.');
      return;
    }
    const targetPage = Math.floor(val / PAGE_SIZE);
    currentPage = targetPage;
    buildGrid(currentPage);
    // Auto-open the searched Normie after a brief delay
    setTimeout(() => openModal(val), 400);
  });

  // Hit Enter in search box
  document.getElementById('idSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  // Random
  document.getElementById('randomBtn').addEventListener('click', () => {
    const randomId = Math.floor(Math.random() * TOTAL);
    document.getElementById('idSearch').value = randomId;
    const targetPage = Math.floor(randomId / PAGE_SIZE);
    currentPage = targetPage;
    buildGrid(currentPage);
    setTimeout(() => openModal(randomId), 400);
  });

  // Modal download
  document.getElementById('downloadBtn').addEventListener('click', downloadYearbookPage);

  // Modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
