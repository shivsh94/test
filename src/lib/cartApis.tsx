import axios from "axios";

export const getCart = async (entity_id: string, customer_id: string) => {
    const res = await axios.get(
        `http://localhost:8000/server/guest/v1/cart/${entity_id}/${customer_id}/`,
    );
    return res.data;
    }

export const addToCart = async (entity_id: string, customer_id: string) => {
    const res = await axios.post(
        `http://localhost:8000/server/guest/v1/cart/${entity_id}/${customer_id}/`,
    );
    return res.data;
}

export const updateItem = async (entity_id: string, customer_id: string, item_id: string) => {
    const res = await axios.put(
        `http://localhost:8000/server/guest/v1/cart/${entity_id}/${customer_id}/${item_id}/`,
    );
    return res.data;
}

export const deleteItem = async (entity_id: string, customer_id: string, item_id: string) => {
    const res = await axios.delete(
        `http://localhost:8000/server/guest/v1/cart/${entity_id}/${customer_id}/${item_id}/`,
    );
    return res.data;
}

export const clearCart = async (entity_id: string, customer_id: string) => {
    const res = await axios.delete(
        `http://localhost:8000/server/guest/v1/cart/${entity_id}/${customer_id}/`,
    );
    return res.data;
}


    