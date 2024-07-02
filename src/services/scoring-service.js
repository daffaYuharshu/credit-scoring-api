const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const { findPersonByNIK, createPerson, createRequest, findAllPerson, findAllRequest, findRequestById, findMyRequestByReqId } = require("../repositories/scoring-repository");

const preprocessImage = (img) => {
    const imgSize = img.data.length;
    const extImg = path.extname(img.name);
    const imgName = img.md5 + extImg;
    const urlImg = `${req.protocol}://${req.get("host")}/images/${imgName}`;

    const allowedType = [".png", ".jpg", ".jpeg"];

    if (
        !allowedType.includes(extImg.toLowerCase())
    ) {
        throw Error("Invalid Image Extension");
        // return res.status(422).send({
        // message: "Invalid Image Extension",
        // });
    }

    if (imgSize > 1000000) {
        throw Error("Image must be less than 1 MB")
        // return res.status(422).send({
        // message: "Image must be less than 1 MB",
        // });
    }
    return imgName;
}

const uploadImage = (image, imageName) => {
    return new Promise((resolve, reject) => {
        const uploadPath = `./public/images/${imageName}`;
        image.mv(uploadPath, (err) => {
            if (err) {
            reject(err);
            } else {
            // Check if file exists after upload
            fs.access(uploadPath, fs.constants.F_OK, (err) => {
                if (err) {
                reject(new Error('File not found after upload'));
                } else {
                resolve();
                }
            });
            }
        });
    });
};

const addPerson = async (ktpName, selfieName) => {
    const ktpPath = path.join(__dirname, 'public', 'images', ktpName);
    const selfiePath = path.join(__dirname, 'public', 'images', selfieName);

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
    try {
        const uploadKtp = await axios.post(process.env.UPLOAD_IMAGE_API, formDataKTP, axiosConfig);
        const uploadSelfie = await axios.post(process.env.UPLOAD_IMAGE_API, formDataSelfie, axiosConfig);

        const ktpId = uploadKtp.data.data.image.id;
        const selfieId = uploadSelfie.data.data.image.id;

        const identityScore = await axios.post(process.env.ML_API, {
            ktpid: ktpId,
            selfieid: selfieId
        })
        
        const removeKtp = await axios.delete(process.env.DELETE_DB_API, {
            data: {
                id: ktpId
            }
        })
        const removeFoto = await axios.delete(process.env.DELETE_DB_API, {
            data: {
                id: selfieId
            }
        })

        const result = identityScore.data.data.result;
        const nik = result.nik;
        const nama = result.nama;
        const jenisKelamin = result.jenis_kelamin;
        const alamat = result.alamat;
        const tempatLahir = result.tempat_lahir;
        const tanggalLahir = result.tanggal_lahir;
        const golonganDarah = result.golongan_darah;
        const rt = result.rt;
        const rw = result.rw;
        const kelurahan = result.kelurahan_atau_desa;
        const kecamatan = result.kecamatan;
        const agama = result.agama;
        const status = result.status_perkawinan;
        const pekerjaan = result.pekerjaan;
        const kewarganegaraan = result.kewarganegaraan;
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
        // console.log(nik)
        

        const personIsExist = await findPersonByNIK(nik);

        if(!personIsExist){
            const newPerson = await createPerson(nik, nama, jenisKelamin, alamat, tempatLahir, tanggalLahir, golonganDarah, rt, rw, kelurahan, kecamatan, agama, status, pekerjaan, kewarganegaraan, ktpPath, selfiePath);
        } else {
            throw Error("Data already added");
        }
    } catch (error) {
        throw Error(error)
    }
    
}

const scoringIdentity = async (person) => {
    const ktpPath = person.image_ktp;
    const fotoPath = person.image_selfie;
    
    // Buat objek FormData
    const formDataKTP = new FormData();
    formDataKTP.append('image', fs.createReadStream(ktpPath));

    const formDataFoto = new FormData();
    formDataFoto.append('image', fs.createReadStream(fotoPath));

    // Konfigurasi untuk mengirimkan FormData
    const axiosConfig = {
    headers: {
        ...formDataKTP.getHeaders() // Mendapatkan header dari FormData
    }
    };

    try {
        const uploadKtp = await axios.post(process.env.UPLOAD_IMAGE_API, formDataKTP, axiosConfig);
        const uploadFoto = await axios.post(process.env.UPLOAD_IMAGE_API, formDataFoto, axiosConfig);

        const ktpId = uploadKtp.data.data.image.id;
        const selfieId = uploadFoto.data.data.image.id;

        const identityScore = await axios.post(process.env.ML_API, {
            ktpid: ktpId,
            selfieid: selfieId
        })

        const removeKtp = await axios.delete(process.env.DELETE_DB_API, {
            data: {
                id: ktpId
            }
        })
        const removeFoto = await axios.delete(process.env.DELETE_DB_API, {
            data: {
                id: selfieId
            }
        })

        const generateShortUUID = () => {
            let shortUUID;
            do {
                const uuid = uuidv4().replace(/-/g,'');
                shortUUID = uuid.substring(0, 8);
            } while (shortUUID.charAt(0) !== '0');
            return shortUUID;
        }

        const id = generateShortUUID();
        // console.log(id);

        const newRequest = await createRequest(id, "Ai Identity Scoring", 1);

        const result = identityScore.data.data.result;
        // const nik = result.nik;
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

        const newMyRequest = await createMyRequest(nik, nama, skor(), id)

        return result;
    } catch (error) {
        throw Error(error);
    }
    
}

const getAllPerson = async () => {
    const persons = await findAllPerson();
    return persons;
}

const getAllRequest = async () => {
    const requests = await findAllRequest();
    return requests;
}

const getPersonByNIK = async (nik) => {
    const person = await findPersonByNIK(nik);
    if(!person){
        throw Error("Person not found");
    }
    return person;
}

const getRequestById = async (id) => {
    const request = await findRequestById(id);

    if(!request){
        throw Error("Request not found");
    }
    
    return request;
}

const getAllMyRequestByReqId = async(reqId) => {
    const myRequest = await findMyRequestByReqId(reqId);
    return myRequest;
}
module.exports = { uploadImage, preprocessImage, addPerson, scoringIdentity, getAllPerson, getAllRequest, getPersonByNIK, getRequestById, getAllMyRequestByReqId }