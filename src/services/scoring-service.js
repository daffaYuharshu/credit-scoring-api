const FormData = require("form-data");
const moment = require("moment");
const fs = require("fs");
const axios = require("axios");
const { createReport } = require("../repositories/report-repository");

const scoringIdentity = async (person, userId, idPerson) => {
  const ktpPath = person.path_image_ktp;
  const fotoPath = person.path_image_selfie;
  
  // Buat objek FormData
  const formDataKTP = new FormData();
  formDataKTP.append("image", fs.createReadStream(ktpPath));

  const formDataSelfie = new FormData();
  formDataSelfie.append("image", fs.createReadStream(fotoPath));

  // Konfigurasi untuk mengirimkan FormData
  const axiosConfig = {
    headers: {
      ...formDataKTP.getHeaders(), // Mendapatkan header dari FormData
    },
  };

  const uploadKtp = await axios.post(
    `${process.env.ML_API}/api/image/upload/`,
    formDataKTP,
    axiosConfig
  );
  const uploadSelfie = await axios.post(
    `${process.env.ML_API}/api/image/upload/`,
    formDataSelfie,
    axiosConfig
  );

  const ktpId = uploadKtp.data.data.image.id;
  const selfieId = uploadSelfie.data.data.image.id;

  const identityScore = await axios.post(
    `${process.env.ML_API}/api/ktpverification/`,
    {
      ktpid: ktpId,
      selfieid: selfieId,
    }
  );

  await axios.delete(`${process.env.ML_API}/api/image/delete/`, {
    data: {
      id: ktpId,
    },
  });

  await axios.delete(`${process.env.ML_API}/api/image/delete/`, {
    data: {
      id: selfieId,
    },
  });

  const result = identityScore.data.data.result;
  const skorFR = parseFloat(result.SCORE_FR.toFixed(2));
  const skorOCR = parseFloat(result.SCORE_OCR.toFixed(2));
  const skorASID = parseFloat(result.SCORE_ASID.toFixed(2));
  const skor = () => {
    if (skorFR >= 0.9) {
      return "Sangat Baik";
    } else if (skorFR >= 0.8) {
      return "Baik";
    } else if (skorFR >= 0.7) {
      return "Cukup Baik";
    } else if (skorFR >= 0.55) {
      return "Buruk";
    } else {
      return "Sangat Buruk";
    }
  };

  const createdAt = moment(new Date().toISOString()).format(
    "DD/MM/YY HH:mm:ss"
  );
  const finishedAt = createdAt;
  const kendalaProses = "-";
  const status = "Selesai";
  const pdf = "-";

  const report = await createReport(
    createdAt,
    finishedAt,
    kendalaProses,
    status,
    pdf,
    skor(),
    skorFR,
    skorOCR,
    skorASID,
    idPerson,
    userId
  );
  return report;
};

module.exports = { scoringIdentity };
