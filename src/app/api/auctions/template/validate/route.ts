import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for auction data
const auctionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  freight: z.enum(['Truck Load', 'Less than Truck Load'], {
    required_error: 'Please select a freight type'
  }),
  from: z.string().min(1, 'From location is required'),
  to: z.string().min(1, 'To location is required'),
  vehicle: z.enum(['Urban Cargo', 'Rural Cargo', 'Truck', 'Heavy Truck'], {
    required_error: 'Please select a vehicle type'
  }),
  type: z.enum(['Fleet', 'Third Part'], {
    required_error: 'Please select a type'
  }),
  tracking: z.enum(['Real Time', 'No'], {
    required_error: 'Please select a tracking option'
  }),
  insurance: z.enum(['Yes', 'No'], {
    required_error: 'Please select an insurance option'
  })
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!worksheet) {
      return NextResponse.json({ error: 'Empty workbook' }, { status: 400 });
    }

    // Extract data from specific cells according to template
    const auctionData = {
      freight: worksheet['C3']?.v,
      from: worksheet['C5']?.v,
      to: worksheet['C7']?.v,
      vehicle: worksheet['C9']?.v,
      type: worksheet['C11']?.v,
      tracking: worksheet['C13']?.v,
      insurance: worksheet['C15']?.v,
      description: worksheet['C17']?.v,
    };

    console.log('Extracted data:', auctionData);

    // Check for missing required fields
    const missingFields = Object.entries(auctionData)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: missingFields,
        message: `Please fill in all required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate the extracted data
    try {
      const validatedData = auctionSchema.parse(auctionData);
      return NextResponse.json(validatedData, { status: 200 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorDetails = validationError.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        console.log('Validation errors:', errorDetails);

        return NextResponse.json({
          error: 'Invalid template data',
          details: errorDetails,
          message: 'Please check the values in your template match the required options'
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error processing template:', error);
    return NextResponse.json({
      error: 'Failed to process template',
      message: (error as Error).message
    }, { status: 500 });
  }
}
