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

const createReport = async (nama, jenisPermintaan, skor, createdAt, finishedAt, kendalaProses, status, pdf, nik, noPermintaan) => {
    const newReport = await prisma.report.create({
        data: {
            nama: nama,
            jenis_permintaan: jenisPermintaan,
            skor: skor,
            createdAt: createdAt,
            finishedAt: finishedAt,
            kendala_proses: kendalaProses || null, // Optional field, handle null if not provided
            status: status || null, // Optional field, handle null if not provided
            pdf: pdf || null, // Optional field, handle null if not provided
            nik: nik,
            no_permintaan: noPermintaan,
             // Optional field, handle null if not provided
        }
    });
    
    return newReport;
}

const findAllPerson = async (size, skip) => {
    const persons = await prisma.person.findMany({
        take: size,
        skip: skip
    });
    return persons;
}

const findAllRequest = async (size, skip) => {
    const requests = await prisma.request.findMany({
        take: size,
        skip: skip
    });
    return requests;
}

const findAllReport = async (size, skip) => {
    const reports = await prisma.report.findMany({
        take: size,
        skip: skip
    });
    return reports;
}

const findRequestById = async (id) => {
    const request = await prisma.request.findUnique({
        where: {
            no: id
        }
    })
    return request;
}

const findAllReportByReqId = async (size, skip, reqId) => {
    const reports = await prisma.report.findMany({
        where: {
            no_permintaan: reqId
        },
        take: size,
        skip: skip
    })
    return reports;
}

const findAllReportByNIK = async (size, skip, nik) => {
    const reports = await prisma.report.findMany({
        where: {
            nik: nik
        },
        take: size,
        skip: skip
    })
    return reports;
}

const findAllReportByReqIdAndNIK = async (size, skip, reqId, nik) => {
    const reports = await prisma.report.findMany({
        where: {
            no_permintaan: reqId,
            nik: nik
        },
        take: size,
        skip: skip
    })
    return reports;
}

const countPerson = async () => {
    const count = await prisma.person.count();
    return count;
}

const countRequest = async () => {
    const count = await prisma.request.count();
    return count;
}

const countReport = async () => {
    const count = await prisma.report.count();
    return count;
}

const countReportByReqId = async (reqId) => {
    const count = await prisma.report.count({
        where: {
            no_permintaan: reqId
        }
    });
    return count;
}

const countReportByNIK = async (nik) => {
    const count = await prisma.report.count({
        where: {
            nik: nik
        }
    });
    return count;
}

const countReportByReqIdAndNIK = async(reqId, nik) => {
    const count = await prisma.report.count({
        where: {
            no_permintaan: reqId,
            nik: nik
        }
    })
    return count;
}

const insertReqIdByNoReport = async (no, noPermintaan) => {
    await prisma.report.update({
        where: {
            no: no
        },
        data: {
            no_permintaan: noPermintaan
        }
    })
}

module.exports = { findPersonByNIK, createPerson, createRequest, createReport, findAllPerson, findAllRequest, findRequestById, findAllReportByReqId, countPerson, countRequest, insertReqIdByNoReport, findAllReport, countReport, findAllReportByNIK, countReportByNIK, countReportByReqId, findAllReportByReqIdAndNIK, countReportByReqIdAndNIK };