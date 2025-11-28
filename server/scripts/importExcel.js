const XLSX = require('xlsx');
const path = require('path');

// Leggi il file Excel
const excelPath = path.join(__dirname, '../../Contatto (crm.lead).xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Converti in JSON
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log('Excel file read successfully!');
  console.log('Number of rows:', data.length);
  console.log('\nFirst row sample:');
  console.log(JSON.stringify(data[0], null, 2));

  console.log('\nAll column names:');
  if (data.length > 0) {
    console.log(Object.keys(data[0]));
  }

  // Salva in un file JSON per analisi
  const fs = require('fs');
  fs.writeFileSync(
    path.join(__dirname, 'excel_data.json'),
    JSON.stringify(data, null, 2)
  );
  console.log('\nData saved to excel_data.json');

} catch (error) {
  console.error('Error reading Excel file:', error.message);
}
