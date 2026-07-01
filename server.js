require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const regularizationRoutes = require('./routes/regularizationRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/generated', express.static('generated')); // serves generated payslip PDFs

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/regularizations', regularizationRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => res.json({ message: 'HR Attendance & Management API is running' }));

// Global error handler (catches anything not handled in controllers)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
