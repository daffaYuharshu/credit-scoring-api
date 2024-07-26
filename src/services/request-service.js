const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { createRequest, findAllRequest, findRequestById, countRequest } = require("../repositories/request-repository");
const NotFoundError = require('../exceptions/NotFoundError');

const postRequest = async (sum, finishedAt, jenisPermintaan) => {
  const generateShortUUID = () => {
    let shortUUID;
    do {
      const uuid = uuidv4().replace(/-/g, "");
      shortUUID = uuid.substring(0, 8);
    } while (shortUUID.charAt(0) !== "0");
    return shortUUID;
  };

  const id = generateShortUUID();
  const createdAt = moment(new Date().toISOString()).format(
    "DD/MM/YY HH:mm:ss"
  );
  await createRequest(id, jenisPermintaan, sum, createdAt, finishedAt);
  return id;
};

const getAllRequest = async (size, skip) => {
  const requests = await findAllRequest(size, skip);
  return requests;
};

const getRequestById = async (id) => {
  const request = await findRequestById(id);

  if (!request) {
    throw new NotFoundError("Request tidak ditemukan");
  }

  return request;
};

const getCountRequest = async () => {
  const total = await countRequest();
  return total;
};

module.exports = {
  postRequest,
  getAllRequest,
  getRequestById,
  getCountRequest,
};
