const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Encrypt the password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  // Insert or update the user with the new role
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      password: hashedPassword,
      role: "admin", // Update the role
    },
    create: {
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin", // Set the role for the new user
    },
  });

  console.log("User created or updated with email admin and role admin");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
