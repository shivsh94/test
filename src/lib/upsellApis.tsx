
import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const getUpsellCategories = async (entity_id: string) => {
  try {
    const response = await axios.get(`/upsell/${entity_id}/category/list/`);
    return response.data;
  } catch (error) {
    console.log("Error fetching upsell categories:", error);
    throw error;
  }
};

export const getupsellItems = async (entity_id : string) => {
  try {
    const response = await axios.get(
      `/upsell/${entity_id}/item/list/`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching upsell items:", error);
    throw error;
  }
}

export const getUpsellItemDetails = async (entity_id : string, item_id : string) => {
  try {
    const response = await axios.get(
      `/upsell/${entity_id}/item/read/${item_id}/`
    );
    return response.data;
  } catch (error) {
    console.log("Error fetching upsell item details:", error);
    throw error;
  }
}
