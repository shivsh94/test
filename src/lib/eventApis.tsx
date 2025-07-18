import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getEvents = async (entity_id: string) => {
  try {
    const response = await axios.get(`/extra/${entity_id}/events/`);
    return response.data;
  } catch (error) {
    console.log("Error fetching events:", error);
    throw error;
  }
};
