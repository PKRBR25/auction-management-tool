import * as XLSX from 'xlsx';
import { z } from 'zod';

// Schema for template data validation
const templateDataSchema = z.object({
  freight: z.string().min(1, 'Freight is required'),
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  vehicle: z.enum(['Urban Cargo', 'Rural Cargo', 'Truck', 'Heavy Truck']),
  type: z.enum(['Fleet', 'Third Part']),
  tracking: z.enum(['Real Time', 'No']),
  insurance: z.enum(['Yes', 'No'])
});

type TemplateData = z.infer<typeof templateDataSchema>;

// Cell mappings as per specifications
const TEMPLATE_MAPPINGS = {
  freight: { row: 2, col: 'C' },
  from: { row: 3, col: 'C' },
  to: { row: 4, col: 'C' },
  vehicle: { row: 6, col: 'C' },
  type: { row: 7, col: 'C' },
  tracking: { row: 8, col: 'C' },
  insurance: { row: 9, col: 'C' }
};

export function Templateextractdata(fileBuffer: Buffer): TemplateData {
  // Read the Excel file
  const workbook = XLSX.read(fileBuffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Extract data from specific cells
  const data: Partial<TemplateData> = {};
  
  for (const [key, location] of Object.entries(TEMPLATE_MAPPINGS)) {
    const cellAddress = `${location.col}${location.row}`;
    const cell = worksheet[cellAddress];
    data[key as keyof TemplateData] = cell?.v?.toString() || '';
  }
  
  return data as TemplateData;
}

export function Templatevalidationdata(data: TemplateData): { valid: boolean; errors: string[] } {
  try {
    templateDataSchema.parse(data);
    return { valid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error occurred']
    };
  }
}

export async function UploadValidations(fileBuffer: Buffer): Promise<{ valid: boolean; errors: string[] }> {
  try {
    // First extract data from template
    const data = Templateextractdata(fileBuffer);
    
    // Then validate the extracted data
    const validation = Templatevalidationdata(data);
    
    return validation;
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to process template file']
    };
  }
}
