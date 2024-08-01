const prisma = require("../database/prisma");

const findPersonByUserIdAndNIK = async (userId, nik) => {
  const person = await prisma.person.findFirst({
    where: {
      AND: [{ owner: userId }, { nik: nik }],
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
  selfiePath,
  userId
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
      owner: userId,
    },
  });

  return newPerson;
};

const findAllPersonByOwner = async (owner, size, skip) => {
  const persons = await prisma.person.findMany({
    where: {
      owner: owner,
    },
    take: size,
    skip: skip,
  });
  return persons;
};

const countPersonByOwner = async (owner) => {
  const count = await prisma.person.count({
    where: {
      owner: owner,
    },
  });
  return count;
};

module.exports = {
  findPersonByUserIdAndNIK,
  createPerson,
  findAllPersonByOwner,
  countPersonByOwner,
};
