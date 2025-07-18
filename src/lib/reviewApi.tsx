import { useQuery } from "@tanstack/react-query";
import axios from "axios";
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

interface Destination {
  id: string;
  destination: string;
  destination_url: string;
  condition: string;
  is_default: boolean;
  is_disabled: boolean;
  entity_id: string;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  question: string;
  is_disabled: boolean;
  is_required: boolean;
  entity_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  destinations: {
    items: Destination[];
    count: number;
  };
  questions: {
    items: Question[];
    count: number;
  };
}

export const getReview = async (entity_id: string): Promise<ReviewResponse> => {
  try {
    const res = await axios.get<ReviewResponse>(`/review/${entity_id}/read/`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch review data"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const useReview = (entity_id: string) => {
  return useQuery<ReviewResponse, Error>({
    queryKey: ["review", entity_id],
    queryFn: () => getReview(entity_id),
    enabled: !!entity_id,
    staleTime: 1000 * 60 * 2,
    retry: (failureCount, error) => {
      if (error.message.includes("404")) return false;
      return failureCount < 2;
    },
  });
};

export const postReview = async (
  entity_id: string,
  data: Record<string, any>
): Promise<void> => {
  try {
    await axios.post(`/review/${entity_id}/create/`, data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to post review data"
      );
    }
    throw new Error("An unexpected error occurred");
  }
};

export const usePostReview = (entity_id: string) => {
  return {
    postReview: (data: Record<string, any>) => postReview(entity_id, data),
  };
};
