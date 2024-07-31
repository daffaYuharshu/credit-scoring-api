const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Encrypt the password
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  // Insert a new user
  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      password: hashedPassword,
    },
  });

  console.log("User created with email admin and password superadmin");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
