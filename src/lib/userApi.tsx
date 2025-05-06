import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;


export const userInfo = async (
  id: string, 
  company_id: string,
  name: string,
  contact: string
) => {
  const res = await axios.post(
    `/customer/${id}/${company_id}/register/`,
    { name, contact }
  );
  return res.data;
};