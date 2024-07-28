const path = require("path");
const hbs = require("handlebars");
const fsExtra = require("fs-extra");
const NotFoundError = require("../exceptions/NotFoundError");
const puppeteer = require("puppeteer");
const archiver = require('archiver');

const {
  findAllReportByReqId,
  insertReportReqIdByIdReport,
  findAllReport,
  countReport,
  findAllReportByNIK,
  countReportByReqId,
  countReportByNIK,
  findAllReportByReqIdAndNIK,
  countReportByReqIdAndNIK,
  findReportById,
  insertReportPDFById,
  findReportByIdJoinPersonAndRequest,
} = require("../repositories/report-repository");

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

  const data = {
    id,
    nama,
    nik,
    alamat,
    tempatLahir,
    tanggalLahir,
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

  const pdfPath = path.join(
    __dirname,
    "../public",
    "pdf",
    `${id}-${nama}-${jenisPermintaan}.pdf`
  );
  const html = await fsExtra.readFile(filePath, "utf8");
  const content = hbs.compile(html)(data);
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
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

  await updateReportPDFById(id, pdfPath);
  await browser.close();
  return pdfPath;
};

const openReportPDF = async (report) => {
  const pdfPath = await generateReportPDF(report);
  const open = await import("open");
  await open.default(pdfPath);
};

const downloadReportPDF = async (res, pdfPaths) => {
  const pdfPath = pdfPaths[0];
  return res.download(pdfPath, (err) => {
    if (err) {
      console.error("Error downloading the file:", err);
      return res.status(500).send({
        error: true,
        message: "Error downloading the file",
      });
    }
  });
};

const downloadReportPDFsZip = async (res, pdfPaths) => {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=reports.zip");

  const archive = archiver("zip");
  archive.pipe(res);

  pdfPaths.forEach((pdfPath) => {
    const fileName = path.basename(pdfPath);
    archive.file(pdfPath, { name: fileName });
  });

  archive.finalize();
};

const getAllReport = async (size, skip) => {
  const reports = await findAllReport(size, skip);
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

const getAllReportByReqId = async (size, skip, reqId) => {
  const reports = await findAllReportByReqId(size, skip, reqId);
  return reports;
};

const getAllReportByNIK = async (size, skip, nik) => {
  const reports = await findAllReportByNIK(size, skip, nik);
  return reports;
};

const getAllReportByReqIdAndNIK = async (size, skip, reqId, nik) => {
  const reports = await findAllReportByReqIdAndNIK(size, skip, reqId, nik);
  return reports;
};

const getCountReport = async () => {
  const total = await countReport();
  return total;
};

const getCountReportByReqId = async (reqId) => {
  const total = await countReportByReqId(reqId);
  return total;
};

const getCountReportByNIK = async (nik) => {
  const total = await countReportByNIK(nik);
  return total;
};

const getCountReportByReqIdAndNIK = async (reqId, nik) => {
  const total = await countReportByReqIdAndNIK(reqId, nik);
  return total;
};

const updateReportReqIdByIdReport = async (id, idPermintaan) => {
  await insertReportReqIdByIdReport(id, idPermintaan);
};

const updateReportPDFById = async (id, pdfPath) => {
  await insertReportPDFById(id, pdfPath);
};

module.exports = {
  getAllReportByReqId,
  updateReportReqIdByIdReport,
  getAllReport,
  getCountReport,
  getAllReportByNIK,
  getCountReportByReqId,
  getCountReportByNIK,
  getAllReportByReqIdAndNIK,
  getCountReportByReqIdAndNIK,
  getReportById,
  generateReportPDF,
  updateReportPDFById,
  getReportByIdJoinPersonAndRequest,
  openReportPDF,
  generateReportPDF,
  downloadReportPDF,
  downloadReportPDFsZip
};
