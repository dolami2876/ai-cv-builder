#!/usr/bin/env python3
"""
Convert PDF to text using EasyOCR (OCR on each page image).
Requires: pip install pymupdf easyocr
Usage: python pdf_to_text_easyocr.py <path_to_pdf>
Output: plain text to stdout; errors to stderr and exit code 1.
"""
import sys
import os

def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: pdf_to_text_easyocr.py <path_to_pdf>\n")
        sys.exit(1)
    pdf_path = sys.argv[1]
    if not os.path.isfile(pdf_path):
        sys.stderr.write(f"File not found: {pdf_path}\n")
        sys.exit(1)

    try:
        import fitz  # PyMuPDF
        import numpy as np
        import easyocr
    except ImportError as e:
        sys.stderr.write(f"Missing dependency: {e}\nInstall: pip install pymupdf easyocr\n")
        sys.exit(1)

    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        sys.stderr.write(f"Failed to open PDF: {e}\n")
        sys.exit(1)

    # EasyOCR: English + Vietnamese for CV
    reader = easyocr.Reader(["en", "vi"], gpu=False, verbose=False)
    texts = []

    try:
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap(dpi=200)
            # PyMuPDF: samples are contiguous bytes, shape (height, width, n)
            n = pix.n
            if n not in (3, 4):
                # Convert to RGB if needed (e.g. grayscale)
                img = np.ndarray((pix.height, pix.width, n), dtype=np.uint8, buffer=pix.samples)
                if n == 1:
                    img = np.repeat(img, 3, axis=2)
                else:
                    img = img[:, :, :3]
            else:
                img = np.ndarray((pix.height, pix.width, n), dtype=np.uint8, buffer=pix.samples)
                if n == 4:
                    img = img[:, :, :3]
            result = reader.readtext(img)
            page_text = " ".join([item[1] for item in result]).strip()
            if page_text:
                texts.append(page_text)
        doc.close()
    except Exception as e:
        sys.stderr.write(f"OCR error: {e}\n")
        sys.exit(1)

    combined = "\n\n".join(texts).strip()
    if not combined:
        sys.stderr.write("No text extracted from PDF.\n")
        sys.exit(1)
    print(combined)

if __name__ == "__main__":
    main()
