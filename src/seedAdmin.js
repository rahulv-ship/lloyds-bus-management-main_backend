const bcrypt = require("bcryptjs");

const {
  connectDatabase,
} = require("./config/database");

const {
  User,
} = require("./models");

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const passwordHash = await bcrypt.hash(
      "Admin@123",
      12
    );

    const [admin, created] =
      await User.findOrCreate({
        where: {
          username: "superadmin",
        },

        defaults: {
          employee_id: null,
          username: "superadmin",
          password_hash: passwordHash,
          role: "ADMIN",
          is_active: true,
        },
      });

    console.log(
      created
        ? "✅ Super Admin created successfully"
        : "ℹ️ Super Admin already exists"
    );

    console.log("--------------------------------");
    console.log("Username : superadmin");
    console.log("Password : Admin@123");
    console.log("Role     : ADMIN");
    console.log("--------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seed failed:");
    console.error(error);

    process.exit(1);
  }
};

seedAdmin();