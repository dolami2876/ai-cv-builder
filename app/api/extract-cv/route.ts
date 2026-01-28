import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { spawn } from 'node:child_process';
import { writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Convert PDF to text using EasyOCR (Python script). Requires Python + pymupdf + easyocr. */
async function parsePdfWithEasyOCR(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = tmpdir();
    const tmpPath = join(tmpDir, `cv-pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
    try {
        await writeFile(tmpPath, buffer);
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const scriptPath = join(process.cwd(), 'scripts', 'pdf_to_text_easyocr.py');
        const text = await new Promise<string>((resolve, reject) => {
            const proc = spawn(pythonCmd, [scriptPath, tmpPath], {
                cwd: process.cwd(),
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
            });
            let stdout = '';
            let stderr = '';
            proc.stdout.setEncoding('utf-8');
            proc.stderr.setEncoding('utf-8');
            proc.stdout.on('data', (chunk) => { stdout += chunk; });
            proc.stderr.on('data', (chunk) => { stderr += chunk; });
            proc.on('close', (code) => {
                if (code === 0) resolve(stdout.trim());
                else reject(new Error(stderr || stdout || `Exit code ${code}`));
            });
            proc.on('error', (err) => reject(err));
        });
        return text;
    } finally {
        try { await unlink(tmpPath); } catch { /* ignore */ }
    }
}

// Dynamic imports for PDF and DOCX parsing
let mammoth: any;

export const maxDuration = 90;

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Check file type
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];

        const isValidType = allowedTypes.includes(fileType) || 
            allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!isValidType) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload PDF, DOCX, DOC, or TXT files." },
                { status: 400 }
            );
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size too large. Maximum size is 10MB." },
                { status: 400 }
            );
        }

        let extractedText = '';

        // Extract text based on file type
        if (fileName.endsWith('.txt')) {
            // Plain text file
            extractedText = await file.text();
        } else if (fileName.endsWith('.pdf')) {
            // Use EasyOCR (Python script: PyMuPDF + EasyOCR)
            try {
                extractedText = await parsePdfWithEasyOCR(file);
            } catch (err: any) {
                console.error("EasyOCR PDF error:", err);
                return NextResponse.json(
                    { error: `PDF OCR failed: ${err.message || 'Unknown error'}. Ensure Python is installed and run: pip install -r scripts/requirements-ocr.txt` },
                    { status: 500 }
                );
            }
            if (!extractedText || extractedText.trim().length === 0) {
                return NextResponse.json(
                    { error: "Could not extract text from PDF. Try pasting content manually." },
                    { status: 400 }
                );
            }
        } else if (fileName.endsWith('.docx')) {
            // Parse DOCX using mammoth
            try {
                // Dynamic import for mammoth
                if (!mammoth) {
                    mammoth = await import('mammoth');
                }
                
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
                
                // Also include messages if any (warnings, etc.)
                if (result.messages.length > 0) {
                    console.warn("Mammoth messages:", result.messages);
                }
                
                if (!extractedText || extractedText.trim().length === 0) {
                    return NextResponse.json(
                        { error: "Could not extract text from DOCX file. Please try converting to TXT or paste content manually." },
                        { status: 400 }
                    );
                }
            } catch (err: any) {
                console.error("DOCX parsing error:", err);
                return NextResponse.json(
                    { error: `Failed to parse DOCX file: ${err.message || 'Unknown error'}. Please try converting to TXT or paste content directly.` },
                    { status: 500 }
                );
            }
        } else if (fileName.endsWith('.doc')) {
            // .doc files (old Word format) are more complex
            // Mammoth doesn't support .doc, only .docx
            return NextResponse.json({
                error: ".doc files (old Word format) are not supported. Please convert to .docx or .txt first.",
                suggestion: "Open the file in Microsoft Word and save as .docx or .txt format."
            }, { status: 400 });
        }

        // Return extracted text
        return NextResponse.json({
            success: true,
            text: extractedText,
            fileName: file.name,
            fileSize: file.size,
        });

    } catch (error) {
        console.error("File extraction error:", error);
        return NextResponse.json(
            { error: "Failed to extract text from file" },
            { status: 500 }
        );
    }
}
