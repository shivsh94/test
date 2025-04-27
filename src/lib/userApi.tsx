import axios from "axios";

export const userInfo = async (
  id: string, 
  company_id: string,
  name: string,
  contact: string
) => {
  const res = await axios.post(
    `http://localhost:8000/server/guest/v1/customer/${id}/${company_id}/register/`,
    { name, contact }
  );
  return res.data;
};