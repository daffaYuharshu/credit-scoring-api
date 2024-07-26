const prisma = require("../database/prisma");

const createReport = async (
  createdAt,
  finishedAt,
  kendalaProses,
  status,
  pdf,
  skor,
  skorFR,
  skorOCR,
  skorASID,
  nik,
  idPermintaan
) => {
  const newReport = await prisma.report.create({
    data: {
      created_at: createdAt,
      finished_at: finishedAt,
      kendala_proses: kendalaProses || null,
      status: status || null,
      pdf: pdf || null,
      skor: skor,
      skor_fr: skorFR,
      skor_ocr: skorOCR,
      skor_asid: skorASID,
      nik: nik,
      id_permintaan: idPermintaan,
    },
  });

  return newReport;
};

const findAllReport = async (size, skip) => {
  const reports = await prisma.report.findMany({
    take: size,
    skip: skip,
  });
  return reports;
};

const findReportById = async (id) => {
  const report = await prisma.report.findUnique({
    where: {
      id: id,
    },
  });
  return report;
};

const findAllReportByReqId = async (size, skip, reqId) => {
  const reports = await prisma.report.findMany({
    where: {
      id_permintaan: reqId,
    },
    take: size,
    skip: skip,
  });
  return reports;
};

const findAllReportByNIK = async (size, skip, nik) => {
  const reports = await prisma.report.findMany({
    where: {
      nik: nik,
    },
    take: size,
    skip: skip,
  });
  return reports;
};

const findAllReportByReqIdAndNIK = async (size, skip, reqId, nik) => {
  const reports = await prisma.report.findMany({
    where: {
      id_permintaan: reqId,
      nik: nik,
    },
    take: size,
    skip: skip,
  });
  return reports;
};

const countReport = async () => {
  const count = await prisma.report.count();
  return count;
};

const countReportByReqId = async (reqId) => {
  const count = await prisma.report.count({
    where: {
      id_permintaan: reqId,
    },
  });
  return count;
};

const countReportByNIK = async (nik) => {
  const count = await prisma.report.count({
    where: {
      nik: nik,
    },
  });
  return count;
};

const countReportByReqIdAndNIK = async (reqId, nik) => {
  const count = await prisma.report.count({
    where: {
      id_permintaan: reqId,
      nik: nik,
    },
  });
  return count;
};

const insertReportReqIdByIdReport = async (id, idPermintaan) => {
  await prisma.report.update({
    where: {
      id: id,
    },
    data: {
      id_permintaan: idPermintaan,
    },
  });
};

const insertReportPDFById = async (id, pdfPath) => {
  await prisma.report.update({
    where: {
      id: id,
    },
    data: {
      pdf: pdfPath,
    },
  });
};

const findReportByIdJoinPersonAndRequest = async (id) => {
  const report = await prisma.report.findUnique({
    where: { id: id },
    select: {
      id: true,
      skor: true,
      skor_fr: true,
      person: {
        select: {
          nik: true,
          nama: true,
          alamat: true,
          tempat_lahir: true,
          tanggal_lahir: true,
          jenis_kelamin: true,
          agama: true,
          status: true,
          pekerjaan: true,
          kewarganegaraan: true,
          url_image_ktp: true,
          url_image_selfie: true,
        },
      },
      request: {
        select: {
          jenis_permintaan: true,
        },
      },
    },
  });
  return report;
};

module.exports = {
  createReport,
  findAllReportByReqId,
  insertReportReqIdByIdReport,
  findAllReport,
  countReport,
  findAllReportByNIK,
  countReportByNIK,
  countReportByReqId,
  findAllReportByReqIdAndNIK,
  countReportByReqIdAndNIK,
  findReportById,
  insertReportPDFById,
  findReportByIdJoinPersonAndRequest,
};
