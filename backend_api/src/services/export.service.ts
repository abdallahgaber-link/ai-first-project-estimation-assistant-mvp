import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface EstimationData {
  wbs?: any;
  modules: any[];
  roles: Array<{
    role: string;
    effortWeeks: number;
    percentage: number;
  }>;
  totals: {
    developmentMDs: number;
    accessibilityMDs: number;
    externalApisMDs: number;
    appStorePublishingMDs: number;
    bugFixingMDs: number;
    totalMDs: number;
  };
  optimistic: number;
  mostLikely: number;
  pessimistic: number;
  velocity: number;
  bufferUsed: number;
  assumptions: string[];
  risks: string[];
}

export class ExportService {
  public async exportToCsv(projectTitle: string, estimation: EstimationData): Promise<string> {
    let csv = `Project Estimation Report\n`;
    csv += `Project: ${projectTitle}\n`;
    csv += `Generated: ${format(new Date(), 'PPP')}\n\n`;
    
    // Summary section
    csv += 'SUMMARY\n';
    csv += 'Timeline,Optimistic,Most Likely,Pessimistic\n';
    csv += `Weeks,${estimation.optimistic.toFixed(1)},${estimation.mostLikely.toFixed(1)},${estimation.pessimistic.toFixed(1)}\n\n`;
    
    // Roles breakdown
    csv += 'ROLES BREAKDOWN\n';
    csv += 'Role,Effort (weeks),Percentage\n';
    estimation.roles.forEach(role => {
      csv += `${role.role},${role.effortWeeks.toFixed(1)},${role.percentage.toFixed(1)}%\n`;
    });
    csv += '\n';
    
    // Modules breakdown
    csv += 'MODULES BREAKDOWN\n';
    csv += 'Module,Complexity,Base Points,Total Points,Weeks,Role,Notes\n';
    estimation.modules.forEach(module => {
      csv += `"${module.name}",${module.complexity},${module.basePoints},${module.totalPoints},${module.weeks.toFixed(1)},${module.role},"${module.notes || ''}"\n`;
    });
    csv += '\n';
    
    // Project totals
    csv += 'PROJECT TOTALS (Man-Days)\n';
    csv += 'Category,Man-Days\n';
    csv += `Development,${estimation.totals.developmentMDs.toFixed(1)}\n`;
    csv += `Accessibility,${estimation.totals.accessibilityMDs.toFixed(1)}\n`;
    csv += `External APIs,${estimation.totals.externalApisMDs.toFixed(1)}\n`;
    csv += `App Store Publishing,${estimation.totals.appStorePublishingMDs.toFixed(1)}\n`;
    csv += `Bug Fixing,${estimation.totals.bugFixingMDs.toFixed(1)}\n`;
    csv += `Total,${estimation.totals.totalMDs.toFixed(1)}\n\n`;
    
    // Assumptions
    if (estimation.assumptions.length > 0) {
      csv += 'ASSUMPTIONS\n';
      estimation.assumptions.forEach((assumption, index) => {
        csv += `${index + 1},"${assumption}"\n`;
      });
      csv += '\n';
    }
    
    // Risks
    if (estimation.risks.length > 0) {
      csv += 'RISKS\n';
      estimation.risks.forEach((risk, index) => {
        csv += `${index + 1},"${risk}"\n`;
      });
    }
    
    return csv;
  }
  
  public async exportToXlsx(projectTitle: string, estimation: EstimationData): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Project Estimation Report'],
      ['Project:', projectTitle],
      ['Generated:', format(new Date(), 'PPP')],
      [],
      ['TIMELINE ESTIMATES'],
      ['Type', 'Weeks'],
      ['Optimistic', estimation.optimistic.toFixed(1)],
      ['Most Likely', estimation.mostLikely.toFixed(1)],
      ['Pessimistic', estimation.pessimistic.toFixed(1)],
      [],
      ['PROJECT TOTALS'],
      ['Category', 'Man-Days'],
      ['Development', estimation.totals.developmentMDs.toFixed(1)],
      ['Accessibility', estimation.totals.accessibilityMDs.toFixed(1)],
      ['External APIs', estimation.totals.externalApisMDs.toFixed(1)],
      ['App Store Publishing', estimation.totals.appStorePublishingMDs.toFixed(1)],
      ['Bug Fixing', estimation.totals.bugFixingMDs.toFixed(1)],
      ['Total', estimation.totals.totalMDs.toFixed(1)]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Roles sheet
    const rolesData = [
      ['Role', 'Effort (weeks)', 'Percentage'],
      ...estimation.roles.map(role => [
        role.role,
        role.effortWeeks.toFixed(1),
        role.percentage.toFixed(1) + '%'
      ])
    ];
    
    const rolesSheet = XLSX.utils.aoa_to_sheet(rolesData);
    XLSX.utils.book_append_sheet(workbook, rolesSheet, 'Roles');
    
    // Modules sheet
    const modulesData = [
      ['Module', 'Complexity', 'Base Points', 'Total Points', 'Weeks', 'Role', 'Notes'],
      ...estimation.modules.map(module => [
        module.name,
        module.complexity,
        module.basePoints,
        module.totalPoints,
        module.weeks.toFixed(1),
        module.role,
        module.notes || ''
      ])
    ];
    
    const modulesSheet = XLSX.utils.aoa_to_sheet(modulesData);
    XLSX.utils.book_append_sheet(workbook, modulesSheet, 'Modules');
    
    // Assumptions sheet
    if (estimation.assumptions.length > 0) {
      const assumptionsData = [
        ['#', 'Assumption'],
        ...estimation.assumptions.map((assumption, index) => [
          index + 1,
          assumption
        ])
      ];
      
      const assumptionsSheet = XLSX.utils.aoa_to_sheet(assumptionsData);
      XLSX.utils.book_append_sheet(workbook, assumptionsSheet, 'Assumptions');
    }
    
    // Risks sheet
    if (estimation.risks.length > 0) {
      const risksData = [
        ['#', 'Risk'],
        ...estimation.risks.map((risk, index) => [
          index + 1,
          risk
        ])
      ];
      
      const risksSheet = XLSX.utils.aoa_to_sheet(risksData);
      XLSX.utils.book_append_sheet(workbook, risksSheet, 'Risks');
    }
    
    const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return xlsxBuffer;
  }
  
  public async exportToPdf(projectTitle: string, estimation: EstimationData): Promise<Buffer> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();
    const margin = 50;
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Helper function to sanitize text for PDF encoding
    const sanitizeText = (text: string): string => {
      return text
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/•/g, '-') // Replace bullet points with dashes
        .replace(/◦/g, '*') // Replace hollow bullets with asterisks
        .replace(/–/g, '-') // Replace en-dash with hyphen
        .replace(/—/g, '-') // Replace em-dash with hyphen
        .replace(/'/g, "'") // Replace smart quotes
        .replace(/'/g, "'")
        .replace(/"/g, '"')
        .replace(/"/g, '"')
        .replace(/…/g, '...')
        .trim();
    };
    
    // Helper function to add text with word wrap
    const addText = (text: string, x: number, y: number, size: number, bold = false, color = rgb(0, 0, 0), maxWidth?: number) => {
      const sanitizedText = sanitizeText(text);
      const currentFont = bold ? fontBold : font;
      
      if (maxWidth) {
        const lines = [];
        let currentLine = '';
        
        for (const word of sanitizedText.split(' ')) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = currentFont.widthOfTextAtSize(testLine, size);
          
          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        lines.forEach((line, i) => {
          page.drawText(line, {
            x,
            y: y - (i * (size * 1.2)),
            size,
            font: currentFont,
            color,
          });
        });
        
        return y - (lines.length * size * 1.2);
      } else {
        page.drawText(sanitizedText, { x, y, size, font: currentFont, color });
        return y - (size * 1.2);
      }
    };
    
    // Draw header
    let y = height - margin;
    y = addText('Project Estimation Report', margin, y, 20, true);
    y -= 10;
    
    // Project info
    y = addText(`Project: ${projectTitle}`, margin, y, 12);
    y = addText(`Date: ${format(new Date(), 'PPP')}`, margin, y, 12);
    y -= 20;
    
    // Summary section
    y = addText('Summary', margin, y, 16, true);
    y -= 10;
    
    // Timeline estimates
    y = addText('Timeline Estimates:', margin, y, 12, true);
    y = addText(`- Optimistic: ${estimation.optimistic.toFixed(1)} weeks`, margin + 10, y, 12);
    y = addText(`- Most Likely: ${estimation.mostLikely.toFixed(1)} weeks`, margin + 10, y, 12);
    y = addText(`- Pessimistic: ${estimation.pessimistic.toFixed(1)} weeks`, margin + 10, y, 12);
    y -= 10;
    
    // Effort breakdown
    y = addText('Effort Breakdown:', margin, y, 12, true);
    y = addText(`- Total Man-Days: ${estimation.totals.totalMDs.toFixed(1)}`, margin + 10, y, 12);
    y = addText('- Roles:', margin + 10, y, 12);
    
    estimation.roles.forEach(role => {
      y = addText(`  * ${role.role}: ${role.effortWeeks.toFixed(1)} weeks (${role.percentage.toFixed(1)}%)`, margin + 20, y, 12);
    });
    
    y -= 20;
    
    // Modules breakdown
    y = addText('Modules Breakdown:', margin, y, 14, true);
    y -= 10;
    
    estimation.modules.forEach(module => {
      y = addText(
        `- ${module.name} (${module.complexity}): ${module.totalPoints} points, ${module.weeks.toFixed(1)} weeks - ${module.role}`,
        margin,
        y,
        10
      );
      
      // Add new page if needed
      if (y < margin + 100) {
        pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;
        y = addText('Modules Breakdown (continued):', margin, y, 14, true);
        y -= 10;
      }
    });
    
    y -= 20;
    
    // Add assumptions if there's space
    if (estimation.assumptions.length > 0 && y > margin + 100) {
      y = addText('Assumptions:', margin, y, 12, true);
      
      for (const assumption of estimation.assumptions.slice(0, 5)) {
        y = addText(`- ${assumption}`, margin + 10, y, 10, false, rgb(0.3, 0.3, 0.3), width - (margin * 2));
        y -= 5;
        
        if (y < margin + 50) break;
      }
      
      y -= 10;
    }
    
    // Add footer
    const footerY = 30;
    page.drawLine({
      start: { x: margin, y: footerY + 15 },
      end: { x: width - margin, y: footerY + 15 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    addText('Generated by Project Estimation Assistant', margin, footerY, 8, false, rgb(0.5, 0.5, 0.5));
    addText(`Page 1 of ${pdfDoc.getPageCount()}`, width - margin - 50, footerY, 8, false, rgb(0.5, 0.5, 0.5));
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

