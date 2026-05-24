# CineCode

CineCode is a web application that generates color timeline posters from your favorite movies. It extracts the dominant color signature of each frame to create a visual print representing the film's unique color journey.

---

## Features

### 1. High-Performance Frame Extraction
- Optimized seek-and-decode frame parsing engine.
- Four processing speed profiles:
  - **Turbo (8px steps)**: Renders approximately 8x faster. Ideal for quick draft runs.
  - **Fast (4px steps - Default)**: Renders approximately 4x faster. Balanced speed and detail, visually indistinguishable from per-pixel scans.
  - **Standard (2px steps)**: Renders approximately 2x faster.
  - **High Quality (1px step)**: Full extraction, matching per-pixel accuracy.

### 2. Real-Time Live Poster Preview
- Displays the complete poster in the UI (including drop shadows, custom movie titles, palette cards, and QR watermarks).
- Typing in a movie title or updating controls triggers a responsive redraw in milliseconds, providing an instant preview without requiring video reprocessing.

### 3. Invisible Link Watermarking (Steganography)
- Encodes web links (like IMDb pages or personal movie blogs) directly into the Least Significant Bits (LSB) of the Cinecode color bars.
- The visual changes are mathematically restricted to a maximum deviation of 1 out of 256, rendering the watermark completely invisible to the human eye.
- PNG downloads preserve these bits losslessly.

### 4. Blended Timeline QR Codes (Optical Camera Scanning)
- Option to overlay a QR code directly over the color timeline.

### 5. Multi-Mode Link Scanner
- Dedicated decoding tab in the interface.
- Supports digital steganography file decoding (uploading screenshots or lossless PNGs).
