// Our real story. Dates marked (?) came from memory; VERIFY them. Screenshot-based facts are exact.
export type Media = { k: 'img' | 'vid'; n: string; cap: string }
export interface Chapter { d: string; t: string; p: string; m?: Media[]; chips?: string[]; stamps?: string[] }
export const CHAPTERS: Chapter[] = [
  { d: '2 JUN 2025', t: 'India, I see you', p: 'Fred posts an Instagram story: the DMs are more India than anywhere else, he will never ignore that, and he gives his word it will happen. It just needs a bit more planning. For us, that was enough to start counting.', m: [{ k: 'img', n: 'wait-story', cap: 'His story (date per our records)' }] },
  { d: 'JUN 2026', t: 'The black tee', p: 'A photo of him holding up a black tee printed with “again..” in English, Hindi, Marathi and Kannada goes viral on another app. Nobody can stop decoding it. The rumours start: is he really coming?', m: [{ k: 'img', n: 'wait-tee', cap: 'The viral tee' }] },
  { d: '22 JUN 2026', t: 'The front pages', p: 'Bombay Times, Delhi Times and Bangalore Times all run the same cover: “again..” in four languages and “december 2026”. The same tee turns up with random fans. Suddenly a whole country is wearing, reading and eating off the rumour.', m: [
    { k: 'img', n: 'wait-mypapers', cap: 'Our copies' }, { k: 'img', n: 'wait-taxi', cap: 'Out of a Mumbai taxi' }, { k: 'img', n: 'wait-marine', cap: 'Marine Drive, Mumbai' },
    { k: 'vid', n: 'scooters', cap: 'Delhi, on a scooter' }, { k: 'vid', n: 'flowers', cap: 'Around the flowers' }, { k: 'vid', n: 'samosa', cap: 'Under a samosa' },
    { k: 'vid', n: 'auto', cap: 'A Mumbai auto' }, { k: 'vid', n: 'tees', cap: 'The tees, in the wild' }] },
  { d: '23 JUN 2026', t: 'Official: he’s coming', p: 'He posts the photo with all three papers and confirms the India tour with Sunburn and BookMyShow Live. The BookMyShow listing goes up the same day with dates, venues, prices and artist pre-sale registration, open until 29 June at 6 PM.', chips: ['GA ₹3,500', 'GA+ ₹6,000', 'Student GA ₹1,750'], m: [{ k: 'img', n: 'wait-papers', cap: 'His Instagram post' }, { k: 'img', n: 'wait-listing', cap: 'The BookMyShow listing' }] },
  { d: '30 JUN 2026', t: 'Pre-sale. Three shows. Gone.', p: 'The artist pre-sale goes live on 30 June at 12 noon for the three shows announced: Delhi NCR on 5 Dec, Mumbai on 9 Dec and Bengaluru on 13 Dec. By the time the queue moved, they were gone.', stamps: ['DELHI NCR · 5 DEC', 'MUMBAI · 9 DEC', 'BENGALURU · 13 DEC'] },
  { d: '3 JUL 2026', t: 'Two more dates!', p: 'He adds two more shows: Mumbai on 8 December and Bengaluru on 12 December, on sale Monday at 12 noon. Mumbai, 8 Dec. That one is ours.', m: [{ k: 'img', n: 'wait-july3', cap: 'His message, 3 July' }] },
]
export const ATTEMPTS = [
  { when: '30 Jun · 12:00 PM', show: 'Mumbai 9 Dec · artist pre-sale', imgs: ['bms-a1-phone', 'bms-a1-lap'], cap: '15,640 ahead, GA 14% available. By 12:25 PM: everything sold out.', ok: false },
  { when: '1 Jul · 2:00 PM', show: 'Mumbai 9 Dec', imgs: ['bms-a2-queue', 'bms-a2-sold'], cap: '15,251 ahead. The queue flew, but by 3:19 PM it was sold out for the phase.', ok: false },
  { when: '3 Jul · about 4:00 PM', show: 'Mumbai 9 Dec', imgs: ['bms-a3-queue', 'bms-a3-sold'], cap: 'Eight devices across one office. Mine got to 166 ahead. Then: sold out.', ok: false },
  { when: '6 Jul · 12:00 PM', show: 'Mumbai 8 Dec · the new date', imgs: ['bms-queue1', 'bms-sold'], cap: '26,217 ahead at noon. Sold out by 12:48 PM.', ok: false },
  { when: '7 Jul · 2:00 PM', show: 'Mumbai 8 Dec', imgs: ['bms-a5-wait', 'bms-queue2', 'bms-turn'], cap: '1,500 ahead… then “It’s your turn now”. This time we got in and booked.', ok: true },
]
