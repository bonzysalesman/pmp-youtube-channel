# day 2 production runbook

## objective
Create Day 2 in Day 1 style using master template workflow, no `python-pptx`, with presenter notes and brand-consistent original visuals.

## workflow used
1. Review source content from `source.md` (Day 2 section around line ~4651).
2. Review Day 1 assets and hybrid references for style consistency.
3. Generate original Day 2 visuals via script:
   - `src/generated/week-01/day-02/scripts/generate_day2_images.js`
   - output in `src/generated/week-01/day-02/images/*.svg`
4. Map generated visuals into deck markdown:
   - `src/generated/week-01/day-02/day2-master-content.md`
5. Render Day 2 draft deck using Marp:
   - `day2-draft.pptx`
   - `day2-slide.001.png ... day2-slide.013.png`
6. Build master-based deliverable by XML package editing:
   - script: `src/generated/week-01/day-02/build_day2_from_master.py`
   - output: `day2-master-built.pptx`
7. Validate output package:
   - `[Content_Types].xml` set to presentation type
   - notes present in `ppt/notesSlides/notesSlide*.xml`

## constraints respected
- no `python-pptx` library used
- master template reused (`.potx` -> `.pptx` package conversion)
- Day 1 visual language preserved (palette, typography rhythm, layout behavior)
- presenter notes included

## key outputs
- `/Users/bonzysalesman/Project/pmp-exam-prep/src/generated/week-01/day-02/day2-master-built.pptx`
- `/Users/bonzysalesman/Project/pmp-exam-prep/src/generated/week-01/day-02/images/`
- `/Users/bonzysalesman/Project/pmp-exam-prep/src/generated/week-01/day-02/artifacts/day2-image-manifest.md`
- `/Users/bonzysalesman/Project/pmp-exam-prep/src/generated/week-01/day-02/artifacts/day2-image-prompts.md`
