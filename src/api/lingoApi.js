import JSZip from "jszip";

const REMOTE_WORD_BANKS = [
  {
    id: "cet4",
    name: "CET-4",
    description: "College English Test Band 4",
    level: "CET4",
    files: [
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164649209_CET4_1.zip",
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164635506_CET4_2.zip",
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164643060_CET4_3.zip"
    ]
  },
  {
    id: "cet6",
    name: "CET-6",
    description: "College English Test Band 6",
    level: "CET6",
    files: [
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164668667_CET6_1.zip",
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1524052554766_CET6_2.zip",
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164633851_CET6_3.zip"
    ]
  },
  {
    id: "tem8",
    name: "TEM-8",
    description: "Test for English Majors Band 8",
    level: "TEM8",
    files: [
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164635290_Level8_1.zip",
      "https://cdn.jsdelivr.net/gh/kajweb/dict@master/book/1521164663794_Level8_2.zip"
    ]
  }
];

const bankCache = new Map();

const uniqueByWord = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.word.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const sanitizeSentence = (value) =>
  String(value || "")
    .replace(/<[^>]+>/g, "")
    .trim();

const extractSynonyms = (content) => {
  const entries = content?.syno?.synos || [];
  const words = entries
    .flatMap((entry) => entry.hwds || [])
    .map((entry) => String(entry.w || "").trim())
    .filter(Boolean);

  return [...new Set(words)].slice(0, 6);
};

const extractWordFromItem = (item, level) => {
  const content = item?.content?.word?.content || {};
  const trans = Array.isArray(content.trans) ? content.trans : [];
  const mainTrans = trans[0] || {};
  const sentence = content?.sentence?.sentences?.[0] || {};

  const meaningZh = String(mainTrans.tranCn || "").trim();
  const meaningEn = String(mainTrans.tranOther || "").trim();
  const fallbackMeaning = String(content?.syno?.synos?.[0]?.tran || "").trim();

  const headWord = String(item?.headWord || item?.content?.word?.wordHead || "").trim();
  if (!headWord) {
    return null;
  }

  const meaning = meaningZh || fallbackMeaning || meaningEn || "No translation";

  return {
    id: String(item?.content?.word?.wordId || `${level}-${headWord}`),
    word: headWord,
    phonetic: String(content.usphone || content.ukphone || content.phone || "").trim(),
    meaning,
    meaningZh: meaningZh || fallbackMeaning || meaning,
    meaningEn,
    example: sanitizeSentence(sentence.sContent || sentence.sContent_eng || `Use '${headWord}' in a sentence.`),
    exampleCn: String(sentence.sCn || "").trim(),
    synonyms: extractSynonyms(content),
    difficulty: level
  };
};

const parseNdjson = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

const readZipJsonEntries = async (zipArrayBuffer) => {
  const zip = await JSZip.loadAsync(zipArrayBuffer);
  const jsonFile = Object.values(zip.files).find((file) => !file.dir && file.name.endsWith(".json"));

  if (!jsonFile) {
    return [];
  }

  const text = await jsonFile.async("string");
  return parseNdjson(text);
};

const loadBankWords = async (bank) => {
  const chunks = await Promise.all(
    bank.files.map(async (url) => {
      const response = await fetch(url, { headers: { Accept: "application/zip" } });
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      return readZipJsonEntries(buffer);
    })
  );

  const merged = chunks
    .flat()
    .map((entry) => extractWordFromItem(entry, bank.level))
    .filter(Boolean);

  return uniqueByWord(merged);
};

export const fetchWordBanks = async () => REMOTE_WORD_BANKS;

export const fetchWordsByBank = async (bankId) => {
  const bank = REMOTE_WORD_BANKS.find((item) => item.id === bankId);
  if (!bank) {
    return [];
  }

  if (bankCache.has(bankId)) {
    return bankCache.get(bankId);
  }

  const words = await loadBankWords(bank);
  bankCache.set(bankId, words);
  return words;
};
