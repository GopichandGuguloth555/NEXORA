import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from "@prisma/adapter-pg";
console.log(PrismaPg.toString());
