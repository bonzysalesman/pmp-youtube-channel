# Thumbnail Design Specifications

## Color Coding System

### Domain Colors
- **People (42%):** Green (#2ECC71)
- **Process (50%):** Blue (#3498DB) 
- **Business Environment (8%):** Orange (#E67E22)
- **Practice/Review:** Purple (#9B59B6)

## Design Elements

### Required Components
- Week/Day number (large, prominent)
- Topic title (clear, readable)
- Personal branding element
- Domain color background/accent
- Professional headshot (optional)

### Typography
- Primary font: Bold, sans-serif
- Week/Day numbers: 72pt minimum
- Topic title: 36pt minimum
- High contrast for readability

### Dimensions
- YouTube standard: 1280x720 pixels
- Aspect ratio: 16:9
- Safe area: 1235x675 pixels (accounting for UI overlays)

## Template Variations

### Daily Study Template
- Background: Domain color gradient
- Text: "Day {{day_number}}" (top left)
- Title: "{{topic_title}}" (center)
- Week indicator: "Week {{week_number}}" (bottom right)

### Practice Session Template  
- Background: Purple gradient
- Text: "Practice" (top left)
- Title: "{{topic_title}}" (center)
- Week indicator: "Week {{week_number}}" (bottom right)

### Review Session Template
- Background: Mixed domain colors
- Text: "Week {{week_number}} Review" (top)
- Title: "{{topics_covered}}" (center)
- Progress indicator: "{{completion_percentage}}%" (bottom)

## A/B Testing Variants
- High contrast vs. gradient backgrounds
- With vs. without personal photo
- Different text positioning
- Emoji vs. text-only titles