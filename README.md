# CineCode Generator

**Chromatics in real-time, rendered client-side.**

CineCode Generator is a browser-based creation tool that decompresses entire feature films into single-image color barcodes. Using local video stream parsing and hardware-accelerated canvas processing, it transforms hours of motion picture data into static visual artifacts completely client-side.

>  **Generate your own →** [cinecode.revanth.design](https://cinecode.revanth.design)  
>  **Play the quiz live →** [cinequiz.revanth.design](https://cinequiz.revanth.design)

---

## The Philosophy of the Web Generator

Generating a high-resolution color timeline usually requires heavy server-side processing pipelines (FFmpeg, OpenCV, Python wrappers). This creates three friction points: bandwidth costs of uploading gigabytes of video, server compute overhead, and privacy concerns.

The **CineCode Web Generator** solves this by shifting 100% of the extraction and scaling logic to the **browser client**:
- **Zero upload bandwidth**: Your film files never leave your device. The browser decrypts and decodes the container locally.
- **Hardware-accelerated rendering**: Uses the browser’s native GPU-accelerated video decoding engine and 2D canvas context.
- **Zero server costs**: Infinite scaling capacity because the client is the server.

---

## Features

| Feature | Detail |
|---|---|
| **Smart Temporal Slicing** | Extracts frames at precise intervals calculated automatically based on duration and target width. |
| **MagicScaler 2-Pass Average** | A replica of the high-quality desktop averaging algorithm: downscales frames into a 1px vertical column first, then stretches to full height to compute the exact color average rather than a crude point sample. |
| **Dominant Color Extraction** | Analyzes the vertical center of the final barcode to generate the top 5 distinct, high-contrast hex codes representing the film's palette. |
| **Poster Export Mode** | Transforms the barcode from a raw visual strip into a physical gallery-style poster with ivory margins, metadata, typography, and the 5-color palette strip. |
| **Link Scanner & QR Integration** | Scan links or embed invisible metadata into the barcode with a blended QR overlay for direct routing. |

---

## Design Thinking

The generator’s user interface is built on a **light editorial design system** inspired by high-end museum catalogs and printed cinema journals (reminiscent of Criterion, and A24).

```
  Minimalist Typography      Ivory Matte Canvas        Functional High-Contrast
[ Plus Jakarta / Playfair ]  [    #fbfbf9    ]  -----> [       #18181b        ]
```

- **Achromatic Controls**: Controls are designed with absolute visual neutrality. Using zero-glow panels and strict monochrome details ensures that the generator UI does not clash with, distract from, or bias the designer's perception of the movie's actual colors.
- **Ivory Background**: The canvas preview is framed against a warm, light ivory (`#fbfbf9`), presenting the generated cinecode as the focus.
- **Touch-Optimized Sliders**: Controls feature expanded interactive hit zones (`28px` container heights and `20px` thumbs) to make dialing in fine resolutions smooth and precise on both desktop monitors and touch screens.

---

## Running Locally

### Prerequisites
- **Node.js 18+**

### Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/apshampa/cinecode.git
   cd cinecode
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
   This generates a static, production-ready bundle in the `dist/` directory that can be served from any static file hosting service.

---

##  Credits

This web tool is heavily inspired by the desktop application logic built by Melvyn Laily. 

All credit for the original underlying pixel-slicing math and MagicScaler average calculations goes to:  
**[zerowidthjoiner.net/movie-barcode-generator](https://zerowidthjoiner.net/movie-barcode-generator)**

---

## License

Created by [Revanth](https://revanth.design). Visual timelines are generated from copyrighted motion pictures for educational, research, and design analysis purposes.
