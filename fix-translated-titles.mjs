import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, getFirestore, updateDoc } from "firebase/firestore";

const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missing = required.filter((key) => !process.env[key] || process.env[key].startsWith("your-"));

if (missing.length) {
  console.error("Missing Firebase env values. Add them to client/.env then run:");
  console.error("node --env-file=.env fix-translated-titles.mjs");
  console.error("Missing keys:", missing);
  process.exit(1);
}

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

const titleTranslations = {
  "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៩": "2019 Bac II Khmer Literature Examination",
  "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៨": "2018 Bac II Khmer Literature Examination",
  "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៧": "2017 Bac II Khmer Literature Examination",
  "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០២១": "2021 Bac II Khmer Literature Examination",
  "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០២២": "2022 Bac II Khmer Literature Examination",
  "2019 Bac II Khmer Literature Examination": "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៩",
  "2018 Bac II Khmer Literature Examination": "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៨",
  "2017 Bac II Khmer Literature Examination": "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៧",
  "2021 Bac II Khmer Literature Examination": "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ2021",
  "2022 Bac II Khmer Literature Examination": "វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ2022",
};

function extractYear(title, fallbackYear) {
  const match = title.match(/(\d{4})/);
  if (match) return Number(match[1]);
  if (fallbackYear) return Number(fallbackYear);
  return new Date().getFullYear();
}

function buildEnglishTitle(title, fallbackYear) {
  const direct = titleTranslations[title];
  if (direct) return direct;

  if (title.includes("វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ")) {
    const year = extractYear(title, fallbackYear);
    return `${year} Bac II Khmer Literature Examination`;
  }

  const clean = String(title).trim();
  return clean || "Exam paper";
}

const snapshot = await getDocs(collection(db, "exam_papers"));
let updated = 0;
let skipped = 0;

for (const docSnapshot of snapshot.docs) {
  const data = docSnapshot.data();
  const title = data?.title;

  if (!title) continue;

  if (data.translated_title) {
    skipped += 1;
    continue;
  }

  const translatedTitle = buildEnglishTitle(title, data.year);

  await updateDoc(doc(db, "exam_papers", docSnapshot.id), {
    translated_title: translatedTitle,
    translated_title_language: "en",
  });

  updated += 1;
  console.log(`Updated: ${docSnapshot.id} => ${translatedTitle}`);
}

console.log(`Done. Updated: ${updated}, skipped: ${skipped}`);
