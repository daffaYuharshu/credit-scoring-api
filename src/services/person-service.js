const ConflictError = require("../exceptions/ConflictError");
const UnprocessableContentError = require("../exceptions/UnprocessableContentError");
const NotFoundError = require("../exceptions/NotFoundError");
const FormData = require("form-data");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const {
  createPerson,
  findPersonByNIK,
  findAllPerson,
  countPerson,
} = require("../repositories/person-repository");
const { calculateAge } = require("../utils");

const addPerson = async (req, ktpName, selfieName) => {
  const ktpPath = path.join(`./src/public/images/`, ktpName);
  const selfiePath = path.join(`./src/public/images/`, selfieName);
  const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
  const urlSelfie = `${req.protocol}://${req.get("host")}/images/${selfieName}`;

  // Buat objek FormData
  const formDataKTP = new FormData();
  formDataKTP.append("image", fs.createReadStream(ktpPath));

  const formDataSelfie = new FormData();
  formDataSelfie.append("image", fs.createReadStream(selfiePath));

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

  const responseStatus = identityScore.data.status;
  if (responseStatus === false) {
    throw new UnprocessableContentError("KTP tidak terbaca");
  }

  const result = identityScore.data.data.result;
  const nik = result.nik;
  const createdAt = moment(new Date().toISOString()).format(
    "DD/MM/YY HH:mm:ss"
  );
  const updatedAt = createdAt;
  const nama = result.nama;
  const jenisKelamin = result.jenis_kelamin;
  const alamat = result.alamat;
  const tempatLahir = result.tempat_lahir;
  const tanggalLahir = result.tanggal_lahir;
  const umur = calculateAge(tanggalLahir);
  const golonganDarah = result.golongan_darah;
  const rt = result.rt;
  const rw = result.rw;
  const kelurahan = result.kelurahan_atau_desa;
  const kecamatan = result.kecamatan;
  const agama = result.agama;
  const status = result.status_perkawinan;
  const pekerjaan = result.pekerjaan;
  const kewarganegaraan = result.kewarganegaraan;

  if (!nik) {
    throw new UnprocessableContentError("KTP tidak terbaca");
  }

  if (!nama) {
    throw new UnprocessableContentError("KTP tidak terbaca");
  }

  const personIsExist = await findPersonByNIK(nik);

  if (!personIsExist) {
    const newPerson = await createPerson(
      nik,
      createdAt,
      updatedAt,
      nama,
      jenisKelamin,
      alamat,
      tempatLahir,
      tanggalLahir,
      umur,
      golonganDarah,
      rt,
      rw,
      kelurahan,
      kecamatan,
      agama,
      status,
      pekerjaan,
      kewarganegaraan,
      urlKTP,
      urlSelfie,
      ktpPath,
      selfiePath
    );
    const newPersonName = newPerson.nama;
    const newPersonNIK = newPerson.nik;
    const person = {
      nik: newPersonNIK,
      nama: newPersonName,
    };
    return person;
  } else {
    throw new ConflictError("Data sudah pernah ditambahkan");
  }
};

const getAllPerson = async (size, skip) => {
  const persons = await findAllPerson(size, skip);
  return persons;
};

const getPersonByNIK = async (nik) => {
  const person = await findPersonByNIK(nik);
  if (!person) {
    throw new NotFoundError("Data tidak ditemukan");
  }
  return person;
};

const getCountPerson = async () => {
  const total = await countPerson();
  return total;
};

module.exports = { addPerson, getAllPerson, getCountPerson, getPersonByNIK };
