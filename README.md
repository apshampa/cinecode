# CineCode

CineCode is a premium, high-aesthetic web application that generates beautiful, high-resolution color timeline posters from your favorite movies. It extracts the dominant color signature of each frame to create a visual print representing the film's unique color journey.

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
- Option to overlay a transparent QR code centered directly over the color timeline.
- Rendered with transparent light blocks so only the white QR dots are layered on the color bars, serving as an aesthetic HUD-style digital watermark.
- Leverage the orientation anchors and error correction of standard QR codes to remain fully scannable by mobile cameras pointing at physical print-outs or computer screens.

### 5. Multi-Mode Link Scanner
- Dedicated decoding tab in the interface.
- Supports digital steganography file decoding (uploading screenshots or lossless PNGs).
- Restores active camera feeds to scan printed or on-screen blended Cinecodes on mobile devices.

### 6. Zero-Scroll Viewport Layout
- Responsive, application-style viewport locks the entire interface within 100vh.
- Settings scroll internally while the preview canvas rescales dynamically to fill all available space, mimicking a high-end desktop application.

---

## Running the Application

Because this application utilizes modern JavaScript modules, standard browser CORS policies require it to be served via a web server (it cannot be run by double-clicking the `index.html` file directly).

### Using Python
```bash
python -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Using Node.js
```bash
npx http-server -p 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.
