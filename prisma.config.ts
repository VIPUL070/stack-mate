import { definePrismaConfig } from "prisma/config";
import "dotenv/config";

export default definePrismaConfig({
  skills: {
    agents: ["agents"],
  },
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "",
  },
});