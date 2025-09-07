/**
 * PDF Generator
 * Generates professional PDF lead magnets with branding
 */

const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.outputPath = path.join(__dirname, '../../generated/lead-magnets');
        this.assetsPath = path.join(__dirname, '../../assets/branding');
        this.fonts = this.loadFonts();
        this.colors = {
            primary: '#2E86AB',
            secondary: '#A23B72',
            accent: '#F18F01',
            text: '#333333',
            lightGray: '#F5F5F5',
            darkGray: '#666666'
        };
    }

    loadFonts() {
        // In production, these would be actual font files
        return {
            heading: 'Helvetica-Bold',
            subheading: 'Helvetica',
            body: 'Helvetica',
            bold: 'Helvetica-Bold'
        };
    }

    /**
     * Generate PDF from content data
     */
    async generatePDF(contentData, magnetId) {
        await fs.ensureDir(this.outputPath);
        
        const fileName = `${magnetId}-${Date.now()}.pdf`;
        const filePath = path.join(this.outputPath, fileName);
        
        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });

        // Pipe to file
        doc.pipe(fs.createWriteStream(filePath));

        // Generate content based on type
        switch (contentData.type || magnetId) {
            case 'calendar':
            case '13-week-study-calendar':
                await this.generateCalendarPDF(doc, contentData);
                break;
            case 'practice_questions':
            case '50-common-questions':
                await this.generatePracticeQuestionsPDF(doc, contentData);
                break;
            case 'reference_guide':
            case 'pmp-mindset-cheat-sheet':
                await this.generateReferenceGuidePDF(doc, contentData);
                break;
            case 'checklist':
            case 'eco-task-checklist':
                await this.generateChecklistPDF(doc, contentData);
                break;
            default:
                await this.generateGenericPDF(doc, contentData);
        }

        // Finalize PDF
        doc.end();

        // Wait for file to be written
        await new Promise((resolve) => {
            doc.on('end', resolve);
        });

        return filePath;
    }

    /**
     * Generate study calendar PDF
     */
    async generateCalendarPDF(doc, data) {
        // Cover page
        this.addCoverPage(doc, data.content.title, data.content.subtitle);
        
        // Table of contents
        doc.addPage();
        this.addTableOfContents(doc, data.content.weeks);
        
        // Introduction
        doc.addPage();
        this.addIntroduction(doc, data.content);
        
        // Weekly pages
        data.content.weeks.forEach((week, index) => {
            doc.addPage();
            this.addWeekPage(doc, week, index + 1);
        });
        
        // Footer with contact info
        this.addFooterPages(doc, data.metadata);
    }

    /**
     * Generate practice questions PDF
     */
    async generatePracticeQuestionsPDF(doc, data) {
        // Cover page
        this.addCoverPage(doc, data.content.title, data.content.subtitle);
        
        // Instructions page
        doc.addPage();
        this.addInstructionsPage(doc, data.content);
        
        // Question sections
        data.content.sections.forEach((section, sectionIndex) => {
            doc.addPage();
            this.addQuestionSection(doc, section, sectionIndex + 1);
        });
        
        // Answer key
        doc.addPage();
        this.addAnswerKey(doc, data.content.sections);
        
        this.addFooterPages(doc, data.metadata);
    }

    /**
     * Generate reference guide PDF
     */
    async generateReferenceGuidePDF(doc, data) {
        // Cover page
        this.addCoverPage(doc, data.content.title, data.content.subtitle);
        
        // Content sections
        data.content.sections.forEach((section, index) => {
            if (index > 0) doc.addPage();
            this.addReferenceSection(doc, section);
        });
        
        this.addFooterPages(doc, data.metadata);
    }

    /**
     * Generate checklist PDF
     */
    async generateChecklistPDF(doc, data) {
        // Cover page
        this.addCoverPage(doc, data.content.title, data.content.subtitle);
        
        // Introduction
        doc.addPage();
        this.addChecklistIntroduction(doc, data.content);
        
        // Domain sections
        data.content.domains.forEach((domain, index) => {
            doc.addPage();
            this.addDomainSection(doc, domain);
        });
        
        this.addFooterPages(doc, data.metadata);
    }

    /**
     * Add cover page
     */
    addCoverPage(doc, title, subtitle) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        
        // Background color
        doc.rect(0, 0, pageWidth, pageHeight)
           .fill(this.colors.primary);
        
        // Logo area (if logo exists)
        doc.rect(0, 0, pageWidth, 150)
           .fill(this.colors.secondary);
        
        // Title
        doc.fillColor('white')
           .font(this.fonts.heading)
           .fontSize(36)
           .text(title, 50, 200, {
               width: pageWidth - 100,
               align: 'center'
           });
        
        // Subtitle
        if (subtitle) {
            doc.fontSize(18)
               .text(subtitle, 50, 280, {
                   width: pageWidth - 100,
                   align: 'center'
               });
        }
        
        // Channel branding
        doc.fontSize(14)
           .text('PMP Study Channel', 50, pageHeight - 150, {
               width: pageWidth - 100,
               align: 'center'
           });
        
        // Website
        doc.fontSize(12)
           .text('www.pmpstudychannel.com', 50, pageHeight - 120, {
               width: pageWidth - 100,
               align: 'center'
           });
        
        // Generated date
        doc.fontSize(10)
           .text(`Generated: ${new Date().toLocaleDateString()}`, 50, pageHeight - 80, {
               width: pageWidth - 100,
               align: 'center'
           });
    }

    /**
     * Add table of contents
     */
    addTableOfContents(doc, weeks) {
        doc.fillColor(this.colors.text)
           .font(this.fonts.heading)
           .fontSize(24)
           .text('Table of Contents', 50, 80);
        
        let yPosition = 140;
        
        weeks.forEach((week, index) => {
            doc.font(this.fonts.body)
               .fontSize(12)
               .text(`Week ${week.weekNumber}: ${week.title}`, 70, yPosition)
               .text(`Page ${index + 4}`, 450, yPosition);
            
            yPosition += 25;
            
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 80;
            }
        });
    }

    /**
     * Add introduction
     */
    addIntroduction(doc, content) {
        doc.fillColor(this.colors.text)
           .font(this.fonts.heading)
           .fontSize(24)
           .text('How to Use This Study Calendar', 50, 80);
        
        const introText = `
This 13-week study calendar is designed to help you systematically prepare for the PMP exam. Each week focuses on specific domains and ECO tasks, building your knowledge progressively.

Key Features:
• Daily study objectives aligned with video content
• Practice sessions every Saturday
• Weekly reviews every Sunday
• Milestone tracking for motivation
• ECO task mapping for comprehensive coverage

Follow the daily schedule, watch the corresponding videos, and complete the practice exercises. Consistency is key to PMP success!
        `;
        
        doc.font(this.fonts.body)
           .fontSize(12)
           .text(introText.trim(), 50, 140, {
               width: 500,
               align: 'left',
               lineGap: 5
           });
    }

    /**
     * Add week page
     */
    addWeekPage(doc, week, weekNumber) {
        // Week header
        doc.rect(0, 0, doc.page.width, 80)
           .fill(this.colors.primary);
        
        doc.fillColor('white')
           .font(this.fonts.heading)
           .fontSize(20)
           .text(`Week ${weekNumber}: ${week.title}`, 50, 25);
        
        // Week focus
        doc.fillColor(this.colors.text)
           .font(this.fonts.subheading)
           .fontSize(14)
           .text(`Focus: ${week.focus}`, 50, 100);
        
        // Daily schedule
        let yPosition = 140;
        
        week.days.forEach((day, index) => {
            // Day header
            doc.rect(50, yPosition, 500, 30)
               .fill(this.colors.lightGray);
            
            doc.fillColor(this.colors.text)
               .font(this.fonts.bold)
               .fontSize(12)
               .text(`${day.day} - ${day.type}`, 60, yPosition + 8);
            
            // Day content
            doc.font(this.fonts.body)
               .fontSize(10)
               .text(day.content, 60, yPosition + 35, {
                   width: 480,
                   height: 40
               });
            
            yPosition += 80;
            
            if (yPosition > 650) {
                doc.addPage();
                yPosition = 80;
            }
        });
        
        // Week milestone
        if (week.milestone) {
            doc.rect(50, yPosition + 20, 500, 60)
               .fill(this.colors.accent);
            
            doc.fillColor('white')
               .font(this.fonts.bold)
               .fontSize(12)
               .text('Week Milestone:', 60, yPosition + 35);
            
            doc.font(this.fonts.body)
               .fontSize(10)
               .text(week.milestone, 60, yPosition + 50, {
                   width: 480
               });
        }
    }

    /**
     * Add instructions page
     */
    addInstructionsPage(doc, content) {
        doc.fillColor(this.colors.text)
           .font(this.fonts.heading)
           .fontSize(24)
           .text('Instructions', 50, 80);
        
        const instructions = `
These 50 practice questions represent the most commonly tested concepts on the PMP exam. They are organized by domain according to the current ECO distribution:

• People Domain (42%): 21 questions
• Process Domain (50%): 25 questions  
• Business Environment Domain (8%): 4 questions

How to Use:
1. Answer all questions without looking at the explanations
2. Check your answers using the answer key at the end
3. Review the detailed explanations for any incorrect answers
4. Focus additional study on areas where you scored below 70%

Each question includes:
• The correct answer
• Detailed explanation
• Reference to specific ECO task
• Difficulty level indication

Good luck with your practice!
        `;
        
        doc.font(this.fonts.body)
           .fontSize(12)
           .text(instructions.trim(), 50, 140, {
               width: 500,
               align: 'left',
               lineGap: 5
           });
    }

    /**
     * Add question section
     */
    addQuestionSection(doc, section, sectionNumber) {
        // Section header
        doc.rect(0, 0, doc.page.width, 60)
           .fill(this.colors.secondary);
        
        doc.fillColor('white')
           .font(this.fonts.heading)
           .fontSize(18)
           .text(section.domain, 50, 20);
        
        let yPosition = 100;
        
        section.questions.forEach((question, index) => {
            if (yPosition > 650) {
                doc.addPage();
                yPosition = 80;
            }
            
            // Question number and text
            doc.fillColor(this.colors.text)
               .font(this.fonts.bold)
               .fontSize(12)
               .text(`${question.number}. ${question.question}`, 50, yPosition, {
                   width: 500
               });
            
            yPosition += 40;
            
            // Answer options
            question.options.forEach((option, optionIndex) => {
                doc.font(this.fonts.body)
                   .fontSize(10)
                   .text(option, 70, yPosition);
                yPosition += 20;
            });
            
            yPosition += 20;
        });
    }

    /**
     * Add answer key
     */
    addAnswerKey(doc, sections) {
        doc.fillColor(this.colors.text)
           .font(this.fonts.heading)
           .fontSize(24)
           .text('Answer Key & Explanations', 50, 80);
        
        let yPosition = 140;
        let questionNumber = 1;
        
        sections.forEach((section) => {
            section.questions.forEach((question) => {
                if (yPosition > 650) {
                    doc.addPage();
                    yPosition = 80;
                }
                
                // Question number and answer
                doc.font(this.fonts.bold)
                   .fontSize(11)
                   .text(`${questionNumber}. Correct Answer: ${question.correctAnswer}`, 50, yPosition);
                
                yPosition += 20;
                
                // Explanation
                doc.font(this.fonts.body)
                   .fontSize(9)
                   .text(question.explanation, 50, yPosition, {
                       width: 500,
                       height: 40
                   });
                
                yPosition += 50;
                questionNumber++;
            });
        });
    }

    /**
     * Add reference section
     */
    addReferenceSection(doc, section) {
        // Section title
        doc.fillColor(this.colors.primary)
           .font(this.fonts.heading)
           .fontSize(18)
           .text(section.title, 50, 80);
        
        let yPosition = 120;
        
        section.principles.forEach((principle, index) => {
            // Principle with bullet
            doc.fillColor(this.colors.text)
               .font(this.fonts.body)
               .fontSize(12)
               .text(`• ${principle}`, 70, yPosition, {
                   width: 480
               });
            
            yPosition += 30;
            
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 80;
            }
        });
    }

    /**
     * Add checklist introduction
     */
    addChecklistIntroduction(doc, content) {
        doc.fillColor(this.colors.text)
           .font(this.fonts.heading)
           .fontSize(24)
           .text('ECO Task Checklist', 50, 80);
        
        doc.font(this.fonts.body)
           .fontSize(12)
           .text(content.introduction, 50, 140, {
               width: 500,
               lineGap: 5
           });
    }

    /**
     * Add domain section
     */
    addDomainSection(doc, domain) {
        // Domain header
        doc.rect(0, 0, doc.page.width, 60)
           .fill(domain.color);
        
        doc.fillColor('white')
           .font(this.fonts.heading)
           .fontSize(18)
           .text(domain.name, 50, 20);
        
        let yPosition = 100;
        
        domain.tasks.forEach((task, index) => {
            if (yPosition > 600) {
                doc.addPage();
                yPosition = 80;
            }
            
            // Task header
            doc.fillColor(this.colors.text)
               .font(this.fonts.bold)
               .fontSize(12)
               .text(`${task.id}: ${task.title}`, 50, yPosition);
            
            yPosition += 25;
            
            // Task description
            doc.font(this.fonts.body)
               .fontSize(10)
               .text(task.description, 50, yPosition, {
                   width: 500,
                   height: 30
               });
            
            yPosition += 40;
            
            // Checkboxes
            task.checkboxes.forEach((checkbox, checkIndex) => {
                doc.text('☐', 50, yPosition)
                   .text(checkbox, 70, yPosition);
                yPosition += 20;
            });
            
            yPosition += 20;
        });
    }

    /**
     * Add footer pages
     */
    addFooterPages(doc, metadata) {
        doc.addPage();
        
        // About page
        doc.fillColor(this.colors.text)
           .font(this.fonts.heading)
           .fontSize(20)
           .text('About PMP Study Channel', 50, 80);
        
        const aboutText = `
Thank you for downloading this free resource! 

PMP Study Channel is dedicated to helping project managers achieve PMP certification through:

• Comprehensive 13-week study program
• Daily video lessons aligned with ECO tasks
• Practice questions and real-world scenarios
• Active community support
• Proven study strategies and mindset training

Connect with us:
• YouTube: PMP Study Channel
• Website: www.pmpstudychannel.com
• Email: hello@pmpstudychannel.com

Ready to take your PMP preparation to the next level? Check out our complete study guide and video course for in-depth coverage of all ECO tasks.

Good luck on your PMP journey!
        `;
        
        doc.font(this.fonts.body)
           .fontSize(12)
           .text(aboutText.trim(), 50, 140, {
               width: 500,
               lineGap: 5
           });
        
        // Copyright footer
        doc.fontSize(8)
           .text(`© ${new Date().getFullYear()} PMP Study Channel. All rights reserved.`, 50, 700);
    }

    /**
     * Generate generic PDF for unknown types
     */
    async generateGenericPDF(doc, data) {
        this.addCoverPage(doc, data.title || 'PMP Study Resource', data.subtitle || 'Free Download');
        
        doc.addPage();
        doc.fillColor(this.colors.text)
           .font(this.fonts.body)
           .fontSize(12)
           .text('Content will be added here based on the specific lead magnet type.', 50, 100);
        
        this.addFooterPages(doc, data.metadata || {});
    }
}

module.exports = PDFGenerator;