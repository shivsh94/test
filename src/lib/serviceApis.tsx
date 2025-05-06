import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const userInfo = async (
  id: string,
  title: string,
  description: string,
  location: string,
  category: string,
  reservation_id: string,
  customer_id: string,
  name: string,
  contact: string
) => {
  const res = await axios.post(
    `/service/${id}/create/`,
    {
      title,
      description,
      location,
      category,
      reservation_id,
      customer_id,
      name,
      contact,
    }
  );
  return res.data;
};
