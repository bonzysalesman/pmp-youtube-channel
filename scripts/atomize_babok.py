import re
import os

# Configuration
INPUT_FILE = "/Users/bonzysalesman/Project/pmp-exam-prep/_bmad-output/atoms/babok_text.txt"
OUTPUT_DIR = "/Users/bonzysalesman/Project/pmp-exam-prep/_bmad-output/atoms/techniques"
CORE_DIR = "/Users/bonzysalesman/Project/pmp-exam-prep/_bmad-output/atoms/core"

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def atomize_techniques():
    print("Starting technique atomization...")
    ensure_dir(OUTPUT_DIR)
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find 10.X headers (Techniques)
    # Looking for: 10.1   Acceptance and Evaluation Criteria
    pattern = r'(?m)^\s*(10\.\d+)\s+(.+)$'
    matches = list(re.finditer(pattern, content))
    
    for i in range(len(matches)):
        match = matches[i]
        tag = match.group(1).strip()
        name = match.group(2).strip().replace('/', '_')
        start = match.start()
        end = matches[i+1].start() if i+1 < len(matches) else len(content)
        
        # Heuristic to avoid matching the Table of Contents or similar
        # If the length of the content until the next match is too small, it's likely a TOC entry
        # or if we are still in the beginning of the file.
        if end - start < 100:
            continue
            
        filename = f"TECH_{tag}_{name.replace(' ', '_')}.md"
        atom_content = content[start:end].strip()
        
        # Clean up some common PDF artifacts if needed
        # (Simplified for now)
        
        with open(os.path.join(OUTPUT_DIR, filename), 'w', encoding='utf-8') as out:
            out.write(f"# Technique: {name} ({tag})\n\n{atom_content}")
            
    print(f"Extraction complete. Files saved to {OUTPUT_DIR}")

def atomize_core_concepts():
    print("Starting core concept atomization...")
    ensure_dir(CORE_DIR)
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for Chapter 2 sections
    sections = [
        ("BACCM", r"(?m)^\s*(2\.1)\s+(The Business Analysis Core Concept Model.+)"),
        ("Key_Terms", r"(?m)^\s*(2\.2)\s+(Key Terms.+)"),
        ("Stakeholders", r"(?m)^\s*(2\.4)\s+(Stakeholders.+)")
    ]
    
    for label, pattern in sections:
        match = re.search(pattern, content)
        if match:
            start = match.start()
            filename = f"CORE_{label}.md"
            # Find next numbered section or chapter to stop
            next_pattern = r"(?m)^\s*(\d\.\d)\s+"
            next_match = re.search(next_pattern, content[start+20:])
            if next_match:
                end = start + 20 + next_match.start()
            else:
                end = start + 10000 # Fallback
                
            atom_content = content[start:end].strip()
            with open(os.path.join(CORE_DIR, filename), 'w', encoding='utf-8') as out:
                out.write(f"# Core Concept: {label}\n\n{atom_content}")
    # Search for Chapter 11 Perspectives
    perspectives = [
        ("Agile", r"(?m)^\s*(11\.1)\s+(The Agile Perspective.+)"),
        ("Business_Intelligence", r"(?m)^\s*(11\.2)\s+(The Business Intelligence Perspective.+)"),
        ("Information_Technology", r"(?m)^\s*(11\.3)\s+(The Information Technology Perspective.+)"),
        ("Business_Architecture", r"(?m)^\s*(11\.4)\s+(The Business Architecture Perspective.+)"),
        ("Business_Process_Management", r"(?m)^\s*(11\.5)\s+(The Business Process Management Perspective.+)")
    ]
    
    for label, pattern in perspectives:
        match = re.search(pattern, content)
        if match:
            start = match.start()
            filename = f"PERSP_{label}.md"
            ensure_dir(os.path.join(CORE_DIR, "perspectives"))
            
            next_pattern = r"(?m)^\s*(11\.\d)\s+"
            next_match = re.search(next_pattern, content[start+20:])
            if next_match:
                end = start + 20 + next_match.start()
            else:
                end = start + 20000
                
            atom_content = content[start:end].strip()
            with open(os.path.join(CORE_DIR, "perspectives", filename), 'w', encoding='utf-8') as out:
                out.write(f"# Perspective: {label}\n\n{atom_content}")
            print(f"Extracted {label} Perspective")

if __name__ == "__main__":
    atomize_techniques()
    atomize_core_concepts()
