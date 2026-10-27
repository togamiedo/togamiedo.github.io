import type { FxKind } from "@/components/Fx";

export type Block =
  | { kind: "chapter"; jp: string; en: string }
  | { kind: "p"; text: string; fx?: FxKind }
  | { kind: "quote"; text: string; note?: string; side?: "left" | "right" }
  | { kind: "beat"; text: string; fx?: FxKind };

export const story: Block[] = [
  { kind: "chapter", jp: "第壱章：根", en: "Chapter I · The Root" },
  { kind: "quote", text: "Ma, why are we doing this?", side: "left" },
  {
    kind: "p",
    text: "The {Genshiro} family never bled on battlefields. They bled people dry in courtrooms. For generations they served the shogunate in Kyoto as high-ranking magistrates and legal inspectors. Their ancestral estate was a fortress of immaculate white sand, kept by retainers in identical, uninspired indigo robes. They were the living shape of the rigid rules they enforced.",
  },
  {
    kind: "p",
    fx: "bloom",
    text: "Into this world of ink and strict edicts, *Togami* was born. The only sanctuary of color in the whole Genshiro compound was a walled, heavily guarded courtyard kept by his mother. She was the *daughter* of a powerful Nagasaki merchant, a man who used quiet trade ties with Dutch smugglers to bring in highly illegal, exotic seeds from foreign lands.",
  },
  {
    kind: "p",
    text: "In that hidden greenhouse, far from the eyes of his father's guests, *Togami* grew up among rare winter camellias and deep red roses. From a young age he was put through a harsh education meant to make him the perfect magistrate, memorizing heavy volumes of Kyoto's penal codes.",
  },
  {
    kind: "p",
    text: "By his *tenth* birthday he had mastered taxation law and the strict regulations of class. His father's plan backfired badly. Where the rest of the family saw the law as a *sacred*, unbreakable chain, young *Togami* saw a game. His mind found the spaces between the rules, and nothing amused him more than finding the exact loophole.",
  },
  {
    kind: "p",
    fx: "sword",
    text: "He never wanted to break the law. He wanted to make it powerless. That duality shaped his adolescence. Every morning he trained in traditional kenjutsu and drove his instructors mad with unorthodox strikes. His style obeyed every rule of the dojo on paper, while spitting on the honorable spirit of the formal samurai duel.",
  },

  { kind: "chapter", jp: "第弐章：開花", en: "Chapter II · The Bloom" },
  {
    kind: "p",
    text: "*One day*, a high-ranking and arrogant lord came to the {Genshiro} estate to negotiate tax policy. Careless and loud, he stood for everything Togami despised about the rigid samurai class. During a stroll, the guest wandered uninvited into the hidden greenhouse of Togami's mother.",
  },
  {
    kind: "p",
    fx: "crush",
    text: "Without a second thought, *the lord's heavy wooden sandal came down on a pristine, blooming wild orchid and twisted its delicate stem in half.*",
  },
  {
    kind: "p",
    text: "*Togami* watched from the doorway in total silence. His face stayed perfectly composed, but a cold, dreadful fury caught fire in his chest. Instead of striking out in blind rage, he went to the legal archives. He spent the night poring over ancient edicts until he found exactly what he needed: a forgotten law stating that any weapon drawn inside a magistrate's private sanctuary could *legally* be met with lethal force.",
  },
  { kind: "beat", text: "!!!", fx: "sword" },
  {
    kind: "p",
    text: "The next morning, *Togami* cornered the lord in the greenhouse. With a sadistic smirk he delivered insult after insult, each one sharper than the last, until the lord's fragile pride gave way and the furious man finally drew his sword.",
  },
  { kind: "beat", text: "WOOSH", fx: "bigblood" },
  {
    kind: "p",
    fx: "blood",
    text: "The moment the steel left its scabbard, *Togami* drew his own blade and cut through the lord with terrifying brutality. {Blood gushed across the white roses and stained their petals a deep, wet crimson.} Staring at the contrast, *Togami* understood that this bloodied dark red rose was infinitely more beautiful than the original.",
  },
  {
    kind: "p",
    text: "When his father found the {butchered} lord, Togami calmly presented the edict that cleared him of *murder*. Disgusted by his son's monstrous pragmatism over a crushed flower, his father formally stripped him of his title. *Togami* was exiled from the clan in disgrace and thrown into the streets as a masterless ronin, carrying an immense guilt he would never admit to anyone.",
  },

  { kind: "chapter", jp: "第参章：棘", en: "Chapter III · The Thorn" },
  {
    kind: "p",
    text: "Exiled to the gritty streets of Kyoto, *Togami* fell in with a notorious gang of kabukimono. He gladly took on their flamboyant, rule-breaking fashion, but he refused to act like a mindless street punk. He kept his cold aloofness and would not shame his intellect by behaving like a common, screaming thug.",
  },
  {
    kind: "p",
    fx: "coin",
    text: "To fund his extravagant new life, he took his *first* private contract. While the gang relied on messy brawls, *Togami* cornered a local gang leader alone in an alleyway.",
  },
  { kind: "quote", text: "A magistrate's exiled son?", note: "The thug sneered, drawing his blade.", side: "right" },
  { kind: "quote", text: "Bold assumption.", side: "left" },
  {
    kind: "p",
    fx: "bigblood",
    text: "Togami smirked, stepped past the clumsy strike without effort, and {severed the man's artery}.",
  },
  { kind: "quote", text: "Just a gardener pulling roots.", side: "left" },
];

export const weaponStory: Block[] = [
  { kind: "chapter", jp: "刀ノ章：薔薇ノ鍔", en: "The Rose Tsuba" },
  {
    kind: "p",
    text: "When he was cast out, *Togami* left with one thing that still belonged to the {Genshiro} name: the family katana, a sober blade with a plain iron guard, made to stand for duty and restraint.",
  },
  {
    kind: "p",
    fx: "coin",
    text: "He carried it to a black-market metalworker in the Nagasaki smuggling district and paid an outrageous sum to have that honorable, understated iron handguard melted down entirely.",
  },
  {
    kind: "p",
    fx: "bloom",
    text: "In its place the artisan cast a heavy, blooming red rose tsuba, a direct tribute to the rare Dutch flowers his mother once imported against the law.",
  },
  {
    kind: "p",
    text: "To finish the insult to his former masters, he had the saya lacquered in a blinding, illegal blood red and draped it with noisy chains made to rattle and annoy every samurai he passed.",
  },
  {
    kind: "p",
    fx: "sword",
    text: "Last of all, he had the mounting brackets moved. With its center of gravity thrown off on purpose, the sword could no longer sit formally in a belt. It rests across his lower back instead, a respected family treasure turned into the ultimate law-breaking kabukimono prop.",
  },
  { kind: "chapter", jp: "密輸ノ章：記載無き品", en: "The Unlisted Contraband" },
  {
    kind: "p",
    text: "Early in his life as a disgraced ronin, *Togami* took a well paid contract from a Nagasaki magistrate: hunt down a dockworker who had stolen a crate of restricted Dutch imports.",
  },
  {
    kind: "p",
    text: "He finally cornered the bleeding thief in an abandoned coastal cave. The stolen goods were not gold or velvet. They were a fragile, soil-packed wooden box of live, deep red *Rosa gallica* cuttings taken from a foreign merchant ship.",
  },
  {
    kind: "p",
    fx: "bigblood",
    text: "The thief begged for his life and offered to split the black-market fortune. Togami only smirked. The contract demanded the thief's head, and said nothing about recovering the goods. {One clean stroke}, and the man's head was off.",
  },
  {
    kind: "p",
    text: "Holding to the exact wording, Togami turned in the head, collected his bounty, and quietly kept the *unlisted contraband*. He carried the cuttings back to Kyoto and decoded stolen Dutch botany journals until he grew his first flawless, blood red bloom.",
  },
  {
    kind: "p",
    fx: "bloom",
    text: "That first flower became his obsession. He cut it at the peak of its bloom, sealed it in wax, and handed it to a black-market metalworker with one demand: the guard of his new katana had to match its petals perfectly.",
  },
  {
    kind: "p",
    text: "To this day, the living descendants of those stolen cuttings are the rare roses he obsessively prunes in his private greenhouse between bounties.",
  },
];
