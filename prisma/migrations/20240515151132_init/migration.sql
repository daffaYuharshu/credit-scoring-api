-- CreateTable
CREATE TABLE "Person" (
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis_kelamin" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "ttl" TEXT NOT NULL,
    "agama" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "kewarganegaraan" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("nik")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "detail" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_nik_key" ON "Person"("nik");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_nik_fkey" FOREIGN KEY ("nik") REFERENCES "Person"("nik") ON DELETE RESTRICT ON UPDATE CASCADE;
