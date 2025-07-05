import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { Templateextractdata, Templatevalidationdata, UploadValidations } from '@/lib/auction/template';

describe('Template Processing Functions', () => {
  // Helper function to create a test Excel file buffer
  function createTestWorkbook(data: Record<string, string>) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[]]);
    
    // Add data to specific cells as per template specification
    ws['C2'] = { v: data.freight || '' };
    ws['C3'] = { v: data.from || '' };
    ws['C4'] = { v: data.to || '' };
    ws['C6'] = { v: data.vehicle || '' };
    ws['C7'] = { v: data.type || '' };
    ws['C8'] = { v: data.tracking || '' };
    ws['C9'] = { v: data.insurance || '' };

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  describe('Templateextractdata', () => {
    it('should extract data from correct cells', () => {
      const testData = {
        freight: 'Test Freight',
        from: 'Origin City',
        to: 'Destination City',
        vehicle: 'Urban Cargo',
        type: 'Fleet',
        tracking: 'Real Time',
        insurance: 'Yes'
      };

      const buffer = createTestWorkbook(testData);
      const result = Templateextractdata(buffer);

      expect(result).toEqual(testData);
    });

    it('should handle empty cells', () => {
      const buffer = createTestWorkbook({});
      const result = Templateextractdata(buffer);

      expect(result).toEqual({
        freight: '',
        from: '',
        to: '',
        vehicle: '',
        type: '',
        tracking: '',
        insurance: ''
      });
    });
  });

  describe('Templatevalidationdata', () => {
    it('should validate correct data', () => {
      const validData = {
        freight: 'Test Freight',
        from: 'Origin City',
        to: 'Destination City',
        vehicle: 'Urban Cargo',
        type: 'Fleet',
        tracking: 'Real Time',
        insurance: 'Yes'
      };

      const result = Templatevalidationdata(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid vehicle type', () => {
      const invalidData = {
        freight: 'Test Freight',
        from: 'Origin City',
        to: 'Destination City',
        vehicle: 'Invalid Vehicle',
        type: 'Fleet',
        tracking: 'Real Time',
        insurance: 'Yes'
      };

      const result = Templatevalidationdata(invalidData as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('vehicle: Invalid enum value');
    });

    it('should validate all required fields', () => {
      const invalidData = {
        freight: '',
        from: '',
        to: '',
        vehicle: 'Urban Cargo',
        type: 'Fleet',
        tracking: 'Real Time',
        insurance: 'Yes'
      };

      const result = Templatevalidationdata(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3); // freight, from, to are required
    });
  });

  describe('UploadValidations', () => {
    it('should validate correct template data', async () => {
      const testData = {
        freight: 'Test Freight',
        from: 'Origin City',
        to: 'Destination City',
        vehicle: 'Urban Cargo',
        type: 'Fleet',
        tracking: 'Real Time',
        insurance: 'Yes'
      };

      const buffer = createTestWorkbook(testData);
      const result = await UploadValidations(buffer);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid template data', async () => {
      const invalidData = {
        freight: 'Test Freight',
        from: 'Origin City',
        to: 'Destination City',
        vehicle: 'Invalid Vehicle', // Invalid value
        type: 'Invalid Type', // Invalid value
        tracking: 'Invalid Tracking', // Invalid value
        insurance: 'Invalid Insurance' // Invalid value
      };

      const buffer = createTestWorkbook(invalidData);
      const result = await UploadValidations(buffer);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle corrupted file', async () => {
      const buffer = Buffer.from('invalid file content');
      const result = await UploadValidations(buffer);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Failed to process template file');
    });
  });
});
