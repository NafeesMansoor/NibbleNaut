/**
 * Bay of Bengal trivia shown on the menu, pause and game-over screens. Each fact leads with one
 * headline figure. Numbers are rounded, widely published values (marked "about" where sources
 * differ); keep new entries to facts that are easy to verify.
 */
export interface Trivia {
  /** A big picture for the fact card. */
  emoji: string;
  /** Short headline figure, e.g. "2.2 million km²". */
  figure: string;
  /** What the figure measures, shown under it. */
  label: string;
  text: string;
  tag: 'Geography' | 'Wildlife' | 'People' | 'Weather' | 'Ocean floor' | 'Fishing' | 'Amazing fish' | 'Sea animals';
  /** Bangla figure, label and text. */
  bn?: { figure: string; label: string; text: string };
}

export const TRIVIA: Trivia[] = [
  { emoji: '🌊', figure: '2.2 million km²', label: 'surface area', tag: 'Geography', text: 'The Bay of Bengal is the largest bay in the world, about 15 times the size of Bangladesh.', bn: { figure: '২২ লাখ বর্গকিমি', label: 'আয়তন', text: 'বঙ্গোপসাগর পৃথিবীর সবচেয়ে বড় উপসাগর, আয়তনে বাংলাদেশের প্রায় ১৫ গুণ।' } },
  { emoji: '🗺️', figure: '4', label: 'countries on its shores', tag: 'Geography', text: 'Bangladesh, India, Myanmar and Sri Lanka all have coastlines on the Bay of Bengal.', bn: { figure: '৪টি', label: 'দেশের উপকূল', text: 'বাংলাদেশ, ভারত, মিয়ানমার আর শ্রীলঙ্কা — এই চার দেশেরই বঙ্গোপসাগরে উপকূল আছে।' } },
  { emoji: '🤿', figure: '≈ 4,700 m', label: 'deepest point', tag: 'Ocean floor', text: 'The deepest parts of the Bay are deeper than the Alps are tall. On average it is about 2,600 m deep.', bn: { figure: '≈ ৪,৭০০ মি', label: 'সবচেয়ে গভীর জায়গা', text: 'বঙ্গোপসাগরের সবচেয়ে গভীর অংশ আল্পস পর্বতের উচ্চতার চেয়েও গভীর। গড়ে এটি প্রায় ২,৬০০ মিটার গভীর।' } },
  { emoji: '📏', figure: '≈ 1,600 km', label: 'wide', tag: 'Geography', text: 'The Bay stretches roughly 1,600 km from the coast of India to the coast of Myanmar.', bn: { figure: '≈ ১,৬০০ কিমি', label: 'চওড়া', text: 'ভারতের উপকূল থেকে মিয়ানমারের উপকূল পর্যন্ত উপসাগরটি প্রায় ১,৬০০ কিলোমিটার চওড়া।' } },
  { emoji: '🧑‍🤝‍🧑', figure: '1 in 5', label: 'people on Earth', tag: 'People', text: 'About one in every five people in the world lives in the countries around the Bay of Bengal.', bn: { figure: '৫ জনে ১ জন', label: 'পৃথিবীর মানুষ', text: 'পৃথিবীর প্রতি পাঁচজন মানুষের প্রায় একজন বঙ্গোপসাগরের চারপাশের দেশগুলোতে থাকে।' } },
  { emoji: '🏞️', figure: '#1', label: 'largest river delta', tag: 'Geography', text: 'The Ganges, Brahmaputra and Meghna rivers build the biggest delta on Earth, covering most of Bangladesh and West Bengal.', bn: { figure: '১ নম্বর', label: 'সবচেয়ে বড় বদ্বীপ', text: 'গঙ্গা, ব্রহ্মপুত্র আর মেঘনা মিলে পৃথিবীর সবচেয়ে বড় বদ্বীপ গড়েছে, যা বাংলাদেশ আর পশ্চিমবঙ্গের বেশির ভাগ জুড়ে।' } },
  { emoji: '⛰️', figure: '≈ 1 billion t', label: 'of sediment a year', tag: 'Ocean floor', text: 'The Ganges and Brahmaputra carry around a billion tonnes of mud and sand into the Bay every year, among the most of any rivers on Earth.', bn: { figure: '≈ ১০০ কোটি টন', label: 'পলি প্রতি বছর', text: 'গঙ্গা আর ব্রহ্মপুত্র প্রতি বছর প্রায় ১০০ কোটি টন কাদা-বালি সাগরে বয়ে আনে — পৃথিবীর নদীগুলোর মধ্যে অন্যতম বেশি।' } },
  { emoji: '🪭', figure: '≈ 3,000 km', label: 'long underwater fan', tag: 'Ocean floor', text: 'All that river sand has built the Bengal Fan, the largest pile of sediment under any ocean. It reaches almost to the equator.', bn: { figure: '≈ ৩,০০০ কিমি', label: 'লম্বা সাগরতলের পাখা', text: 'নদীর সেই বালি জমে তৈরি হয়েছে বেঙ্গল ফ্যান — যেকোনো সাগরের তলায় পলির সবচেয়ে বড় স্তূপ। এটি প্রায় বিষুবরেখা পর্যন্ত চলে গেছে।' } },
  { emoji: '🐋', figure: '> 1 km', label: 'deep canyon', tag: 'Ocean floor', text: 'The “Swatch of No Ground” is an undersea canyon off Bangladesh, so deep that old sailors could not touch bottom. It is a protected home for whales and dolphins.', bn: { figure: '> ১ কিমি', label: 'গভীর খাদ', text: '“সোয়াচ অব নো গ্রাউন্ড” বাংলাদেশের কাছে সাগরের নিচের এক খাদ, এত গভীর যে পুরোনো নাবিকেরা তল খুঁজে পেত না। এটি তিমি আর ডলফিনের সুরক্ষিত বাড়ি।' } },
  { emoji: '🌳', figure: '≈ 10,000 km²', label: 'of mangrove forest', tag: 'Wildlife', text: 'The Sundarbans, shared by Bangladesh and India, is the largest mangrove forest in the world and a UNESCO World Heritage Site.', bn: { figure: '≈ ১০,০০০ বর্গকিমি', label: 'ম্যানগ্রোভ বন', text: 'বাংলাদেশ আর ভারতে ছড়ানো সুন্দরবন পৃথিবীর সবচেয়ে বড় ম্যানগ্রোভ বন, আর ইউনেস্কো বিশ্ব ঐতিহ্য।' } },
  { emoji: '🌱', figure: 'Sundari', label: 'the tree behind the name', tag: 'Wildlife', text: 'The Sundarbans is named after the sundari, a mangrove tree that grows there. Its roots poke up out of the mud to breathe.', bn: { figure: 'সুন্দরী', label: 'যে গাছের নামে নাম', text: 'সুন্দরবনের নাম এসেছে সুন্দরী গাছ থেকে। এর শ্বাসমূল কাদা ফুঁড়ে ওপরে উঠে শ্বাস নেয়।' } },
  { emoji: '🐯', figure: 'Swimmers', label: 'Bengal tigers', tag: 'Wildlife', text: 'Tigers of the Sundarbans are strong swimmers. They cross tidal rivers between islands and even catch fish and crabs.', bn: { figure: 'সাঁতারু', label: 'বাঘ', text: 'সুন্দরবনের রয়েল বেঙ্গল টাইগার দারুণ সাঁতারু। জোয়ারের নদী সাঁতরে এক দ্বীপ থেকে আরেক দ্বীপে যায়, এমনকি মাছ আর কাঁকড়াও ধরে।' } },
  { emoji: '🏖️', figure: '≈ 120 km', label: 'of sandy beach', tag: 'Geography', text: 'Cox’s Bazar in Bangladesh is often called the world’s longest natural unbroken sea beach.', bn: { figure: '≈ ১২০ কিমি', label: 'বালুকাবেলা', text: 'বাংলাদেশের কক্সবাজারকে প্রায়ই পৃথিবীর দীর্ঘতম প্রাকৃতিক অবিচ্ছিন্ন সমুদ্রসৈকত বলা হয়।' } },
  { emoji: '🪸', figure: '1', label: 'coral island', tag: 'Wildlife', text: 'Saint Martin’s Island is Bangladesh’s only coral island, home to coral, sea turtles and colourful reef fish.', bn: { figure: '১টি', label: 'প্রবাল দ্বীপ', text: 'সেন্ট মার্টিন দ্বীপ বাংলাদেশের একমাত্র প্রবাল দ্বীপ — প্রবাল, সামুদ্রিক কচ্ছপ আর রঙিন মাছের বাড়ি।' } },
  { emoji: '🌅', figure: 'Sunrise + sunset', label: 'from one beach', tag: 'Geography', text: 'At Kuakata beach in Bangladesh you can watch the sun both rise and set over the sea.', bn: { figure: 'সূর্যোদয় + সূর্যাস্ত', label: 'একই সৈকত থেকে', text: 'বাংলাদেশের কুয়াকাটা সৈকতে দাঁড়িয়ে সাগরের বুকে সূর্য ওঠা আর ডোবা দুটোই দেখা যায়।' } },
  { emoji: '🐟', figure: 'Ilish', label: 'national fish of Bangladesh', tag: 'Fishing', text: 'Most of the world’s hilsa (ilish) is caught in Bangladesh. It swims from the Bay up the rivers to lay its eggs.', bn: { figure: 'ইলিশ', label: 'বাংলাদেশের জাতীয় মাছ', text: 'পৃথিবীর বেশির ভাগ ইলিশ ধরা হয় বাংলাদেশে। ইলিশ সাগর থেকে নদী বেয়ে উজানে যায় ডিম পাড়তে।' } },
  { emoji: '📅', figure: '22 days', label: 'fishing break', tag: 'Fishing', text: 'Bangladesh pauses hilsa fishing for about three weeks each year during the main breeding season, so young fish can survive.', bn: { figure: '২২ দিন', label: 'মাছ ধরায় বিরতি', text: 'প্রতি বছর ডিম পাড়ার মূল মৌসুমে বাংলাদেশ প্রায় তিন সপ্তাহ ইলিশ ধরা বন্ধ রাখে, যাতে ছোট মাছগুলো বাঁচতে পারে।' } },
  { emoji: '🐢', figure: 'Arribada', label: 'mass turtle nesting', tag: 'Wildlife', text: 'On Odisha’s beaches, hundreds of thousands of olive ridley sea turtles come ashore together to nest, one of the biggest gatherings on Earth.', bn: { figure: 'আরিবাদা', label: 'দল বেঁধে ডিম পাড়া', text: 'ওড়িশার সৈকতে লাখো অলিভ রিডলি কচ্ছপ একসাথে ডাঙায় উঠে ডিম পাড়ে — পৃথিবীর সবচেয়ে বড় জমায়েতগুলোর একটি।' } },
  { emoji: '🐬', figure: 'Irrawaddy', label: 'dolphin', tag: 'Wildlife', text: 'Round-headed Irrawaddy dolphins live in the Bay’s coastal waters and the Sundarbans. Bangladesh has the largest population in the world.', bn: { figure: 'ইরাবতী', label: 'ডলফিন', text: 'গোল মাথার ইরাবতী ডলফিন থাকে উপসাগরের উপকূলে আর সুন্দরবনে। পৃথিবীতে এদের সবচেয়ে বেশি দেখা যায় বাংলাদেশে।' } },
  { emoji: '👂', figure: 'Nearly blind', label: 'river dolphin', tag: 'Wildlife', text: 'The Ganges river dolphin finds food by echolocation, clicking and listening to the echoes. It is India’s national aquatic animal.', bn: { figure: 'প্রায় অন্ধ', label: 'শুশুক', text: 'গাঙ্গেয় শুশুক শব্দের প্রতিধ্বনি শুনে খাবার খোঁজে — ক্লিক করে আর প্রতিধ্বনি শোনে। এটি ভারতের জাতীয় জলজ প্রাণী।' } },
  { emoji: '💧', figure: '8+', label: 'great rivers flow in', tag: 'Geography', text: 'The Ganges, Brahmaputra, Meghna, Irrawaddy, Mahanadi, Godavari, Krishna and Kaveri all empty into the Bay of Bengal.', bn: { figure: '৮টির বেশি', label: 'বড় নদী এসে মিশেছে', text: 'গঙ্গা, ব্রহ্মপুত্র, মেঘনা, ইরাবতী, মহানদী, গোদাবরী, কৃষ্ণা আর কাবেরী — সবাই বঙ্গোপসাগরে এসে মিশেছে।' } },
  { emoji: '🧂', figure: 'Less salty', label: 'than the Arabian Sea', tag: 'Ocean floor', text: 'So much river water pours in that the Bay’s surface is much less salty than the sea on the other side of India.', bn: { figure: 'কম লবণাক্ত', label: 'আরব সাগরের চেয়ে', text: 'এত নদীর পানি এসে পড়ে যে বঙ্গোপসাগরের ওপরের পানি ভারতের অন্য পাশের সাগরের চেয়ে অনেক কম লোনা।' } },
  { emoji: '🔄', figure: '2 ways', label: 'currents switch', tag: 'Weather', text: 'With the monsoon, the main current along India’s east coast reverses direction, flowing north in spring and south in winter.', bn: { figure: '২ দিকে', label: 'স্রোত বদলায়', text: 'মৌসুমি বায়ুর সাথে ভারতের পূর্ব উপকূলের প্রধান স্রোত দিক বদলায় — বসন্তে উত্তরে আর শীতে দক্ষিণে বয়।' } },
  { emoji: '🌧️', figure: 'Monsoon', label: 'engine', tag: 'Weather', text: 'Warm water in the Bay feeds the monsoon rains that farmers across South Asia depend on.', bn: { figure: 'বর্ষার', label: 'ইঞ্জিন', text: 'উপসাগরের উষ্ণ পানি মৌসুমি বৃষ্টিকে শক্তি জোগায়, যার ওপর দক্ষিণ এশিয়ার কৃষকেরা নির্ভর করেন।' } },
  { emoji: '🌀', figure: 'Cyclones', label: 'twice a year', tag: 'Weather', text: 'Most Bay of Bengal cyclones form just before and just after the monsoon, in April–May and October–November.', bn: { figure: 'ঘূর্ণিঝড়', label: 'বছরে দুবার', text: 'বঙ্গোপসাগরের বেশির ভাগ ঘূর্ণিঝড় হয় বর্ষার ঠিক আগে আর পরে — এপ্রিল-মে আর অক্টোবর-নভেম্বরে।' } },
  { emoji: '📢', figure: '1970', label: 'Bhola cyclone', tag: 'Weather', text: 'The 1970 Bhola cyclone is the deadliest tropical cyclone on record. Since then, shelters and early warnings have saved countless lives.', bn: { figure: '১৯৭০', label: 'ভোলা ঘূর্ণিঝড়', text: '১৯৭০ সালের ভোলা ঘূর্ণিঝড় ইতিহাসের সবচেয়ে প্রাণঘাতী ঘূর্ণিঝড়। এরপর আশ্রয়কেন্দ্র আর আগাম সতর্কতা অগণিত প্রাণ বাঁচিয়েছে।' } },
  { emoji: '🚩', figure: '≈ 118,000 km²', label: 'Bangladesh’s sea area', tag: 'People', text: 'International rulings in 2012 and 2014 settled Bangladesh’s sea borders with Myanmar and India, giving it a large share of the Bay.', bn: { figure: '≈ ১,১৮,০০০ বর্গকিমি', label: 'বাংলাদেশের সমুদ্রসীমা', text: '২০১২ আর ২০১৪ সালের আন্তর্জাতিক রায়ে মিয়ানমার আর ভারতের সাথে বাংলাদেশের সমুদ্রসীমা ঠিক হয়, আর বাংলাদেশ উপসাগরের বড় একটা অংশ পায়।' } },
  { emoji: '🏝️', figure: '570+', label: 'islands', tag: 'Geography', text: 'India’s Andaman and Nicobar Islands form the Bay’s eastern edge, ringed by coral reefs full of the fish you meet in this game.', bn: { figure: '৫৭০টির বেশি', label: 'দ্বীপ', text: 'ভারতের আন্দামান ও নিকোবর দ্বীপপুঞ্জ উপসাগরের পূর্ব কিনারা গড়েছে, চারপাশে প্রবালপ্রাচীর — এই খেলার মাছগুলোয় ভরা।' } },
  { emoji: '🚢', figure: 'Chattogram', label: 'busiest port in Bangladesh', tag: 'People', text: 'Most of Bangladesh’s trade with the world passes through the port of Chattogram (Chittagong) on the Bay.', bn: { figure: 'চট্টগ্রাম', label: 'বাংলাদেশের ব্যস্ততম বন্দর', text: 'বিশ্বের সাথে বাংলাদেশের বেশির ভাগ বাণিজ্য উপসাগরের তীরে চট্টগ্রাম বন্দর দিয়ে হয়।' } },
  { emoji: '🐠', figure: 'Reef fish', label: 'in this game', tag: 'Wildlife', text: 'Every fish in NibbleNaut lives in the Bay of Bengal: from tiny blue demoiselles to bull sharks that can swim up rivers into fresh water.', bn: { figure: 'প্রবালের মাছ', label: 'এই খেলায়', text: 'নিবলনটের প্রতিটা মাছ বঙ্গোপসাগরে থাকে: ছোট্ট নীল ড্যামসেল থেকে শুরু করে নদী বেয়ে মিঠা পানিতে চলে আসা ষাঁড় হাঙর পর্যন্ত।' } },
  { emoji: '🔬', figure: '740', label: 'marine fish species', tag: 'Amazing fish', text: 'Hundreds of fish species live in Bangladesh’s seas. A 2021 scientific checklist counted 740 marine fish species in its coastal and sea waters, including fish of both salty and brackish water.', bn: { figure: '৭৪০', label: 'সামুদ্রিক মাছের প্রজাতি', text: 'বাংলাদেশের সাগরে শত শত প্রজাতির মাছ থাকে। ২০২১ সালের এক বৈজ্ঞানিক তালিকায় উপকূল আর সাগরের পানিতে ৭৪০ প্রজাতির সামুদ্রিক মাছ গোনা হয়েছে — লোনা আর আধা-লোনা দুই পানির মাছই আছে।' } },
  { emoji: '🧪', figure: 'Fresh → salty', label: 'water changes from place to place', tag: 'Geography', text: 'River mouths get fresh water and mud, while the open sea further out is salty ocean water. These differences make many kinds of homes for many kinds of sea life.', bn: { figure: 'মিঠা → লোনা', label: 'জায়গাভেদে পানি বদলায়', text: 'নদীর মোহনায় আসে মিঠা পানি আর পলি, আর দূরের খোলা সাগরে লোনা সমুদ্রের পানি। এই ভিন্নতার কারণে নানা রকম প্রাণীর জন্য নানা রকম বাসা তৈরি হয়।' } },
  { emoji: '🍼', figure: 'Nursery', label: 'for baby sea life', tag: 'Wildlife', text: 'The Sundarbans mangroves give fish, crabs and shrimp food, shelter and a safe nursery. Young animals grow up there before swimming out into other waters.', bn: { figure: 'নার্সারি', label: 'ছোট্ট সামুদ্রিক প্রাণীদের', text: 'সুন্দরবনের ম্যানগ্রোভ মাছ, কাঁকড়া আর চিংড়িকে খাবার, আশ্রয় আর নিরাপদ নার্সারি দেয়। ছোট প্রাণীরা সেখানে বড় হয়, তারপর অন্য পানিতে চলে যায়।' } },
  { emoji: '🔁', figure: 'Sea + river', label: 'the hilsa’s two homes', tag: 'Fishing', text: 'Hilsa is one of Bangladesh’s most important fish. It moves between the sea and fresh rivers to complete different parts of its life.', bn: { figure: 'সাগর + নদী', label: 'ইলিশের দুই বাড়ি', text: 'ইলিশ বাংলাদেশের সবচেয়ে গুরুত্বপূর্ণ মাছগুলোর একটা। জীবনের নানা ধাপ পূরণ করতে এটি সাগর আর মিঠা পানির নদীর মধ্যে যাওয়া-আসা করে।' } },
  { emoji: '🛟', figure: 'Need help', label: 'big sea animals at risk', tag: 'Sea animals', text: 'Dolphins, sharks, whales and sea turtles can get caught in fishing nets by accident and lose their homes. Protecting their habitats protects the whole sea.', bn: { figure: 'সাহায্য দরকার', label: 'বিপদে বড় সামুদ্রিক প্রাণী', text: 'ডলফিন, হাঙর, তিমি আর সামুদ্রিক কচ্ছপ ভুল করে মাছ ধরার জালে আটকে যায়, আর তাদের বাসাও নষ্ট হয়। তাদের বাসস্থান রক্ষা করলে পুরো সাগরটাই রক্ষা পায়।' } },
  { emoji: '🦈', figure: '≈ 12 m', label: 'whale shark: the gentle giant', tag: 'Amazing fish', text: 'The whale shark is the largest fish of all. Even so, it eats tiny creatures, fish eggs and small fish by filtering them from the water. It is not a whale, and it is generally harmless to people.', bn: { figure: '≈ ১২ মি', label: 'তিমি হাঙর: নিরীহ দানব', text: 'তিমি হাঙর সবচেয়ে বড় মাছ। তবু এরা পানি ছেঁকে ছোট্ট জীব, মাছের ডিম আর ছোট মাছ খায়। এরা তিমি নয়, আর মানুষের জন্য সাধারণত নিরীহ।' } },
  { emoji: '⚡', figure: 'Leaps!', label: 'giant trevally: the power hunter', tag: 'Amazing fish', text: 'This fast, muscular hunter chases smaller fish and crabs. It makes sudden bursts of speed and can even leap out of the water after its prey.', bn: { figure: 'লাফ!', label: 'দৈত্য ট্রেভালি: শক্তিশালী শিকারি', text: 'দ্রুত আর পেশিবহুল এই শিকারি ছোট মাছ আর কাঁকড়া তাড়া করে। হঠাৎ ঝড়ের গতিতে ছোটে, এমনকি শিকারের পিছু নিয়ে পানি থেকে লাফিয়েও ওঠে।' } },
  { emoji: '🐟', figure: 'Schools', label: 'bigmouth mackerel: the team swimmer', tag: 'Amazing fish', text: 'Bigmouth mackerel travel in groups and eat mostly plankton. Swimming together helps them find food and makes it harder for a predator to pick out one fish.', bn: { figure: 'ঝাঁক', label: 'বড়মুখো ম্যাকেরেল: দলের সাঁতারু', text: 'বড়মুখো ম্যাকেরেল দল বেঁধে চলে আর বেশির ভাগ প্ল্যাংকটন খায়। একসাথে সাঁতার কাটলে খাবার খোঁজা সহজ হয়, আর শিকারির পক্ষে একটাকে আলাদা করা কঠিন হয়।' } },
  { emoji: '🏁', figure: 'Dark fin tips', label: 'blacktip sharks', tag: 'Amazing fish', text: 'You can spot blacktip sharks by the dark tips on their fins. They are quick-turning hunters of fish and other small sea animals. Several kinds of shark live in the Bay.', bn: { figure: 'কালো ডগা', label: 'কালো-ডগা হাঙর', text: 'পাখনার কালো ডগা দেখেই কালো-ডগা হাঙর চেনা যায়। এরা চটজলদি বাঁক নিয়ে মাছ আর ছোট সামুদ্রিক প্রাণী শিকার করে। উপসাগরে কয়েক রকমের হাঙর থাকে।' } },
  { emoji: '🎯', figure: 'Ambush!', label: 'snappers and groupers', tag: 'Amazing fish', text: 'Snappers and groupers hide near rocks and reefs, then strike at passing prey. Their camouflage and surprise attacks make them champion ambush hunters.', bn: { figure: 'ওত পেতে!', label: 'স্ন্যাপার আর গ্রুপার', text: 'স্ন্যাপার আর গ্রুপার পাথর আর প্রবালের কাছে লুকিয়ে থাকে, তারপর পাশ দিয়ে যাওয়া শিকারকে হঠাৎ ধরে। ছদ্মবেশ আর আচমকা আক্রমণে এরা ওত পেতে শিকারের চ্যাম্পিয়ন।' } },
  { emoji: '🐬', figure: 'No beak', label: 'Irrawaddy dolphin', tag: 'Sea animals', text: 'Irrawaddy dolphins have round heads with no long beak. The coastal waters and mangrove channels of Bangladesh, especially around the Sundarbans, are an important home for them.', bn: { figure: 'ঠোঁট নেই', label: 'ইরাবতী ডলফিন', text: 'ইরাবতী ডলফিনের মাথা গোল, অন্য অনেক ডলফিনের মতো লম্বা ঠোঁট নেই। বাংলাদেশের উপকূল আর ম্যানগ্রোভের খাল, বিশেষ করে সুন্দরবনের আশপাশ, এদের গুরুত্বপূর্ণ বাসা।' } },
  { emoji: '🐋', figure: 'Big gulp!', label: 'Bryde’s whale', tag: 'Sea animals', text: 'This large whale eats small schooling fish and krill-like animals. It lunges into a group of prey and opens its enormous mouth to swallow them up.', bn: { figure: 'বিশাল গ্রাস!', label: 'ব্রাইডস তিমি', text: 'এই বড় তিমি ঝাঁকের ছোট মাছ আর ক্রিলের মতো প্রাণী খায়। শিকারের ঝাঁকে ঝাঁপিয়ে পড়ে বিশাল মুখ হাঁ করে সব গিলে ফেলে।' } },
  { emoji: '🐢', figure: 'Beach → sea', label: 'olive ridley hatchlings', tag: 'Sea animals', text: 'Olive ridley sea turtles swim through coastal and open waters. Mothers come ashore to lay eggs, and the tiny hatchlings must cross the beach to reach the sea.', bn: { figure: 'সৈকত → সাগর', label: 'অলিভ রিডলি ছানা', text: 'অলিভ রিডলি সামুদ্রিক কচ্ছপ উপকূল আর গভীর সাগরে ঘুরে বেড়ায়। মা কচ্ছপ ডাঙায় উঠে ডিম পাড়ে, আর ছোট্ট ছানাদের সৈকত পেরিয়ে সাগরে পৌঁছাতে হয়।' } },
  { emoji: '🐙', figure: 'Colour changers', label: 'cuttlefish and octopuses', tag: 'Sea animals', text: 'These clever molluscs can change how they look to blend into their surroundings. Octopuses use their arms to explore, move things and catch prey.', bn: { figure: 'রং বদলায়', label: 'কাটলফিশ আর অক্টোপাস', text: 'এই বুদ্ধিমান প্রাণীরা চেহারা বদলে চারপাশের সাথে মিশে যেতে পারে। অক্টোপাস হাত দিয়ে চারপাশ খুঁজে দেখে, জিনিস নাড়ায় আর শিকার ধরে।' } },
  { emoji: '🪼', figure: 'No brain', label: 'jellyfish', tag: 'Sea animals', text: 'Jellyfish have no bones and no brain like a fish. Some drift with the currents, others swim by pulsing their bell-shaped bodies. Some can sting, so never touch one!', bn: { figure: 'মগজ নেই', label: 'জেলিফিশ', text: 'জেলিফিশের হাড় নেই, মাছের মতো মগজও নেই। কেউ স্রোতে ভেসে বেড়ায়, কেউ ঘণ্টার মতো শরীর সংকুচিত করে সাঁতার কাটে। কেউ কেউ হুল ফোটাতে পারে, তাই কখনো ছুঁয়ো না!' } },
];

/** Legacy key name kept from "Fish Fight" so existing players keep their seen facts. */
const SEEN_KEY = 'fishfight.triviaSeen';

/**
 * Which facts this player has discovered, remembered on this device so the "facts discovered"
 * collection keeps growing between visits. Storage problems just mean starting the count again.
 */
export class TriviaCollection {
  readonly seen = new Set<number>();

  constructor(private readonly facts: Trivia[] = TRIVIA) {
    try {
      const raw = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as unknown;
      if (Array.isArray(raw)) for (const i of raw) if (Number.isInteger(i) && i >= 0 && i < facts.length) this.seen.add(i);
    } catch {
      // Unavailable or corrupt: start an empty collection.
    }
  }

  get total(): number {
    return this.facts.length;
  }

  mark(fact: Trivia): void {
    const i = this.facts.indexOf(fact);
    if (i < 0 || this.seen.has(i)) return;
    this.seen.add(i);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...this.seen]));
    } catch {
      // Storage blocked: the collection still counts up for this session.
    }
  }
}

/** Hands out facts in a shuffled order, so a player sees every fact before any repeats. */
export class TriviaDeck {
  private order: number[] = [];
  private last = -1;

  /** `seen` (optional): facts already discovered are dealt after the new ones in each round. */
  constructor(
    private readonly facts: Trivia[] = TRIVIA,
    private readonly rng: () => number = Math.random,
    private readonly seen: ReadonlySet<number> = new Set(),
  ) {}

  next(): Trivia {
    if (this.order.length === 0) {
      this.order = this.facts.map((_, i) => i);
      for (let i = this.order.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng() * (i + 1));
        [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
      }
      // Cards are dealt from the end: put undiscovered facts there so they come first.
      this.order = [...this.order.filter((i) => this.seen.has(i)), ...this.order.filter((i) => !this.seen.has(i))];
      // Never show the same fact twice in a row across a reshuffle.
      if (this.order.length > 1 && this.order[this.order.length - 1] === this.last) this.order.unshift(this.order.pop()!);
    }
    this.last = this.order.pop()!;
    return this.facts[this.last];
  }
}
