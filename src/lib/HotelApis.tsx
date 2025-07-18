import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const fetchHotelInfo = async (slug: string) => {
  const res = await axios.get(`/entity/${slug}/`);
  return res.data;
};

export const fetchIdInfo = async (id: string) => {
  const res = await axios.get(`/extra/${id}/notices/`);
  return res.data;
};

export const nearByPlaces = async (id: string) => {
  const res = await axios.get(`/extra/${id}/places/`);
  return res.data;
};

export const categoriesList = async (id: string) => {
  const res = await axios.get(`/fnb/${id}/category/list/`);
  return res.data;
};

export const menuList = async (id: string) => {
  const res = await axios.get(`/fnb/${id}/item/list/`);
  return res.data;
};

export const fetchLabel = async (id: string, company_id: string) => {
  const res = await axios.get(`/extra/${id}/${company_id}/labels/`);
  return res.data;
};
