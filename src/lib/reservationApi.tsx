import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getReservation = async (
  entity_id: string,
  reservation_id: string
) => {
  const res = await axios.get(`/reservation/${entity_id}/${reservation_id}/`);

  return res.data;
};
