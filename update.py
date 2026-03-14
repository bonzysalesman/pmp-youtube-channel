import re

with open("understrap-child-1.2.0/front-page.php", "r") as f:
    html = f.read()

pattern = r'<li class="py-3(.*?)">\s*<div class="week-title-row"><strong style="color: #374151;">(.*?):</strong> <span>(.*?)</span></div>\s*<ul class="daily-breakdown-list">(.*?)</ul>\s*</li>'

def replacer(match):
    classAttr = match.group(1)
    weekLabel = match.group(2)
    weekName = match.group(3)
    listItems = match.group(4)
    # create ID like week1-details
    weekId = weekLabel.lower().replace(" ", "") + "-details"
    
    return f"""<li class="py-3{classAttr}">
    <div class="week-title-row" data-bs-toggle="collapse" data-bs-target="#{weekId}" aria-expanded="false" style="cursor: pointer;">
        <div class="d-flex align-items-center w-100">
            <strong style="color: #374151; min-width: 65px; margin-right: 0.5rem;">{weekLabel}:</strong> 
            <span class="flex-grow-1">{weekName}</span>
            <i class="fas fa-chevron-down text-muted transition-transform" style="font-size: 0.8rem;"></i>
        </div>
    </div>
    <div class="collapse" id="{weekId}">
        <ul class="daily-breakdown-list mt-2">{listItems}</ul>
    </div>
</li>"""

new_html = re.sub(pattern, replacer, html, flags=re.DOTALL)

with open("understrap-child-1.2.0/front-page.php", "w") as f:
    f.write(new_html)
