-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('LOFT_CONVERSION', 'EXTENSION', 'REFURBISHMENT', 'ROOFING', 'GROUNDWORKS', 'OTHER');

-- CreateEnum
CREATE TYPE "FinishLevel" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'QUOTED', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "SavedResultStatus" AS ENUM ('DRAFT', 'FINAL', 'SENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectType" "ProjectType" NOT NULL,
    "description" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "addressLine" TEXT,
    "city" TEXT DEFAULT 'London',
    "postcode" TEXT,
    "areaSqm" DOUBLE PRECISION,
    "finishLevel" "FinishLevel" NOT NULL DEFAULT 'STANDARD',
    "inputs" JSONB,
    "estimateMin" DOUBLE PRECISION,
    "estimateMax" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" "SimulationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "breakdown" JSONB,
    "notes" TEXT,
    "status" "SavedResultStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "simulations_userId_idx" ON "simulations"("userId");

-- CreateIndex
CREATE INDEX "simulations_status_idx" ON "simulations"("status");

-- CreateIndex
CREATE INDEX "saved_results_userId_idx" ON "saved_results"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_results_simulationId_version_key" ON "saved_results"("simulationId", "version");

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_results" ADD CONSTRAINT "saved_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_results" ADD CONSTRAINT "saved_results_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

