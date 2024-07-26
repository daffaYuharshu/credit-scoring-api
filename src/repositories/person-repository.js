const prisma = require("../database/prisma");

const findPersonByNIK = async (nik) => {
  const person = await prisma.person.findUnique({
    where: {
      nik: nik,
    },
  });
  return person;
};

const createPerson = async (
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
) => {
  const newPerson = await prisma.person.create({
    data: {
      nik: nik,
      created_at: createdAt,
      updated_at: updatedAt,
      nama: nama,
      jenis_kelamin: jenisKelamin,
      alamat: alamat,
      tempat_lahir: tempatLahir,
      tanggal_lahir: tanggalLahir,
      umur: umur,
      gol_darah: golonganDarah,
      rt: rt,
      rw: rw,
      kelurahan: kelurahan,
      kecamatan: kecamatan,
      agama: agama,
      status: status,
      pekerjaan: pekerjaan,
      kewarganegaraan: kewarganegaraan,
      url_image_ktp: urlKTP,
      url_image_selfie: urlSelfie,
      path_image_ktp: ktpPath,
      path_image_selfie: selfiePath,
    },
  });

  return newPerson;
};

const findAllPerson = async (size, skip) => {
  const persons = await prisma.person.findMany({
    take: size,
    skip: skip,
  });
  return persons;
};

const countPerson = async () => {
  const count = await prisma.person.count();
  return count;
};

module.exports = { findPersonByNIK, createPerson, findAllPerson, countPerson };
