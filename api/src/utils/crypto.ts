import axios from "axios";

const keyId = process.env.YANDEX_KMS;

interface IResponse {
  data: {
    "keyId": "string",
    "versionId": "string",
    "ciphertext": "string"
    "plaintext": "string"
  }
}

async function getIamToken(key: string) {
  try {
      const response = await axios.post("https://iam.api.cloud.yandex.net/iam/v1/tokens", {yandexPassportOauthToken: key}, {
          headers: { "Content-Type": "application/json" }
      });
      return response.data.iamToken;
  } catch (error) {
      console.error("Ошибка получения IAM-токена:", error);
  }
}

export const encryptData = async (text: string) => {
  const encodedPlaintext = Buffer.from(text).toString('base64');
  const IamToken = await getIamToken(process.env.YANDEX_OAUTH!)
  const params = {
    "plaintext": encodedPlaintext
  }
  const response = await axios.post(`https://kms.yandex/kms/v1/keys/${keyId}:encrypt`, params, {
    headers: {
      Authorization: `Bearer ${IamToken}` 
    }
  }) as IResponse;
  return response.data;
}

export const decryptData = async (text: string) => {
  const IamToken = await getIamToken(process.env.YANDEX_OAUTH!)
  const params = {
    "ciphertext": text
  }
  const response = await axios.post(`https://kms.yandex/kms/v1/keys/${keyId}:decrypt`, params, {
    headers: {
      Authorization: `Bearer ${IamToken}` 
    }
  }) as IResponse;
  return response.data;
}