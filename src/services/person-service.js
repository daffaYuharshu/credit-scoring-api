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
  findPersonByUserIdAndNIK,
  findAllPersonByOwner,
  countPersonByOwner,
  findAllPersonByOwnerHaveReports,
  countPersonByOwnerHaveReports,
  findAllPersonByOwnerHaveReportsFilteredByNIK,
  findAllPersonByOwnerHaveReportsFilteredByNama,
  countPersonByOwnerHaveReportsFilteredByNIK,
  countPersonByOwnerHaveReportsFilteredByNama,
  findAllPersonByOwnerFilteredByNIK,
  findAllPersonByOwnerFilteredByNama,
  countPersonByOwnerFilteredByNIK,
  countPersonByOwnerFilteredByNama,
} = require("../repositories/person-repository");
const { calculateAge } = require("../utils");

const addPerson = async (req, ktpName, selfieName, userId) => {
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

  const personIsExist = await findPersonByUserIdAndNIK(userId, nik);

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
      selfiePath,
      userId
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

const getAllPersonByOwner = async (owner, size, skip) => {
  const persons = await findAllPersonByOwner(owner, size, skip);
  return persons;
};

const getAllPersonByOwnerFilteredByNIK = async (owner, size, skip, nik) => {
  const persons = await findAllPersonByOwnerFilteredByNIK(
    owner,
    size,
    skip,
    nik
  );
  return persons;
};

const getAllPersonByOwnerFilteredByNama = async (owner, size, skip, nama) => {
  const persons = await findAllPersonByOwnerFilteredByNama(
    owner,
    size,
    skip,
    nama
  );
  return persons;
};

const getAllPersonByOwnerHaveReports = async (owner, size, skip) => {
  const persons = await findAllPersonByOwnerHaveReports(owner, size, skip);
  return persons;
};

const getAllPersonByOwnerHaveReportsFilteredByNIK = async (
  owner,
  size,
  skip,
  nik
) => {
  const persons = await findAllPersonByOwnerHaveReportsFilteredByNIK(
    owner,
    size,
    skip,
    nik
  );
  return persons;
};

const getAllPersonByOwnerHaveReportsFilteredByNama = async (
  owner,
  size,
  skip,
  nama
) => {
  const persons = await findAllPersonByOwnerHaveReportsFilteredByNama(
    owner,
    size,
    skip,
    nama
  );
  return persons;
};

const getPersonByUserIdAndNIK = async (userId, nik) => {
  const person = await findPersonByUserIdAndNIK(userId, nik);
  if (!person) {
    throw new NotFoundError("Data tidak ditemukan");
  }
  return person;
};

const getCountPersonByOwner = async (owner) => {
  const total = await countPersonByOwner(owner);
  return total;
};

const getCountPersonByOwnerFilteredByNIK = async (owner, nik) => {
  const total = await countPersonByOwnerFilteredByNIK(owner, nik);
  return total;
};

const getCountPersonByOwnerFilteredByNama = async (owner, nama) => {
  const total = await countPersonByOwnerFilteredByNama(owner, nama);
  return total;
};

const getCountPersonByOwnerHaveReports = async (owner) => {
  const total = await countPersonByOwnerHaveReports(owner);
  return total;
};

const getCountPersonByOwnerHaveReportsFilteredByNIK = async (owner, nik) => {
  const total = await countPersonByOwnerHaveReportsFilteredByNIK(owner, nik);
  return total;
};

const getCountPersonByOwnerHaveReportsFilteredByNama = async (owner, nama) => {
  const total = await countPersonByOwnerHaveReportsFilteredByNama(owner, nama);
  return total;
};

module.exports = {
  addPerson,
  getAllPersonByOwner,
  getCountPersonByOwner,
  getPersonByUserIdAndNIK,
  getAllPersonByOwnerHaveReports,
  getCountPersonByOwnerHaveReports,
  getAllPersonByOwnerHaveReportsFilteredByNIK,
  getAllPersonByOwnerHaveReportsFilteredByNama,
  getCountPersonByOwnerHaveReportsFilteredByNIK,
  getCountPersonByOwnerHaveReportsFilteredByNama,
  getAllPersonByOwnerFilteredByNIK,
  getAllPersonByOwnerFilteredByNama,
  getCountPersonByOwnerFilteredByNIK,
  getCountPersonByOwnerFilteredByNama,
};
