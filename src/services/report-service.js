const path = require("path");
const hbs = require("handlebars");
const fsExtra = require("fs-extra");
const NotFoundError = require("../exceptions/NotFoundError");
const puppeteer = require("puppeteer");
const archiver = require("archiver");
const moment = require("moment-timezone");

const {
  findAllReportByOwnerAndReqId,
  insertReportReqIdByIdReport,
  findAllReportByOwner,
  countReportByOwner,
  findAllReportByOwnerAndNIK,
  countReportByOwnerAndReqId,
  countReportByOwnerAndNIK,
  findAllReportByOwnerReqIdAndNIK,
  countReportByOwnerReqIdAndNIK,
  findReportById,
  insertReportPDFById,
  findReportByIdJoinPersonAndRequest,
} = require("../repositories/report-repository");
const AuthorizationError = require("../exceptions/AuthorizationError");

// Generate report PDF In Production (EC2 Instance)
const generateReportPDF = async (report) => {
  const filePath = path.join(__dirname, "../templates", "index.hbs");

  const id = report.id;
  const nik = report.person.nik;
  const nama = report.person.nama;
  const alamat = report.person.alamat;
  const tempatLahir = report.person.tempat_lahir;
  const tanggalLahir = report.person.tanggal_lahir;
  const jenisKelamin = report.person.jenis_kelamin;
  const agama = report.person.agama;
  const status = report.person.status;
  const pekerjaan = report.person.pekerjaan;
  const kewarganegaraan = report.person.kewarganegaraan;
  const urlImageKTP = report.person.url_image_ktp;
  const urlImageSelfie = report.person.url_image_selfie;
  const skor = report.skor;
  const skorFR = report.skor_fr * 100;
  const jenisPermintaan = report.request.jenis_permintaan;
  let tempatTanggalLahir;

  if (tempatLahir === "-" && tanggalLahir === "-") {
    tempatTanggalLahir = "-";
  } else if (tempatLahir === "-") {
    tempatTanggalLahir = tanggalLahir;
  } else if (tanggalLahir === "-") {
    tempatTanggalLahir = tempatLahir;
  } else {
    tempatTanggalLahir = `${tempatLahir}, ${tanggalLahir}`;
  }

  const data = {
    id,
    nama,
    nik,
    alamat,
    tempatTanggalLahir,
    jenisKelamin,
    agama,
    status,
    pekerjaan,
    kewarganegaraan,
    urlImageKTP,
    urlImageSelfie,
    skor,
    skorFR,
    jenisPermintaan,
  };

  const pdfFileName = `${id}-${nama}-${jenisPermintaan}.pdf`;
  const pdfPath = path.join(
    __dirname,
    "../public",
    "pdf",
    "report",
    pdfFileName
  );
  const html = await fsExtra.readFile(filePath, "utf8");
  const content = hbs.compile(html)(data);
  const browser = await puppeteer.launch({
    executablePath:
      // "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "usr/bin/google-chrome",
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(content);

  await page.pdf({
    path: pdfPath,
    format: "A4",
    margin: {
      top: `10mm`,
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
    printBackground: true,
  });
  const pdfUrl = `${process.env.DOMAIN_URL}/pdf/reports/${pdfFileName}`;
  await updateReportPDFById(id, pdfUrl);
  await browser.close();

  return { pdfUrl, pdfPath };
  // return pdfPath;
};

// Generate report PDF In Localhost
// const generateReportPDF = async (report) => {
//   const filePath = path.join(__dirname, "../templates", "index.hbs");

//   const id = report.id;
//   const nik = report.person.nik;
//   const nama = report.person.nama;
//   const alamat = report.person.alamat;
//   const tempatLahir = report.person.tempat_lahir;
//   const tanggalLahir = report.person.tanggal_lahir;
//   const jenisKelamin = report.person.jenis_kelamin;
//   const agama = report.person.agama;
//   const status = report.person.status;
//   const pekerjaan = report.person.pekerjaan;
//   const kewarganegaraan = report.person.kewarganegaraan;
//   const urlImageKTP = report.person.url_image_ktp;
//   const urlImageSelfie = report.person.url_image_selfie;
//   const skor = report.skor;
//   const skorFR = report.skor_fr * 100;
//   const jenisPermintaan = report.request.jenis_permintaan;
//   let tempatTanggalLahir;

//   if (tempatLahir === "-" && tanggalLahir === "-") {
//     tempatTanggalLahir = "-";
//   } else if (tempatLahir === "-") {
//     tempatTanggalLahir = tanggalLahir;
//   } else if (tanggalLahir === "-") {
//     tempatTanggalLahir = tempatLahir;
//   } else {
//     tempatTanggalLahir = `${tempatLahir}, ${tanggalLahir}`;
//   }

//   const data = {
//     id,
//     nama,
//     nik,
//     alamat,
//     tempatTanggalLahir,
//     jenisKelamin,
//     agama,
//     status,
//     pekerjaan,
//     kewarganegaraan,
//     urlImageKTP,
//     urlImageSelfie,
//     skor,
//     skorFR,
//     jenisPermintaan,
//   };

//   const pdfFileName = `${id}-${nama}-${jenisPermintaan}.pdf`;
//   const pdfPath = path.join(
//     __dirname,
//     "../public",
//     "pdf",
//     "report",
//     pdfFileName
//   );
//   const html = await fsExtra.readFile(filePath, "utf8");
//   const content = hbs.compile(html)(data);
//   const browser = await puppeteer.launch({
//     executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
//     headless: true,
//   });
//   const page = await browser.newPage();
//   await page.setContent(content);

//   await page.pdf({
//     path: pdfPath,
//     format: "A4",
//     margin: {
//       top: `10mm`,
//       right: "10mm",
//       bottom: "10mm",
//       left: "10mm",
//     },
//     printBackground: true,
//   });
//   await updateReportPDFById(id, pdfPath);
//   await browser.close();
//   // return pdfPath;
// };

const openReportPDF = async (report) => {
  const { pdfPath } = await generateReportPDF(report);
  const open = await import("open");
  await open.default(pdfPath);
  // const pdfPath = await generateReportPDF(report);
  // const open = await import("open");
  // await open.default(pdfPath);
};

const downloadReportPDF = async (res, pdfPaths) => {
  const pdfPath = pdfPaths[0];
  return res.download(pdfPath, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      return res.status(500).send({
        error: true,
        message: "Internal Server Error",
      });
    }
  });
};

const downloadReportPDFsZip = async (res, pdfPaths) => {
  const timezone = "Asia/Jakarta";
  const timestamp = moment().tz(timezone).format("DD-MM-YY_HH-mm-ss");
  const fileName = `${timestamp}-reports.zip`;

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  const archive = archiver("zip");
  archive.pipe(res);

  pdfPaths.forEach((pdfPath) => {
    const fileName = path.basename(pdfPath);
    archive.file(pdfPath, { name: fileName });
  });

  archive.finalize();
};

const getAllReportByOwner = async (owner, size, skip) => {
  const reports = await findAllReportByOwner(owner, size, skip);
  return reports;
};

const getReportById = async (id) => {
  const report = await findReportById(id);

  if (!report) {
    throw new NotFoundError("Laporan tidak ditemukan");
  }

  return report;
};

const getReportByIdJoinPersonAndRequest = async (id) => {
  const report = await findReportByIdJoinPersonAndRequest(id);

  if (!report) {
    throw new NotFoundError("Laporan tidak ditemukan");
  }

  return report;
};

const getAllReportByOwnerAndReqId = async (owner, size, skip, reqId) => {
  const reports = await findAllReportByOwnerAndReqId(owner, size, skip, reqId);
  return reports;
};

const getAllReportByOwnerAndNIK = async (owner, size, skip, nik) => {
  const reports = await findAllReportByOwnerAndNIK(owner, size, skip, nik);
  return reports;
};

const getAllReportByOwnerReqIdAndNIK = async (
  owner,
  size,
  skip,
  reqId,
  nik
) => {
  const reports = await findAllReportByOwnerReqIdAndNIK(
    owner,
    size,
    skip,
    reqId,
    nik
  );
  return reports;
};

const getCountReportByOwner = async (owner) => {
  const total = await countReportByOwner(owner);
  return total;
};

const getCountReportByOwnerAndReqId = async (owner, reqId) => {
  const total = await countReportByOwnerAndReqId(owner, reqId);
  return total;
};

const getCountReportByOwnerAndNIK = async (owner, nik) => {
  const total = await countReportByOwnerAndNIK(owner, nik);
  return total;
};

const getCountReportByOwnerReqIdAndNIK = async (owner, reqId, nik) => {
  const total = await countReportByOwnerReqIdAndNIK(owner, reqId, nik);
  return total;
};

const updateReportReqIdByIdReport = async (id, idPermintaan) => {
  await insertReportReqIdByIdReport(id, idPermintaan);
};

const updateReportPDFById = async (id, pdfPath) => {
  await insertReportPDFById(id, pdfPath);
};

const verifyReportAccess = async (userId, owner) => {
  if (userId !== owner) {
    throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
  }
};

module.exports = {
  getAllReportByOwnerAndReqId,
  updateReportReqIdByIdReport,
  getAllReportByOwner,
  getCountReportByOwner,
  getAllReportByOwnerAndNIK,
  getCountReportByOwnerAndReqId,
  getCountReportByOwnerAndNIK,
  getAllReportByOwnerReqIdAndNIK,
  getCountReportByOwnerReqIdAndNIK,
  getReportById,
  generateReportPDF,
  updateReportPDFById,
  getReportByIdJoinPersonAndRequest,
  openReportPDF,
  generateReportPDF,
  downloadReportPDF,
  downloadReportPDFsZip,
  verifyReportAccess,
};
