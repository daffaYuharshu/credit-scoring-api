const prisma = require("../database/prisma");

const findPersonByNIK = async (nik) => {
    const person = await prisma.person.findUnique({
        where: {
            nik: nik
        }
    })
    return person;
}

const createPerson = async (nik, createdAt, updatedAt, nama, jenisKelamin, alamat, tempatLahir, tanggalLahir, umur, golonganDarah, rt, rw, kelurahan, kecamatan, agama, status, pekerjaan, kewarganegaraan, urlKTP, urlSelfie, ktpPath, selfiePath) => {
    const newPerson = await prisma.person.create({
        data: {
        nik: nik,
        createdAt: createdAt,
        updatedAt: updatedAt,
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
        path_image_selfie: selfiePath
        }
    })

    return newPerson;
}

const createRequest = async (id, jenisPermintaan, jumlahCustomer, createdAt, finishedAt) => {
    const newRequest = await prisma.request.create({
        data: {
            no: id,
            jenis_permintaan: jenisPermintaan,
            jumlah_customer: jumlahCustomer,
            createdAt: createdAt,
            finishedAt: finishedAt
        }
    });

    return newRequest;
}

const createMyRequest = async (nik, nama, skor, noPermintaan) => {
    const newMyRequest = await prisma.myRequest.create({
        data: {
            nik: nik,
            nama: nama,
            skor: skor,
            no_permintaan: noPermintaan
        }
    })
    
    return newMyRequest;
}

const findAllPerson = async () => {
    const persons = await prisma.person.findMany();
    return persons;
}

const findAllRequest = async () => {
    const requests = await prisma.request.findMany();
    return requests;
}

const findRequestById = async (id) => {
    const request = await prisma.request.findUnique({
        where: {
            no: id
        }
    })
    return request;
}

const findMyRequestByReqId = async (reqId) => {
    const myRequest = await prisma.myRequest.findMany({
        where: {
            no_permintaan: reqId
        }
    })
    return myRequest;
}

module.exports = { findPersonByNIK, createPerson, createRequest, createMyRequest, findAllPerson, findAllRequest, findRequestById, findMyRequestByReqId }