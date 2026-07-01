const multer = require('multer');

const storage = multer.memoryStorage();

const excelFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx or .xls files are allowed'), false);
  }
};

const uploadExcel = multer({ storage, fileFilter: excelFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = uploadExcel;
