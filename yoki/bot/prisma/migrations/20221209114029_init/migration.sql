/*
  Warnings:

  - A unique constraint covering the columns `[serverId,domain,subdomain,route]` on the table `UrlFilter` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `route` to the `UrlFilter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subdomain` to the `UrlFilter` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UrlFilter_serverId_domain_key";

-- AlterTable
ALTER TABLE "UrlFilter" ADD COLUMN     "route" VARCHAR(200) NOT NULL,
ADD COLUMN     "subdomain" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UrlFilter_serverId_domain_subdomain_route_key" ON "UrlFilter"("serverId", "domain", "subdomain", "route");
