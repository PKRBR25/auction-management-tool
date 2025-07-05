import * as XLSX from 'xlsx';

export function generateAuctionTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  // Create Auction Template worksheet
  const ws = XLSX.utils.aoa_to_sheet([[]]);

  // Helper function to create a cell with style
  const createCell = (value: string, style: any = {}) => ({
    v: value,
    t: 's',
    s: {
      font: { bold: false, color: { rgb: '000000' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      fill: { fgColor: { rgb: 'FFFFFF' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      },
      ...style
    }
  });

  // Cell styles
  const styles = {
    title: {
      font: { bold: true, sz: 14, color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'E0E0E0' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    header: {
      font: { bold: true, color: { rgb: '000000' } },
      fill: { fgColor: { rgb: 'F0F0F0' } }
    },
    input: {
      fill: { fgColor: { rgb: 'FFFFFF' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    }
  };

  // Set title
  ws['A1'] = createCell('Auction Template', styles.title);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

  // Freight
  ws['A3'] = createCell('Freight *', styles.header);
  ws['B3'] = createCell('Options: Truck Load, Less than Truck Load');
  ws['C3'] = createCell('', styles.input);

  // From Location
  ws['A5'] = createCell('From Location *', styles.header);
  ws['B5'] = createCell('Enter the pickup location (city, state)');
  ws['C5'] = createCell('', styles.input);

  // To Location
  ws['A7'] = createCell('To Location *', styles.header);
  ws['B7'] = createCell('Enter the delivery location (city, state)');
  ws['C7'] = createCell('', styles.input);

  // Vehicle Type
  ws['A9'] = createCell('Vehicle Type *', styles.header);
  ws['B9'] = createCell('Options: Urban Cargo, Rural Cargo, Truck, Heavy Truck');
  ws['C9'] = createCell('', styles.input);

  // Service Type
  ws['A11'] = createCell('Service Type *', styles.header);
  ws['B11'] = createCell('Options: Fleet, Third Part');
  ws['C11'] = createCell('', styles.input);

  // Tracking
  ws['A13'] = createCell('Tracking Service *', styles.header);
  ws['B13'] = createCell('Options: Real Time, No');
  ws['C13'] = createCell('', styles.input);

  // Insurance
  ws['A15'] = createCell('Insurance *', styles.header);
  ws['B15'] = createCell('Options: Yes, No');
  ws['C15'] = createCell('', styles.input);

  // Description
  ws['A17'] = createCell('Auction Description *', styles.header);
  ws['B17'] = createCell('Provide detailed information about the auction requirements');
  ws['C17'] = createCell('', styles.input);

  // Note
  ws['A19'] = createCell('Note: Fields marked with * are required', {
    font: { italic: true, color: { rgb: '666666' } }
  });

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Column A - Field names
    { wch: 50 }, // Column B - Descriptions
    { wch: 30 }  // Column C - Input fields
  ];

  // Add data validation
  const validations = {
    'C3': { // Freight
      values: ['Truck Load', 'Less than Truck Load'],
      errorMessage: 'Please select either Truck Load or Less than Truck Load'
    },
    'C9': { // Vehicle
      values: ['Urban Cargo', 'Rural Cargo', 'Truck', 'Heavy Truck'],
      errorMessage: 'Please select a valid vehicle type'
    },
    'C11': { // Service Type
      values: ['Fleet', 'Third Part'],
      errorMessage: 'Please select either Fleet or Third Part'
    },
    'C13': { // Tracking
      values: ['Real Time', 'No'],
      errorMessage: 'Please select either Real Time or No'
    },
    'C15': { // Insurance
      values: ['Yes', 'No'],
      errorMessage: 'Please select either Yes or No'
    }
  };

  // Add data validation for each field
  Object.entries(validations).forEach(([cell, { values, errorMessage }]) => {
    ws[cell].v = ''; // Ensure cell is empty
    ws[cell].l = { // Add dropdown list
      ref: cell,
      t: 'list',
      v: values.join(','),
      e: errorMessage
    };
  });

  // Add cell protection
  ws['!protect'] = {
    selectLockedCells: true,
    selectUnlockedCells: true,
    password: '',
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false
  };

  // Lock all cells except input cells
  Object.keys(ws).forEach(cell => {
    if (typeof cell === 'string' && !cell.startsWith('!')) {
      if (!cell.startsWith('C') || cell === 'C1') {
        ws[cell].s = { ...ws[cell].s, locked: true };
      } else {
        ws[cell].s = { ...ws[cell].s, locked: false };
      }
    }
  });

  // Styling
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'CCCCCC' } } };
  const descriptionStyle = { font: { italic: true }, fill: { fgColor: { rgb: 'F2F2F2' } } };
  const inputCellStyle = { fill: { fgColor: { rgb: 'FFFFFF' } }, border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } };

  // Apply styles
  ['A1', 'A2', 'A4', 'A5', 'A6', 'A8', 'A10', 'A12', 'A14'].forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  ['B2', 'B4', 'B5', 'B6', 'B8', 'B10', 'B12', 'B14'].forEach(cell => {
    if (ws[cell]) ws[cell].s = descriptionStyle;
  });

  ['C2', 'C4', 'C5', 'C6', 'C8', 'C10', 'C12', 'C14'].forEach(cell => {
    if (ws[cell]) ws[cell].s = inputCellStyle;
  });

  // Add the template worksheet
  XLSX.utils.book_append_sheet(wb, ws, 'Auction Template');

  // Create Instructions worksheet
  const instructionsWs = XLSX.utils.aoa_to_sheet([
    ['Instructions for Filling the Auction Template'],
    [''],
    ['1. General Guidelines:'],
    ['   - Fields marked with * are mandatory'],
    ['   - Use the dropdown menus where available'],
    ['   - Do not modify the template structure'],
    [''],
    ['2. Field Descriptions:'],
    ['   Freight:', '   Choose between Truck Load or Less than Truck Load based on your cargo volume'],
    ['   From Location:', '   Specify the complete pickup address'],
    ['   To Location:', '   Specify the complete delivery address'],
    ['   Vehicle Type:', '   Select the appropriate vehicle based on cargo size and route type'],
    ['   Service Type:', '   Choose Fleet for company vehicles or Third Part for external services'],
    ['   Tracking:', '   Select if you need real-time tracking of the shipment'],
    ['   Insurance:', '   Indicate if cargo insurance is required'],
    ['   Description:', '   Provide any additional details, requirements, or special instructions'],
    [''],
    ['3. Important Notes:'],
    ['   - Ensure all locations are clearly specified'],
    ['   - Vehicle selection should match cargo requirements'],
    ['   - Insurance selection should comply with cargo value and type'],
    ['   - Description should include any special handling instructions'],
    [''],
    ['4. After Filling:'],
    ['   - Review all entries for accuracy'],
    ['   - Save the file'],
    ['   - Upload through the auction creation page'],
    ['   - System will validate all entries before proceeding']
  ]);

  // Style instructions worksheet
  instructionsWs['!cols'] = [{ wch: 25 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');

  // Generate buffer
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
