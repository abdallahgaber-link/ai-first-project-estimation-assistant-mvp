import { Hono } from 'hono';
import { z } from 'zod';
import { ExportService } from '../services/export.service';

// Input validation schema for export requests
const ExportRequestSchema = z.object({
  projectTitle: z.string(),
  estimation: z.object({
    wbs: z.any(),
    modules: z.array(z.any()),
    roles: z.array(z.object({
      role: z.string(),
      effortWeeks: z.number(),
      percentage: z.number(),
    })),
    totals: z.object({
      developmentMDs: z.number(),
      accessibilityMDs: z.number(),
      externalApisMDs: z.number(),
      appStorePublishingMDs: z.number(),
      bugFixingMDs: z.number(),
      totalMDs: z.number(),
    }),
    optimistic: z.number(),
    mostLikely: z.number(),
    pessimistic: z.number(),
    velocity: z.number(),
    bufferUsed: z.number(),
    assumptions: z.array(z.string()),
    risks: z.array(z.string()),
  }),
  format: z.enum(['csv', 'xlsx', 'pdf']),
});

// Create a new router for export endpoints
export const exportHandler = new Hono();

const exportService = new ExportService();

// POST /api/export
exportHandler.post('/', async (c) => {
  try {
    // Validate request body
    const input = await c.req.json();
    const data = ExportRequestSchema.parse(input);

    const { projectTitle, estimation, format } = data;

    if (format === 'csv') {
      const csvContent = await exportService.exportToCsv(projectTitle, estimation);
      
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_estimation.csv"`,
        },
      });
    } else if (format === 'xlsx') {
      const xlsxBuffer = await exportService.exportToXlsx(projectTitle, estimation);
      
      return new Response(new Uint8Array(xlsxBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_estimation.xlsx"`,
        },
      });
    } else if (format === 'pdf') {
      const pdfBuffer = await exportService.exportToPdf(projectTitle, estimation);
      
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${projectTitle.replace(/[^a-zA-Z0-9]/g, '_')}_estimation.pdf"`,
        },
      });
    }

    return c.json({ success: false, error: 'Invalid format' }, 400);
  } catch (error: any) {
    console.error('Export error:', error);
    
    if (error.name === 'ZodError') {
      return c.json(
        { 
          success: false, 
          error: 'Validation Error',
          details: error.errors 
        },
        400
      );
    }
    
    return c.json(
      { 
        success: false, 
        error: 'Failed to export estimation',
        message: error.message 
      },
      500
    );
  }
});
