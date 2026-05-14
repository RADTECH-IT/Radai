import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const app = express();
const PORT = 3002;

// Inisialisasi Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-flash-latest";

app.use(cors());
app.use(express.json());

// Konfigurasi Multer untuk upload file (disimpan di memori)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Instruksi Sistem RadAI - Persona Tutor
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

// Endpoint untuk upload dan ekstrak teks PDF
app.post('/api/upload', upload.single('file'), async (req, res) => {
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
});

app.post('/api/chat', async (req, res) => {
    const { conversation, mode } = req.body;
    
    try {
        if (!Array.isArray(conversation)) throw new Error('Conversation must be an array!');

        // Tentukan instruksi spesifik berdasarkan MODE
        let modeInstruction = "";
        switch (mode) {
            case 'explain':
                modeInstruction = "\nMODE: EXPLAIN. Berikan penjelasan mendalam. Gunakan dropdown (<details>) untuk detail teknis yang sangat rumit.";
                break;
            case 'quiz':
                modeInstruction = `
\nMODE: QUIZ. Buatlah soal kuis interaktif. 
ATURAN DROPDOWN: 
Setiap soal harus diikuti dengan dropdown untuk jawaban. Format:
Soal 1: [Pertanyaan]
A. [Opsi]
B. [Opsi]
...
<details>
<summary><b>Cek Jawaban & Pembahasan Soal 1</b></summary>
<b>Jawaban:</b> [Huruf Jawaban]
<b>Penjelasan:</b> [Penjelasan mendalam mengapa itu benar]
</details>
`;
                break;
            case 'summary':
                modeInstruction = "\nMODE: SUMMARY. Buat ringkasan poin-poin. Gunakan dropdown untuk detail tambahan di setiap poin.";
                break;
            case 'case':
                modeInstruction = `
\nMODE: CASE STUDY. Berikan skenario klinis. Gunakan dropdown untuk menyembunyikan analisis tindakan yang benar agar Anda bisa berpikir terlebih dahulu.
Format:
[Skenario Kasus]
<details>
<summary><b>Lihat Analisis & Tindakan Radiografer</b></summary>
[Analisis dan prosedur yang tepat]
</details>
`;
                break;
            default:
                modeInstruction = "\nMODE: GENERAL. Bantu Radiografer dalam praktik radiologi.";
        }

        const fullPrompt = RAD_AI_SYSTEM_PROMPT + modeInstruction;

        const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODEL,
            systemInstruction: fullPrompt
        });

        const history = conversation.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const result = await model.generateContentStream({
            contents: history,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
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
});

app.listen(PORT, () => console.log(`RadAI Backend ready on http://localhost:${PORT}`));
