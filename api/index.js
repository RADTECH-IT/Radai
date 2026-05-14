import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const app = express();

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-flash-latest";

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const RAD_AI_SYSTEM_PROMPT = `
Kamu adalah RadAI Tutor — asisten belajar AI cerdas eksklusif untuk Radiografer.

IDENTITAS & PERSONA:
- Peran: Tutor akademik & klinis (Radiology Learning Assistant).
- Kepribadian: Hangat, sabar, profesional, dan sangat edukatif.
- Bahasa: Gunakan Bahasa Indonesia yang baik, benar, dan profesional.
- Batasan: Kamu HANYA membahas topik di dalam kurikulum Teknik Radiologi, termasuk:
  * Bahasa Inggris untuk Radiografer
  * Fisika Dasar & Fisika Radiasi
  * Matematika Dasar
  * Komputer Radiologi
  * Teknik Pencitraan & Anatomi Radiologi


Gunakan format Markdown untuk membuat penjelasan lebih rapi.
PENTING: Gunakan tag HTML <details> dan <summary> untuk menyembunyikan kunci jawaban atau penjelasan panjang agar Anda bisa mencoba menganalisis terlebih dahulu.
`;

// Helper untuk Upload
async function handleUpload(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        let text = "";
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdf(req.file.buffer);
            text = data.text;
        } else {
            text = req.file.buffer.toString('utf-8');
        }
        res.json({ text });
    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract text from document' });
    }
}

// Helper untuk Chat
async function handleChat(req, res) {
    const { conversation, mode } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Conversation must be an array!');
        let modeInstruction = "";
        switch (mode) {
            case 'explain':
                modeInstruction = "\nMODE: EXPLAIN. Berikan penjelasan mendalam. Gunakan dropdown (<details>) untuk detail teknis yang sangat rumit.";
                break;
            case 'quiz':
                modeInstruction = `\nMODE: QUIZ. Buatlah soal kuis interaktif. \nATURAN DROPDOWN: \nSetiap soal harus diikuti dengan dropdown untuk jawaban. Format:\nSoal 1: [Pertanyaan]\nA. [Opsi]\nB. [Opsi]\n...\n<details>\n<summary><b>Cek Jawaban & Pembahasan Soal 1</b></summary>\n<b>Jawaban:</b> [Huruf Jawaban]\n<b>Penjelasan:</b> [Penjelasan mendalam mengapa itu benar]\n</details>\n`;
                break;
            case 'summary':
                modeInstruction = "\nMODE: SUMMARY. Buat ringkasan poin-poin. Gunakan dropdown untuk detail tambahan di setiap poin.";
                break;
            case 'case':
                modeInstruction = `\nMODE: CASE STUDY. Berikan skenario klinis. Gunakan dropdown untuk menyembunyikan analisis tindakan yang benar agar Anda bisa berpikir terlebih dahulu.\nFormat:\n[Skenario Kasus]\n<details>\n<summary><b>Lihat Analisis & Tindakan Radiografer</b></summary>\n[Analisis dan prosedur yang tepat]\n</details>\n`;
                break;
            default:
                modeInstruction = "\nMODE: GENERAL. Bantu Radiografer dalam praktik radiologi.";
        }
        const fullPrompt = RAD_AI_SYSTEM_PROMPT + modeInstruction;
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: fullPrompt });
        const history = conversation.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        const result = await model.generateContentStream({
            contents: history,
            generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
        });
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (const chunk of result.stream) {
            res.write(chunk.text());
        }
        res.end();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}

// Routes
app.get('/api/test', (req, res) => res.json({ status: 'RadAI API is running' }));
app.post('/api/upload', upload.single('file'), handleUpload);
app.post('/api/chat', handleChat);
// Fallback routes for Vercel
app.post('/upload', upload.single('file'), handleUpload);
app.post('/chat', handleChat);

export default app;
