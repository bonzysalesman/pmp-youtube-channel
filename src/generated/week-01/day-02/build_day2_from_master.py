#!/usr/bin/env python3
import zipfile
import xml.etree.ElementTree as ET
import re
from pathlib import Path

# Paths
BASE_DIR = Path('/Users/bonzysalesman/Project/pmp-exam-prep/src/generated/week-01/day-02')
MASTER_POTX = Path('/Users/bonzysalesman/Project/pmp-exam-prep/src/templates/pmp-mastery-master-template.potx')
DRAFT_PPTX = BASE_DIR / 'day2-draft.pptx'
SLIDES_MD = BASE_DIR / 'slides.md'
OUT_PPTX = BASE_DIR / 'day2-master-built.pptx'

def extract_notes_from_md(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by horizontal rule
    slides_md = content.split('\n---\n')
    notes = {}
    for i, slide in enumerate(slides_md):
        # Extract content between <!-- and -->
        match = re.search(r'<!--(.*?)-->', slide, re.DOTALL)
        if match:
            note_content = match.group(1).replace('"', '').replace('“', '').replace('”', '').strip()
            notes[i + 1] = note_content
    return notes

P_NS = 'http://schemas.openxmlformats.org/presentationml/2006/main'
A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
ET.register_namespace('p', P_NS)
ET.register_namespace('a', A_NS)

def convert_template_to_presentation(content_types_xml: bytes) -> bytes:
    text = content_types_xml.decode('utf-8')
    return text.replace(
        'application/vnd.openxmlformats-officedocument.presentationml.template.main+xml',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml'
    ).encode('utf-8')

def replace_notes_text(notes_xml: bytes, note_text: str) -> bytes:
    root = ET.fromstring(notes_xml)
    ns = {'p': P_NS, 'a': A_NS}
    body_sp = None
    for sp in root.findall('.//p:sp', ns):
        ph = sp.find('./p:nvSpPr/p:nvPr/p:ph', ns)
        if ph is not None and ph.attrib.get('type') == 'body':
            body_sp = sp
            break
    if body_sp is None:
        return notes_xml

    tx_body = body_sp.find('./p:txBody', ns)
    if tx_body is None:
        return notes_xml

    for child in list(tx_body):
        if child.tag == f'{{{A_NS}}}p':
            tx_body.remove(child)

    for line in note_text.split('\n'):
        if not line.strip(): continue
        p = ET.SubElement(tx_body, f'{{{A_NS}}}p')
        r = ET.SubElement(p, f'{{{A_NS}}}r')
        rpr = ET.SubElement(r, f'{{{A_NS}}}rPr')
        rpr.set('lang', 'en-US')
        t = ET.SubElement(r, f'{{{A_NS}}}t')
        t.text = line
        end = ET.SubElement(p, f'{{{A_NS}}}endParaRPr')
        end.set('lang', 'en-US')

    return ET.tostring(root, encoding='utf-8', xml_declaration=True)

# Main build
notes = extract_notes_from_md(SLIDES_MD)

with zipfile.ZipFile(MASTER_POTX, 'r') as master, zipfile.ZipFile(DRAFT_PPTX, 'r') as draft:
    # Marp draft media can be ppt/media/image1.png OR ppt/media/Slide-X-image-1.png
    draft_media_dict = {}
    for info in draft.infolist():
        if info.filename.startswith('ppt/media/image'):
            m = re.search(r'image(\d+)', info.filename)
            if m:
                draft_media_dict[int(m.group(1))] = info.filename
        elif info.filename.startswith('ppt/media/Slide-'):
            m = re.search(r'Slide-(\d+)-', info.filename)
            if m:
                draft_media_dict[int(m.group(1))] = info.filename

    with zipfile.ZipFile(OUT_PPTX, 'w', compression=zipfile.ZIP_DEFLATED) as out:
        for info in master.infolist():
            data = master.read(info.filename)

            if info.filename == '[Content_Types].xml':
                data = convert_template_to_presentation(data)

            # Swap images: ppt/media/Slide-1-image-1.png -> draft image 1
            if info.filename.startswith('ppt/media/Slide-') and info.filename.endswith('-image-1.png'):
                slide_idx = int(re.search(r'Slide-(\d+)-', info.filename).group(1))
                if slide_idx in draft_media_dict:
                    data = draft.read(draft_media_dict[slide_idx])

            # Swap notes
            if info.filename.startswith('ppt/notesSlides/notesSlide') and info.filename.endswith('.xml') and '/_rels/' not in info.filename:
                idx = int(re.search(r'notesSlide(\d+)\.xml$', info.filename).group(1))
                if idx in notes:
                    data = replace_notes_text(data, notes[idx])

            out.writestr(info, data)

print(f"Generated: {OUT_PPTX}")
