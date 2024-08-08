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
  idPerson,
  userId,
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
      id_person: idPerson,
      id_permintaan: idPermintaan,
      owner: userId,
    },
  });

  return newReport;
};

const findAllReportByOwner = async (owner, size, skip) => {
  const reports = await prisma.report.findMany({
    where: {
      owner: owner,
    },
    take: size,
    skip: skip,
    include: {
      person: {
        select: {
          nik: true,
          nama: true,
        },
      },
      request: {
        select: {
          jenis_permintaan: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
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

const findAllReportByOwnerAndReqId = async (owner, size, skip, reqId) => {
  const reports = await prisma.report.findMany({
    where: {
      owner: owner,
      id_permintaan: reqId,
    },
    take: size,
    skip: skip,
    include: {
      person: {
        select: {
          nik: true,
          nama: true,
        },
      },
      request: {
        select: {
          jenis_permintaan: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return reports;
};

const findAllReportByOwnerAndNIK = async (owner, size, skip, nik) => {
  const reports = await prisma.report.findMany({
    where: {
      owner: owner,
      person: {
        nik: nik,
      },
    },
    take: size,
    skip: skip,
    include: {
      person: {
        select: {
          nik: true,
          nama: true,
        },
      },
      request: {
        select: {
          jenis_permintaan: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return reports;
};

const findAllReportByOwnerReqIdAndNIK = async (
  owner,
  size,
  skip,
  reqId,
  nik
) => {
  const reports = await prisma.report.findMany({
    where: {
      owner: owner,
      id_permintaan: reqId,
      person: {
        nik: nik,
      },
    },
    take: size,
    skip: skip,
    include: {
      person: {
        select: {
          nik: true,
          nama: true,
        },
      },
      request: {
        select: {
          jenis_permintaan: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return reports;
};

const countReportByOwner = async (owner) => {
  const count = await prisma.report.count({
    where: {
      owner: owner,
    },
  });
  return count;
};

const countReportByOwnerAndReqId = async (owner, reqId) => {
  const count = await prisma.report.count({
    where: {
      owner: owner,
      id_permintaan: reqId,
    },
  });
  return count;
};

const countReportByOwnerAndNIK = async (owner, nik) => {
  const count = await prisma.report.count({
    where: {
      owner: owner,
      person: {
        nik: nik,
      },
    },
  });
  return count;
};

const countReportByOwnerReqIdAndNIK = async (owner, reqId, nik) => {
  const count = await prisma.report.count({
    where: {
      owner: owner,
      id_permintaan: reqId,
      person: {
        nik: nik,
      },
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
      owner: true,
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
  findAllReportByOwnerAndReqId,
  insertReportReqIdByIdReport,
  findAllReportByOwner,
  countReportByOwner,
  findAllReportByOwnerAndNIK,
  countReportByOwnerAndNIK,
  countReportByOwnerAndReqId,
  findAllReportByOwnerReqIdAndNIK,
  countReportByOwnerReqIdAndNIK,
  findReportById,
  insertReportPDFById,
  findReportByIdJoinPersonAndRequest,
};
