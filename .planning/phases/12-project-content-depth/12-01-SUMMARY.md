---
plan: 12-01
phase: 12-project-content-depth
status: complete
completed: 2026-05-22
commit: c75a1ce
---

# 12-01 Summary: Project Content Depth

## What Was Built

All six project MDX deep-dive files (3 EN + 3 DE) now contain:
- **GitHub repository links** at the top of each file
- **Real syntax-highlighted code blocks** relevant to each project, rendered with the Phase 11 vesper theme pipeline
- **"What I'd Do Differently" / "Was ich anders machen würde"** sections with 3 specific, first-person technical reflection bullets each

## Changes Per File

### English (EN)

**mimo-ai-channel-quality-tool.mdx**
- GitHub link: `https://github.com/lnlohith/mimo-ai-channel-quality`
- Code block: Python MMSE channel estimator (`channel_estimator.py`) — computes SNR from CSI matrix using MMSE filter weights
- Reflections: 2×2 validation before 4×4 scale-up, QAT vs post-training quantization, dynamic batching for Edge TPU

**vlc-v2v-communication.mdx**
- GitHub link: `https://github.com/lnlohith/vlc-v2v-communication`
- Code block: C++ Manchester encoding transmitter loop (`manchester_encoding.cpp`) for Arduino MCU
- Reflections: Narrower-FOV photodiode + bandpass filter, hardware SPI/PIO encoding, adaptive bit-slicing thresholds

**iot-security-project.mdx**
- GitHub link: `https://github.com/lnlohith/iot-security-project`
- Code block: C++ ESP32 WiFiClientSecure mTLS setup (`secure_firmware.cpp`) with per-device certificate chain
- Reflections: Hardware-accelerated ECC (ATECC608A), mandatory mTLS from day one, secure boot + flash encryption at bringup

### German (DE)

**mimo-ai-channel-quality-tool.mdx (DE)**
- All code comments and variable names translated to German
- Reflection bullets localized with professional German engineering vocabulary

**vlc-v2v-communication.mdx (DE)**
- All code comments, variable names (e.g., `SENDE_PIN`, `HALBES_BIT_US`, `paket_senden`) translated to German
- Reflection bullets localized

**iot-security-project.mdx (DE)**
- All code comments, variable names (e.g., `WURZEL_CA_ZERT`, `sichere_verbindung_aufbauen`) translated to German
- Reflection bullets localized with precise German security terminology

## Verification

- `npm run type-check`: ✓ 0 errors
- `npm run build`: ✓ 20/20 static pages generated
- All 6 project slugs compiled (3 EN + 3 DE)
- Code blocks use fenced markdown with language + title metadata — fully compatible with rehype-pretty-code vesper theme

## Self-Check: PASSED

## Key Files Created/Modified
- key-files:
  - created: []
  - modified:
    - src/content/projects/en/mimo-ai-channel-quality-tool.mdx
    - src/content/projects/en/vlc-v2v-communication.mdx
    - src/content/projects/en/iot-security-project.mdx
    - src/content/projects/de/mimo-ai-channel-quality-tool.mdx
    - src/content/projects/de/vlc-v2v-communication.mdx
    - src/content/projects/de/iot-security-project.mdx

## Deviations
- None. All 6 files meet the success criteria in the PLAN frontmatter.
