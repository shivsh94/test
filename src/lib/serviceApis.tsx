import axios from "axios";

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
    `http://localhost:8000/server/guest/v1/service/${id}/create/`,
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
