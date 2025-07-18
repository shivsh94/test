import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const ServiceRequest = async (
  entity_id: string,
  title: string,
  description: string,
  location: string,
  category: string,
  rid: string | null,
  customer_id: string,
  name: string,
  token: string | null
) => {
  try {
    const res = await axios.post(
      `/service/${entity_id}/create/`,
      {
        title,
        description,
        location,
        category,
        rid,
        customer_id,
        name,
      },
      {
        headers: {
          Captcha: token,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create service request"
      );
    }
    throw new Error("Failed to create service request");
  }
};
