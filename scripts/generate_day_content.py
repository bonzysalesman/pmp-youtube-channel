#!/usr/bin/env python3
import re
import sys
import json
from pathlib import Path

def extract_day_content(source_path, day_number):
    with open(source_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    day_header = f"Day {day_number} "
    start_line = -1
    for i, line in enumerate(lines):
        if line.startswith(day_header):
            start_line = i
            break
    
    if start_line == -1:
        return None

    # Find end of day (start of next day)
    next_day_header = f"Day {day_number + 1} "
    end_line = len(lines)
    for i in range(start_line + 1, len(lines)):
        if lines[i].startswith(next_day_header):
            end_line = i
            break
    
    day_content = lines[start_line:end_line]
    
    slides = []
    current_slide = None
    collecting_notes = False
    
    for line in day_content:
        line = line.strip()
        if not line:
            continue
            
        slide_match = re.match(r"Slide (\d+):", line)
        if slide_match:
            if current_slide:
                slides.append(current_slide)
            current_slide = {
                "id": slide_match.group(1),
                "title": "",
                "bullets": [],
                "image_suggestion": "",
                "notes": []
            }
            collecting_notes = False
            continue
            
        if current_slide:
            if line.startswith("Title:"):
                current_slide["title"] = line.replace("Title:", "").strip()
            elif line.startswith("Image Suggestion:"):
                current_slide["image_suggestion"] = line.replace("Image Suggestion:", "").strip()
            elif line.startswith("Presenter Notes:"):
                collecting_notes = True
            elif collecting_notes:
                if not line.startswith("……………"):
                    current_slide["notes"].append(line)
            elif line.startswith("•") or line.startswith("-") or line.startswith("*"):
                current_slide["bullets"].append(line.lstrip("•-*").strip())
            elif not collecting_notes and not line.startswith("Title:") and not line.startswith("Image Suggestion:") and not line.startswith("……………"):
                # If we don't have a title yet, this first line should be the title
                if not current_slide["title"]:
                    current_slide["title"] = line
                elif len(line) < 100: # Heuristic for a bullet/short line
                     current_slide["bullets"].append(line)
                
    return slides

def generate_presentation_guide(slides, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Presentation Guide: Day 2 - Your PMP® Exam Toolkit\n\n")
        f.write("## 🎬 Overall Flow\n")
        f.write("- **Verbatim Hook**: \"Welcome back to our PMP® Exam Preparation Course. Today, we shift our focus to the essential resources that will form the backbone of your study and our course.\"\n\n")
        
        for slide in slides:
            f.write(f"### Slide {slide['id']}: {slide['title']}\n")
            f.write("**Notes (Verbatim):**\n")
            f.write("\n".join(slide['notes']) + "\n\n")
            f.write("---\n\n")

def generate_youtube_script(slides, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# YouTube Script: Day 2 - Your PMP® Exam Toolkit\n\n")
        f.write("## [00:00] 1. The Hook\n")
        f.write("Stop studying the wrong way. Most PMP candidates fail because they treat the PMBOK Guide like a textbook to be memorized. Today, I'm showing you the actual blueprint—the ECO—and how to use your resources correctly...\n\n")
        for slide in slides:
            f.write(f"### [Slide {slide['id']}] {slide['title']}\n")
            f.write("*(High-energy delivery, focusing on the 'Key Takeaway' for each resource)*\n")
            f.write("\n".join(slide['notes']) + "\n\n")
            f.write("---\n\n")

def generate_course_script(slides, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Course Script: Day 2 Masterclass\n\n")
        f.write("## [00:00] Opening & Welcome\n")
        f.write("Welcome to the Day 2 Deep Dive. Yesterday was about the 'Why', today is about the 'How'. We are building your study architecture...\n\n")
        for slide in slides:
            f.write(f"### Slide {slide['id']}: {slide['title']}\n")
            f.write("*(Instructor-led, detailed walkthrough with deep concept explanations)*\n")
            f.write("\n".join(slide['notes']) + "\n\n")
            f.write("---\n\n")

def generate_marp_content(slides, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("---\nmarp: true\ntheme: pmp-mastery-framework\npaginate: true\n---\n\n")
        
        for i, slide in enumerate(slides):
            # Class mapping (refined based on slides-improved.md)
            slide_class = ""
            if i == 0:
                slide_class = "cover"
            elif i == 1:
                slide_class = "agenda"
            elif "Activity" in slide['title']:
                slide_class = "tips"
            elif "13-week" in slide['title'] or "plan snapshot" in slide['title'].lower():
                slide_class = "calendar-snap"
                
            if slide_class:
                f.write(f"<!-- _class: {slide_class} -->\n")
            
            # Special case for calendar embed
            if slide_class == "calendar-snap":
                f.write("![bg cover](../../pmp-mastery-13-week-calendar-slide.png)\n\n---\n\n")
                # Continue after the embed slide
                f.write("<!-- _class: tips calendar-snap -->\n")
                f.write("![bg right:52%](../../pmp-mastery-13-week-calendar-slide.png)\n")

            # Image mapping (Slide 1-6 are generated high-fidelity PNGs)
            img_map = {
                "1": "day2_01_cover_toolkit_1772656814509.png",
                "2": "day2_02_study_materials_collage_1772656897901.png",
                "3": "day2_03_pmbok_focus_1772656978370.png",
                "4": "day2_04_agile_guide_1772657082118.png",
                "5": "day2_05_process_flow_1772657617150.png",
                "6": "day2_06_exam_metrics_1772657815750.png",
                "7": "day2-image-07-eco-structure.svg",
                "8": "day2-image-08-domain-weighting.svg",
                "9": "day2-image-09-eco-activity.svg",
                "10": "day2-image-10-next-steps.svg"
            }
            img = img_map.get(slide['id'], "")
            if img:
                pos = "left" if int(slide['id']) % 2 == 1 else "right"
                # Using local images directory in generated folder
                f.write(f"![bg {pos}:42%](./images/{img})\n\n")
            
            if i == 0:
                f.write("<div class=\"cover-inner\">\n")
                f.write("<div class=\"cover-eyebrow\">PMP exam preparation course</div>\n")
                f.write("<div class=\"cover-mark\">\n")
                f.write("  <span class=\"cover-pmp\">PMP</span>\n")
                f.write("  <span class=\"cover-rule\"></span>\n")
                f.write("  <span class=\"cover-sub\">Mastery Framework</span>\n")
                f.write("</div>\n")
                f.write(f"<div class=\"cover-doc\">Day 2 session</div>\n")
                f.write(f"<h1 class=\"cover-title\">{slide['title']}</h1>\n")
                f.write("</div>\n")
            else:
                f.write(f"# {slide['title']}\n")
                for bullet in slide['bullets']:
                    f.write(f"- {bullet}\n")
            
            # Add Presenter Notes
            if slide['notes']:
                f.write("\n\n<!--\n")
                f.write("\n".join(slide['notes']))
                f.write("\n-->\n")
            
            f.write("\n\n---\n\n")

def main():
    source_file = Path("/Users/bonzysalesman/Project/pmp-exam-prep/source.md")
    day = 2
    output_dir = Path("/Users/bonzysalesman/Project/pmp-exam-prep/src/generated/week-01/day-02")
    scripts_dir = output_dir / "scripts"
    scripts_dir.mkdir(parents=True, exist_ok=True)
    
    slides = extract_day_content(source_file, day)
    if not slides:
        print(f"Day {day} not found.")
        return

    # Targeting the user's active file: slides.md
    generate_marp_content(slides, output_dir / "slides.md")
    
    generate_presentation_guide(slides, output_dir / "presentation-guide-automated.md")
    generate_marp_content(slides, output_dir / "day2-master-content-automated.md")
    generate_youtube_script(slides, scripts_dir / "day-02-youtube-script-automated.md")
    generate_course_script(slides, scripts_dir / "day-02-course-script-automated.md")
    
    print(f"Successfully regenerated slides.md and all automated content for Day {day} in {output_dir}")

if __name__ == "__main__":
    main()
