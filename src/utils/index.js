const path = require("path");
const UnprocessableContentError = require("../exceptions/UnprocessableContentError");
const fs = require("fs");

const preprocessImage = (img) => {
  const imgSize = img.data.length;
  const extImg = path.extname(img.name);
  const imgName = img.md5 + extImg;
  // const urlImg = `${req.protocol}://${req.get("host")}/images/${imgName}`;

  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(extImg.toLowerCase())) {
    throw new UnprocessableContentError("Ekstensi gambar tidak valid");
  }

  if (imgSize > 1000000) {
    throw new UnprocessableContentError(
      "Ukuran gambar harus lebih kecil dari 1 MB"
    );
  }
  return imgName;
};

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
            reject(
              new NotFoundError("Gambar tidak ditemukan setelah diupload")
            );
          } else {
            resolve();
          }
        });
      }
    });
  });
};

const calculateAge = (tanggalLahir) => {
  const parts = tanggalLahir.split("-");
  const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

  const today = new Date();
  const birthDate = new Date(formattedDate);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

module.exports = { preprocessImage, uploadImage, calculateAge };
