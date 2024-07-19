const FormData = require('form-data');
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
const { findPersonByNIK, createPerson, createRequest, findAllPerson, findAllRequest, findRequestById, findAllReportByReqId, countPerson, countRequest, createReport, insertReqIdByNoReport, findAllReport, countReport, findAllReportByNIK, countReportByReqId, countReportByNIK, findAllReportByReqIdAndNIK, countReportByReqIdAndNIK, findReportById } = require("../repositories/scoring-repository");
const UnprocessableContentError = require('../exceptions/UnprocessableContentError');
const NotFoundError = require('../exceptions/NotFoundError');
const ConflictError = require('../exceptions/ConflictError');

const preprocessImage = (img) => {
    const imgSize = img.data.length;
    const extImg = path.extname(img.name);
    const imgName = img.md5 + extImg;
    // const urlImg = `${req.protocol}://${req.get("host")}/images/${imgName}`;

    const allowedType = [".png", ".jpg", ".jpeg"];

    if (
        !allowedType.includes(extImg.toLowerCase())
    ) {
        throw new UnprocessableContentError("Ekstensi gambar tidak valid");
        
    }

    if (imgSize > 1000000) {
        throw new UnprocessableContentError("Ukuran gambar harus lebih kecil dari 1 MB");
    }
    return imgName;
}

const uploadImage = (image, imageName) => {
    return new Promise((resolve, reject) => {
        const uploadPath = `./src/public/images/${imageName}`;
        image.mv(uploadPath, (err) => {
            if (err) {
            reject(err);
            } else {
            // Check if file exists after upload
            fs.access(uploadPath, fs.constants.F_OK, (err) => {
                if (err) {
                reject(new NotFoundError('Gambar tidak ditemukan setelah diupload'));
                } else {
                resolve();
                }
            });
            }
        });
    });
};

const calculateAge = (tanggalLahir) => {
    const parts = tanggalLahir.split('-');
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const today = new Date();
    const birthDate = new Date(formattedDate);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

const addPerson = async (req, ktpName, selfieName) => {
    const ktpPath = path.join(`./src/public/images/`, ktpName);
    const selfiePath = path.join(`./src/public/images/`, selfieName);
    const urlKTP = `${req.protocol}://${req.get("host")}/images/${ktpName}`;
    const urlSelfie = `${req.protocol}://${req.get("host")}/images/${selfieName}`;

    // Buat objek FormData
    const formDataKTP = new FormData();
    formDataKTP.append('image', fs.createReadStream(ktpPath));

    const formDataSelfie = new FormData();
    formDataSelfie.append('image', fs.createReadStream(selfiePath));

    // Konfigurasi untuk mengirimkan FormData
    const axiosConfig = {
        headers: {
            ...formDataKTP.getHeaders() // Mendapatkan header dari FormData
        }
    };
    
    const uploadKtp = await axios.post(`${process.env.ML_API}/api/image/upload/`, formDataKTP, axiosConfig);
    const uploadSelfie = await axios.post(`${process.env.ML_API}/api/image/upload/`, formDataSelfie, axiosConfig);

    const ktpId = uploadKtp.data.data.image.id;
    const selfieId = uploadSelfie.data.data.image.id;

    const identityScore = await axios.post(`${process.env.ML_API}/api/ktpverification/`, {
        ktpid: ktpId,
        selfieid: selfieId
    })
    
    await axios.delete(`${process.env.ML_API}/api/image/delete/`, {
        data: {
            id: ktpId
        }
    })
    
    await axios.delete(`${process.env.ML_API}/api/image/delete/`, {
        data: {
            id: selfieId
        }
    })

    const result = identityScore.data.data.result;
    const nik = result.nik;
    const createdAt = moment(new Date().toISOString()).format('DD/MM/YY HH:mm:ss');
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

    if(!nik){
        throw new UnprocessableContentError("KTP tidak terbaca");
    }

    const personIsExist = await findPersonByNIK(nik);

    if(!personIsExist){
        const newPerson = await createPerson(nik, createdAt, updatedAt, nama, jenisKelamin, alamat, tempatLahir, tanggalLahir, umur, golonganDarah, rt, rw, kelurahan, kecamatan, agama, status, pekerjaan, kewarganegaraan, urlKTP, urlSelfie, ktpPath, selfiePath);
        const newPersonName = newPerson.nama;
        const newPersonNIK = newPerson.nik;
        const person = {
            nik: newPersonNIK,
            nama: newPersonName,
        }
        return person;
    } else {
        throw new ConflictError("Data sudah pernah ditambahkan");
    }
}

const scoringIdentity = async (person) => {
    const ktpPath = person.path_image_ktp;
    const fotoPath = person.path_image_selfie;
    
    // Buat objek FormData
    const formDataKTP = new FormData();
    formDataKTP.append('image', fs.createReadStream(ktpPath));

    const formDataSelfie = new FormData();
    formDataSelfie.append('image', fs.createReadStream(fotoPath));

    // Konfigurasi untuk mengirimkan FormData
    const axiosConfig = {
        headers: {
            ...formDataKTP.getHeaders() // Mendapatkan header dari FormData
        }
    };

    
    const uploadKtp = await axios.post(`${process.env.ML_API}/api/image/upload/`, formDataKTP, axiosConfig);
    const uploadSelfie = await axios.post(`${process.env.ML_API}/api/image/upload/`, formDataSelfie, axiosConfig);

    const ktpId = uploadKtp.data.data.image.id;
    const selfieId = uploadSelfie.data.data.image.id;

    const identityScore = await axios.post(`${process.env.ML_API}/api/ktpverification/`, {
        ktpid: ktpId,
        selfieid: selfieId
    })

    await axios.delete(`${process.env.ML_API}/api/image/delete/`, {
        data: {
            id: ktpId
        }
    })

    await axios.delete(`${process.env.ML_API}/api/image/delete/`, {
        data: {
            id: selfieId
        }
    })

    const result = identityScore.data.data.result;
    const nik = result.nik;
    const nama = result.nama;
    const skorFR = result.SCORE_FR;
    const skor = () => {
    if(skorFR >= 0.9){
        return "Sangat Baik";
    } else if (skorFR >= 0.8){
        return "Baik";
    } else if (skorFR >= 0.7){
        return "Cukup Baik";
    } else if (skorFR >= 0.55){
        return "Buruk";
    } else {
        return "Sangat Buruk";
    }
    }
    
    const createdAt = moment(new Date().toISOString()).format('DD/MM/YY HH:mm:ss');
    const finishedAt = createdAt;
    const jenisPermintaan = "AI Identity Scoring";
    const kendalaProses = "-";
    const status = "Selesai";
    const pdf = "-"

    const report = await createReport(nama, jenisPermintaan, skor(), createdAt, finishedAt, kendalaProses, status, pdf, nik);
    return report;
    
}

const postRequest = async (sum, finishedAt) => {
    const generateShortUUID = () => {
        let shortUUID;
        do {
            const uuid = uuidv4().replace(/-/g,'');
            shortUUID = uuid.substring(0, 8);
        } while (shortUUID.charAt(0) !== '0');
        return shortUUID;
    }

    const id = generateShortUUID();
    const createdAt = moment(new Date().toISOString()).format('DD/MM/YY HH:mm:ss');
    const jenisPermintaan = "AI Identity Scoring";
    await createRequest(id, jenisPermintaan, sum, createdAt, finishedAt);
    return id;
            
}

const getAllPerson = async (size, skip) => {
    const persons = await findAllPerson(size, skip);
    return persons;
}

const getAllRequest = async (size, skip) => {
    const requests = await findAllRequest(size, skip);
    return requests;
}

const getAllReport = async (size, skip) => {
    const reports = await findAllReport(size, skip);
    return reports;
}

const getPersonByNIK = async (nik) => {
    const person = await findPersonByNIK(nik);
    if(!person){
        throw new NotFoundError("Data tidak ditemukan");
    }
    return person;
}

const getRequestById = async (id) => {
    const request = await findRequestById(id);

    if(!request){
        throw new NotFoundError("Request tidak ditemukan");
    }
    
    return request;
}

const getReportById = async (id) => {
    const report = await findReportById(id);

    if(!report){
        throw new NotFoundError("Laporan tidak ditemukan");
    }
    
    return report;
}

const getAllReportByReqId = async (size, skip, reqId) => {
    const reports = await findAllReportByReqId(size, skip, reqId);
    return reports;
}

const getAllReportByNIK = async (size, skip, nik) => {
    const reports = await findAllReportByNIK(size, skip, nik);
    return reports;
}

const getAllReportByReqIdAndNIK = async (size, skip, reqId, nik) => {
    const reports = await findAllReportByReqIdAndNIK(size, skip, reqId, nik);
    return reports;
}

const getCountPerson = async () => {
    const total = await countPerson();
    return total;
}

const getCountRequest = async () => {
    const total = await countRequest();
    return total;
}

const getCountReport = async () => {
    const total = await countReport();
    return total;
}

const getCountReportByReqId = async (reqId) => {
    const total = await countReportByReqId(reqId);
    return total;
}

const getCountReportByNIK = async (nik) => {
    const total = await countReportByNIK(nik);
    return total;
}

const getCountReportByReqIdAndNIK = async (reqId, nik) => {
    const total = await countReportByReqIdAndNIK(reqId, nik);
    return total;
}

const updateReqIdByNoReport = async (no, noPermintaan) => {
    await insertReqIdByNoReport(no, noPermintaan);
}

module.exports = { uploadImage, preprocessImage, addPerson, scoringIdentity, getAllPerson, getAllRequest, getPersonByNIK, getRequestById, getAllReportByReqId, postRequest, getCountPerson, getCountRequest, updateReqIdByNoReport, getAllReport, getCountReport, getAllReportByNIK, getCountReportByReqId, getCountReportByNIK, getAllReportByReqIdAndNIK, getCountReportByReqIdAndNIK, getReportById }