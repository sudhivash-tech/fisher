// Novigo assessment question bank. Pure data, no DOM access.
// Item types: mcq (objective key) | sjt (rubric score 0-3 per option) | likert (1-5) | multi (selection, mapped to engine hints)
// Cognitive and EI results are EXPLORATORY indicators from a short custom test, not validated IQ/EQ measures.
export const VERSION = '0.1';

export const DIMENSIONS = {
  logical: { kind: 'cognitive', label: 'Logical reasoning' }, numerical: { kind: 'cognitive', label: 'Numerical reasoning' },
  verbal: { kind: 'cognitive', label: 'Verbal reasoning' }, pattern: { kind: 'cognitive', label: 'Pattern recognition' },
  creative: { kind: 'creative', label: 'Creative problem-solving' },
  awareness: { kind: 'ei', label: 'Emotional awareness' }, empathy: { kind: 'ei', label: 'Empathy and perspective-taking' },
  decision: { kind: 'ei', label: 'Decision-making and conflict resolution' },
  collaboration: { kind: 'workstyle', label: 'Preference for collaboration' }, structure: { kind: 'workstyle', label: 'Preference for structure' },
  uncertainty: { kind: 'workstyle', label: 'Comfort with uncertainty' }, learning: { kind: 'workstyle', label: 'Appetite for continual learning' },
  responsibility: { kind: 'workstyle', label: 'Comfort with responsibility' },
  R: { kind: 'interest', label: 'Realistic (hands-on, practical)' }, I: { kind: 'interest', label: 'Investigative (analytical, curious)' },
  A: { kind: 'interest', label: 'Artistic (creative, expressive)' }, S: { kind: 'interest', label: 'Social (helping, teaching)' },
  E: { kind: 'interest', label: 'Enterprising (leading, persuading)' }, C: { kind: 'interest', label: 'Conventional (organised, procedural)' }
};

export const PAGES = [
  { id: 'reasoning', title: 'Reasoning' }, { id: 'stream', title: 'Your stream' }, { id: 'people', title: 'People and problem-solving' },
  { id: 'explore', title: 'Interests and exploration' }, { id: 'work', title: 'How you like to work' }
];

const mcq = (id, page, dim, text, options, key, extra = {}) => ({ id, page, dim, type: 'mcq', text, options, key, ...extra });
const sjt = (id, page, dim, text, options, scores) => ({ id, page, dim, type: 'sjt', text, options, scores });
const lk = (id, page, dim, text, reverse = false) => ({ id, page, dim, type: 'likert', text, reverse });

export const ITEMS = [
  // ---- common reasoning (objective) ----
  mcq('L1', 'reasoning', 'logical', 'All nurses are trained in first aid. Meera is trained in first aid. Which conclusion is certain?', ['Meera is a nurse', 'Meera might or might not be a nurse', 'Meera is not a nurse', 'All first-aiders are nurses'], 1),
  mcq('L2', 'reasoning', 'logical', 'If the server is down, the site is offline. The site is online. What follows?', ['The server is down', 'The server is not down', 'Nothing follows', 'The site is slow'], 1),
  mcq('N1', 'reasoning', 'numerical', 'A shop takes 20% off a ₹2,500 bag, then adds 10% tax on the discounted price. What is the final price?', ['₹2,000', '₹2,200', '₹2,250', '₹2,500'], 1),
  mcq('N2', 'reasoning', 'numerical', 'A train covers 180 km in 2.5 hours. At the same speed, how far does it go in 4 hours?', ['252 km', '270 km', '288 km', '300 km'], 2),
  mcq('V1', 'reasoning', 'verbal', 'Passage: "Remote work cut commuting costs, but several teams reported less spontaneous idea-sharing. Managers who added short weekly in-person workshops saw collaboration recover without a return to full office schedules." Which statement is best supported?', ['Remote work should be abolished', 'Occasional in-person sessions helped restore collaboration', 'Commuting costs rose after remote work', 'Idea-sharing improved with remote work'], 1),
  mcq('V2', 'reasoning', 'verbal', 'Choose the word closest in meaning to "meticulous".', ['careless', 'thorough', 'hurried', 'vague'], 1),
  mcq('P1', 'reasoning', 'pattern', 'What comes next? 2, 6, 12, 20, 30, ?', ['40', '42', '44', '36'], 1),
  mcq('P2', 'reasoning', 'pattern', 'Which number does not belong with the others?', ['25', '36', '48', '64'], 2),
  // ---- stream-specific (objective; first item of each stream is also shown to undecided users) ----
  mcq('S1', 'stream', 'logical', 'Plants under red light grew more than plants under green light in 10 of 10 trials, but the red-light plants also received more water. Best conclusion?', ['Red light definitely causes more growth', 'Water is a confounding factor, so the result is unclear', 'Green light stops growth', 'The experiment shows nothing at all'], 1, { stream: 'science', sampler: true }),
  mcq('S2', 'stream', 'numerical', 'A 40 g sample loses 25% of its mass on drying. What mass remains?', ['10 g', '30 g', '32 g', '35 g'], 1, { stream: 'science' }),
  mcq('C1', 'stream', 'numerical', 'Cost price ₹800, selling price ₹1,000. What is the profit percentage on cost?', ['20%', '25%', '30%', '200%'], 1, { stream: 'commerce', sampler: true }),
  mcq('C2', 'stream', 'logical', 'Product A earns ₹50 profit per unit and sells 100 units. Product B earns ₹80 per unit and sells 55 units. Which earns more in total?', ['Product A', 'Product B', 'They are equal', 'Cannot be determined'], 0, { stream: 'commerce' }),
  mcq('H1', 'stream', 'verbal', '"Everyone who criticises the new policy simply wants it to fail." What is the main weakness of this argument?', ['It uses statistics', 'It assumes motives without evidence', 'It is too short', 'It cites an expert'], 1, { stream: 'humanities', sampler: true }),
  mcq('H2', 'stream', 'verbal', 'A historian finds two accounts of the same event that disagree. Best next step?', ['Pick the more dramatic one', 'Check who wrote each, when, and for whom', 'Ignore both', 'Average the two'], 1, { stream: 'humanities' }),
  // ---- emotional and interpersonal judgement (rubric 0-3 per option) ----
  sjt('A1', 'people', 'awareness', 'You get critical feedback and notice your chest tightening and thoughts racing. What do you do first?', ['Reply immediately to defend yourself', 'Pause, name what you are feeling, and respond once calmer', 'Ignore the feedback entirely', 'Vent to a friend about the reviewer'], [0, 3, 0, 1]),
  sjt('A2', 'people', 'awareness', 'After a weak group presentation you feel embarrassed. Which response shows the most self-awareness?', ['Blame the teammates', 'Work out what you could have prepared differently and what felt hard', 'Decide you are simply bad at presenting', 'Pretend it did not matter'], [0, 3, 1, 1]),
  sjt('E1', 'people', 'empathy', 'A usually cheerful teammate has gone quiet this week. What do you do?', ['Leave them completely alone', 'Check in privately and ask if they want to talk or need help', 'Mention it to the whole team', 'Assume they are being lazy'], [1, 3, 0, 0]),
  sjt('E2', 'people', 'empathy', 'A classmate strongly disagrees with you. How do you respond?', ['Try to understand their reasoning before replying', 'Repeat your point louder', 'Stop talking to them', 'Agree to avoid conflict'], [3, 0, 0, 1]),
  sjt('D1', 'people', 'decision', 'Two teammates want opposite approaches to a deadline task and the team is stuck. You:', ['Go with the louder person\u2019s plan', 'Lay out criteria (time, quality, risk) and help the group choose against them', 'Let it drag on', 'Do the work yourself without telling them'], [0, 3, 0, 1]),
  sjt('D2', 'people', 'decision', 'You can pick a safe plan with a moderate payoff or a risky plan with a high payoff and a real chance of failure. How do you decide?', ['Always take the risky one', 'Estimate the downside and whether you could recover from it, then choose', 'Always take the safe one', 'Flip a coin'], [1, 3, 1, 0]),
  // ---- creative problem-solving ----
  sjt('CR1', 'people', 'creative', 'A small caf\u00e9 wants more customers on slow weekday afternoons without cutting prices. Which idea best combines originality and practicality?', ['Run the same ads more often', 'Host a weekly study-group or skill-swap hour that brings in new groups', 'Copy a competitor\u2019s menu', 'Close on weekday afternoons'], [1, 3, 1, 0]),
  lk('CR2', 'people', 'creative', 'I enjoy coming up with several different solutions to one problem.'),
  lk('CR3', 'people', 'creative', 'I often combine ideas from different subjects or fields.'),
  // ---- interests (RIASEC-style; own items, not the validated inventory) ----
  lk('R1', 'explore', 'R', 'I enjoy building, repairing or working with tools and machines.'), lk('R2', 'explore', 'R', 'I like working outdoors or with my hands.'),
  lk('I1', 'explore', 'I', 'I enjoy investigating how things work or solving puzzles.'), lk('I2', 'explore', 'I', 'I like analysing data to find patterns.'),
  lk('A3', 'explore', 'A', 'I enjoy designing, writing, music or other creative expression.'), lk('A4', 'explore', 'A', 'I like work where I can create something original.'),
  lk('S3', 'explore', 'S', 'I enjoy teaching, helping or counselling people.'), lk('S4', 'explore', 'S', 'I like work that improves other people\u2019s wellbeing.'),
  lk('E3', 'explore', 'E', 'I enjoy persuading, leading or starting new ventures.'), lk('E4', 'explore', 'E', 'I like taking charge and convincing others.'),
  lk('C3', 'explore', 'C', 'I enjoy organising information, records or schedules accurately.'), lk('C4', 'explore', 'C', 'I like following clear procedures to get things right.'),
  // ---- cross-stream exploration (selection; feeds the engine, never restricts it) ----
  { id: 'X1', page: 'explore', type: 'multi', target: 'explore', text: 'Which fields would you like to explore, whatever your current stream? (choose any)', options: [
    { id: 'tech', label: 'Technology and computing', soc: ['15'] }, { id: 'biz', label: 'Business and finance', soc: ['11', '13', '41'] },
    { id: 'health', label: 'Healthcare and medicine', soc: ['29', '31'] }, { id: 'arts', label: 'Design, arts and media', soc: ['27'] },
    { id: 'law', label: 'Law and public service', soc: ['23', '33'] }, { id: 'sci', label: 'Science and research', soc: ['19'] },
    { id: 'edu', label: 'Teaching and social work', soc: ['21', '25'] }, { id: 'eng', label: 'Engineering and building', soc: ['17', '47', '49'] } ] },
  { id: 'X2', page: 'explore', type: 'multi', target: 'tools', text: 'Which kinds of tools would you enjoy learning? (choose any)', options: [
    { id: 'prog', label: 'Programming and software development', cats: ['development environment', 'object or component', 'web platform', 'program testing', 'requirements analysis', 'compiler'] },
    { id: 'data', label: 'Data analysis and business intelligence', cats: ['analytical or scientific', 'business intelligence', 'data mining', 'data base', 'spreadsheet', 'charting'] },
    { id: 'design', label: 'Design, graphics and media', cats: ['graphics or photo', 'video creation', 'music or sound', 'desktop publishing', 'computer aided design', 'web page creation', 'graphical user interface'] },
    { id: 'biz', label: 'Business, finance and operations', cats: ['financial analysis', 'accounting', 'enterprise resource', 'project management', 'sales and marketing', 'human resources', 'customer relationship', 'risk management'] },
    { id: 'sci', label: 'Science, engineering and mapping', cats: ['analytical or scientific', 'geographic information', 'computer aided design', 'industrial control', 'map creation', 'computer imaging'] },
    { id: 'care', label: 'Healthcare and education tools', cats: ['medical software', 'computer based training', 'multi-media educational'] },
    { id: 'net', label: 'Networks, cloud and security', cats: ['network', 'cloud', 'security', 'operating system', 'virtual'] } ] },
  // ---- work style (likert; reverse-scored where marked) ----
  lk('K1', 'work', 'collaboration', 'I do my best work when I can discuss ideas with others.'), lk('K2', 'work', 'collaboration', 'I prefer to work on tasks entirely alone.', true),
  lk('W1', 'work', 'structure', 'I like clear instructions and a predictable routine.'), lk('W2', 'work', 'structure', 'I enjoy working out my own way of doing things with few rules.', true),
  lk('U1', 'work', 'uncertainty', 'I am comfortable making decisions with incomplete information.'), lk('U2', 'work', 'uncertainty', 'I get stressed when plans change at short notice.', true),
  lk('LN1', 'work', 'learning', 'I enjoy learning new tools or subjects even without a grade attached.'), lk('LN2', 'work', 'learning', 'Once I master a skill I prefer not to change it.', true),
  lk('RS1', 'work', 'responsibility', 'I am comfortable being accountable for a team\u2019s outcome.'), lk('RS2', 'work', 'responsibility', 'I prefer others to make the final decisions.', true)
];
