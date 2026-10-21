const axios = require('axios');

const HONO_EMPLOYEE_URL = process.env.HONO_EMPLOYEE_API_URL
  || 'https://lloyds.honohr.com/sapi/Fetch_employees/getAllEmployeeInfo';

const normalizeKey = (key) => String(key).replace(/[^a-z0-9]/gi, '').toLowerCase();

const read = (record, keys) => {
  const aliases = new Set(keys.map(normalizeKey));
  for (const [key, value] of Object.entries(record || {})) {
    if (aliases.has(normalizeKey(key)) && value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return null;
};

const collectRecords = (value, records = []) => {
  if (Array.isArray(value)) value.forEach((item) => collectRecords(item, records));
  else if (value && typeof value === 'object') {
    records.push(value);
    Object.values(value).forEach((item) => {
      if (item && typeof item === 'object') collectRecords(item, records);
    });
  }
  return records;
};

const normalizeEmployee = (response, employeeCode) => {
  const expected = String(employeeCode).trim().toLowerCase();
  const record = collectRecords(response).find((item) => {
    const code = read(item, ['employee_id', 'employeeId', 'employee_code', 'emp_code', 'empcode', 'emp_id', 'empid', 'EmployeeCode']);
    return code?.toLowerCase() === expected;
  });
  if (!record) return null;

  return {
    employee_code: read(record, ['employee_id', 'employeeId', 'employee_code', 'emp_code', 'empcode', 'emp_id', 'empid', 'EmployeeCode']),
    employee_name: read(record, ['employee_name', 'employeeName', 'name', 'full_name', 'emp_name', 'EmployeeName', 'empname']),
    department: read(record, ['department', 'department_name', 'departmentName', 'dept_name', 'dept', 'Department']),
    designation: read(record, ['designation', 'designation_name', 'designationName', 'grade_title', 'gradeTitle', 'designationname']),
    email: read(record, ['email', 'email_id', 'official_email', 'Email', 'emailaddress']),
    mobile: read(record, ['mobile', 'mobile_number', 'mobileNumber', 'phone', 'Mobile', 'mobileno']),
  };
};

async function fetchHonoHrEmployee(employeeCode) {
  if (!process.env.HONO_HR_TOKEN || !process.env.HONO_HR_COMPCODE) {
    throw new Error('HonoHR employee API is not configured');
  }

  const request = async (end) => axios.get(HONO_EMPLOYEE_URL, {
    headers: { token: process.env.HONO_HR_TOKEN, compcode: process.env.HONO_HR_COMPCODE },
    params: { start: 0, end, employee_id: employeeCode, status: '01' },
    timeout: 30000,
  });
  const validateResponse = (response) => {
    if (String(response.data?.status || '').toLowerCase() !== 'fail') return;
    const error = new Error(response.data?.message || 'HonoHR rejected the employee lookup');
    error.code = /token.*(invalid|valid|expired)/i.test(error.message)
      ? 'HONO_HR_TOKEN_INVALID'
      : 'HONO_HR_LOOKUP_REJECTED';
    throw error;
  };

  // Preferred route: the documented employee_id filter. It avoids loading the
  // entire HonoHR directory for every special booking.
  const firstResponse = await request(10);
  validateResponse(firstResponse);
  let employee = normalizeEmployee(firstResponse.data, employeeCode);
  if (employee) return employee;

  // Some HonoHR deployments ignore employee_id. Fall back to the documented
  // full range only when the filtered response does not contain a match.
  const fullResponse = await request(Number(process.env.HONO_HR_PAGE_SIZE || 6000));
  validateResponse(fullResponse);
  employee = normalizeEmployee(fullResponse.data, employeeCode);
  return employee;
}

module.exports = { fetchHonoHrEmployee };
