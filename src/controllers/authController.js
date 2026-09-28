const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { User, Employee } = require("../models");
const { fetchHonoHrEmployee } = require('../services/honoHrEmployeeService');

// =====================================================
// ADMIN LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        username,
        is_active: true,
      },
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Only Admin can use local login
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Employee login is handled through SSO",
      });
    }

    // Check password
    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        employee_id: user.employee_id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // Update last login
    await user.update({
      last_login: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// =====================================================
// EMPLOYEE SSO LOGIN
// =====================================================

const employeeSsoLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Login against company SSO
    const ssoResponse = await axios.post(
      "http://45.114.143.183:83/api/auth/login",
      {
        email,
        password,
      },
      {
        timeout: 10000,
      }
    );

    const ssoData = ssoResponse.data;

    if (!ssoData?.accessToken || !ssoData?.user) {
      return res.status(401).json({
        success: false,
        message: "Invalid SSO response",
      });
    }

    const ssoUser = ssoData.user;

    // HonoHR is the authoritative employee-master source. Do not make an
    // employee's SSO login unavailable when that third-party system is down;
    // SSO data remains the safe fallback and the next login retries the sync.
    let honoEmployee = null;
    try {
      honoEmployee = await fetchHonoHrEmployee(ssoUser.employeeId);
    } catch (error) {
      console.warn('HonoHR profile sync skipped:', error.message);
    }
    const profile = {
      employee_code: honoEmployee?.employee_code || ssoUser.employeeId,
      employee_name: honoEmployee?.employee_name || ssoUser.name,
      department: honoEmployee?.department || ssoUser.departmentName || null,
      designation: honoEmployee?.designation || ssoUser.gradeTitle || null,
      email: honoEmployee?.email || ssoUser.email,
      mobile: honoEmployee?.mobile || ssoUser.mobileNumber || null,
    };

    // =================================================
    // FIND EMPLOYEE IN LOCAL EMPLOYEE MASTER
    // =================================================

    let employee = await Employee.findOne({
      where: {
        employee_code: profile.employee_code,
      },
    });

    // =================================================
    // CREATE EMPLOYEE IF NOT AVAILABLE
    // =================================================

    if (!employee) {
      employee = await Employee.create({
        ...profile,
        status: "ACTIVE",
      });

      console.log(
        "Employee created:",
        employee.employee_code
      );
    } else {
      // Update employee information from SSO
      await employee.update({
        ...profile,
        status: "ACTIVE",
      });
    }

    // =================================================
    // GENERATE LLOYDS APPLICATION JWT
    // =================================================

    const token = jwt.sign(
      {
        id: employee.id,
        employee_id: employee.employee_code,
        email: employee.email,
        role: "EMPLOYEE",
        name: employee.employee_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Employee SSO login successful",

      token,

      user: {
        id: employee.id,
        employeeId: employee.employee_code,
        name: employee.employee_name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        mobile: employee.mobile,
        role: "EMPLOYEE",
      },
    });
  } catch (error) {
    console.error(
      "Employee SSO login error:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Invalid SSO email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to authenticate with company SSO",
    });
  }
};

// =====================================================
// CURRENT ADMIN
// =====================================================

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password_hash"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  login,
  employeeSsoLogin,
  getMe,
};
