import axios from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

export const getCheckinAttributes = async (entity_id: string) => {
  try {
    const response = await axios.get(`/checkin/attributes/${entity_id}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching checkin attributes:", error);
    throw error;
  }
};
