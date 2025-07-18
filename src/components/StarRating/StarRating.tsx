"use client";

import { CheckCircle2, MessageCircle, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

import { usePostReview, useReview } from "@/lib/reviewApi";
import { useSlugStore } from "@/store/useProjectStore";
import { useReservationStore } from "@/store/useReservationStore";

const RATING_MAP: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "We're sorry to hear about your experience",
  2: "We appreciate your feedback",
  3: "Thank you for your honest review",
  4: "We're glad you enjoyed your experience",
  5: "We're thrilled you had an excellent experience!",
};

type StarRatingProps = {
  totalStars?: number;
  initialRating?: number;
  size?: number;
};

const StarRating = ({
  totalStars = 5,
  initialRating = 0,
  size = 26,
}: StarRatingProps) => {
  const slugData = useSlugStore((state) => state.data);
  const entityId = slugData?.id;
  const currentState = useReservationStore.getState().reservation;
  const { postReview } = usePostReview(entityId ?? "");

  const { data: reviewData, isLoading, error } = useReview(entityId ?? "");

  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [triggerRating, setTriggerRating] = useState<number>(0);
  const [questionRatings, setQuestionRatings] = useState<
    Record<string, number>
  >({});
  const [questionHoveredStars, setQuestionHoveredStars] = useState<
    Record<string, number | null>
  >({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remark, setRemark] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const primaryColor = slugData?.company?.primary_color ?? "#2563eb";

  useEffect(() => {
    if (reviewData?.questions?.items) {
      const initialRatings = reviewData.questions.items.reduce(
        (acc, question) => ({ ...acc, [question.id]: initialRating }),
        {}
      );
      setQuestionRatings(initialRatings);

      const initialHoverStates = reviewData.questions.items.reduce(
        (acc, question) => ({ ...acc, [question.id]: null }),
        {}
      );
      setQuestionHoveredStars(initialHoverStates);
    }
  }, [reviewData, initialRating]);

  const parseCondition = (
    condition: string | null
  ): { minStars: number | null } => {
    if (!condition) return { minStars: null };
    const match = condition.match(/On & Above (\d+) Star/);
    return match ? { minStars: parseInt(match[1], 10) } : { minStars: null };
  };

  const handleRedirect = async (url: string) => {
    try {
      const newWindow = window.open(url, "_blank");

      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === "undefined"
      ) {
        window.location.href = url;
      } else {
        setTimeout(() => {
          try {
            newWindow.focus();
          } catch (e) {
            newWindow.close();
            window.location.href = url;
          }
        }, 100);
      }
    } catch (e) {
      console.error("Redirection failed:", e);
      setRedirectError(
        "Pop-up was blocked. Please allow pop-ups for this site."
      );
      window.location.href = url;
    }
  };

  const handleTriggerStarClick = async (value: number) => {
    setTriggerRating(value);
    setRedirectError(null);

    if (reviewData?.destinations?.items) {
      let destinationToUse = null;

      if (currentState?.source) {
        destinationToUse = reviewData.destinations.items.find(
          (dest) =>
            dest.destination.toLowerCase() === currentState.source.toLowerCase()
        );
      }

      if (!destinationToUse) {
        destinationToUse = reviewData.destinations.items.find(
          (dest) => dest.is_default
        );
      }

      if (destinationToUse) {
        const { minStars } = parseCondition(destinationToUse.condition);
        if (minStars === null || value >= minStars) {
          await submitReview(value, destinationToUse.destination);
          await handleRedirect(destinationToUse.destination_url);
          return;
        }
      }
    }

    setIsOpen(true);
  };

  const submitReview = async (rating: number, redirectSource?: string) => {
    try {
      const context: Record<string, any> = {};
      if (reviewData?.questions?.items) {
        reviewData.questions.items.forEach((question) => {
          const questionId = question.id;
          if (questionRatings[questionId] > 0 || answers[questionId]) {
            context[question.question] = {
              rating: questionRatings[questionId] || 0,
              remark: answers[questionId] || "",
            };
          }
        });
      }

      const payload = {
        rating: RATING_MAP[rating] || "Average",
        remarks: remark,
        context,
        redirect_source: redirectSource || "Web App",
        reservation_id: currentState?.id ?? "",
        customer_id: currentState?.customer_id ?? "",
      };

      await postReview(payload);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const handleQuestionStarClick = (questionId: string, value: number) => {
    setQuestionRatings((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleQuestionStarHover = (
    questionId: string,
    value: number | null
  ) => {
    setQuestionHoveredStars((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRemark(e.target.value);
  };

  const handleSubmit = async () => {
    if (reviewData?.questions?.items && !isFormValid()) return;

    await submitReview(triggerRating);

    // Show success animation before closing (keeping original behavior)
    if (isSubmitted) {
      setTimeout(() => {
        setAnswers({});
        setRemark("");
        setIsOpen(false);
        setIsSubmitted(false);
      }, 2000);
    } else {
      setAnswers({});
      setRemark("");
      setIsOpen(false);
    }
  };

  const calculateAverageRating = () => {
    const validRatings = Object.values(questionRatings).filter((r) => r > 0);
    return validRatings.length > 0
      ? validRatings.reduce((sum, rating) => sum + rating, 0) /
          validRatings.length
      : 0;
  };

  const isFormValid = () => {
    if (!reviewData?.questions?.items) return true;
    const requiredQuestions = reviewData.questions.items.filter(
      (q) => q.is_required && !q.is_disabled
    );
    return requiredQuestions.every((q) => questionRatings[q.id] > 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center pt-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center text-red-700 text-sm">
            <X className="w-4 h-4 mr-2" />
            <span>Error: {error.message}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center pt-3">
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-md w-full mx-4">
        <h1 className="pb-4 text-xl text-center text-gray-800">
          Please rate your experience
        </h1>

        {redirectError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center text-red-700 text-sm">
              <X className="w-4 h-4 mr-2 flex-shrink-0" />
              {redirectError}
            </div>
          </div>
        )}

        <div className="flex space-x-2 justify-center pb-4">
          {[...Array(totalStars)].map((_, index) => {
            const starValue = index + 1;
            const averageRating = calculateAverageRating();
            const displayRating =
              triggerRating > 0 ? triggerRating : averageRating;
            const isActive =
              starValue <= (hoveredStars ?? Math.round(displayRating));

            return (
              <button
                key={`trigger-star-${starValue}`}
                onClick={() => handleTriggerStarClick(starValue)}
                className={`focus:outline-none transition-all duration-200 hover:scale-110 ${
                  isActive ? "text-yellow-400" : "text-gray-300"
                } cursor-pointer`}
                onMouseEnter={() => setHoveredStars(starValue)}
                onMouseLeave={() => setHoveredStars(null)}
              >
                <Star
                  size={size + 6}
                  fill="currentColor"
                  className="drop-shadow-sm"
                />
              </button>
            );
          })}
        </div>

        {hoveredStars && (
          <div className="text-center mb-4 transition-all duration-200">
            <p
              className="text-lg font-semibold"
              style={{ color: primaryColor }}
            >
              {RATING_MAP[hoveredStars]}
            </p>
            <p className="text-sm text-gray-600">
              {RATING_DESCRIPTIONS[hoveredStars]}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center text-gray-500 text-sm">
          <MessageCircle className="w-4 h-4 mr-1" />
          Tap a star to rate
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Rate your experience
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Your {RATING_MAP[triggerRating]?.toLowerCase()} rating
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={25} />
                </button>
              </div>
            </div>

            <div className="relative overflow-y-auto max-h-[calc(80vh-140px)]">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="bg-green-100 rounded-full p-4 mb-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-gray-600 text-center">
                    Your review has been submitted successfully.
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-6 py-1 px-6">
                  {reviewData?.questions?.items?.length ? (
                    <>
                      <p className="text-lg font-semibold text-center text-gray-800">
                        Reviews
                      </p>
                      {reviewData.questions.items
                        .filter((question) => !question.is_disabled)
                        .map((question) => (
                          <div
                            key={`question-${question.id}`}
                            className="bg-gray-50 rounded-xl p-1 transition-all duration-200 hover:bg-gray-100"
                          >
                            <label className="pb-3 text-sm font-medium flex justify-center text-center">
                              <span className="text-gray-800">
                                {question.question}
                                {question.is_required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </label>

                            <div className="flex space-x-1 justify-center mb-3">
                              {[...Array(totalStars)].map((_, index) => {
                                const starValue = index + 1;
                                const isActive =
                                  starValue <=
                                  (questionHoveredStars[question.id] ??
                                    questionRatings[question.id] ??
                                    0);

                                return (
                                  <button
                                    key={`question-star-${question.id}-${starValue}`}
                                    onClick={() =>
                                      handleQuestionStarClick(
                                        question.id,
                                        starValue
                                      )
                                    }
                                    onMouseEnter={() =>
                                      handleQuestionStarHover(
                                        question.id,
                                        starValue
                                      )
                                    }
                                    onMouseLeave={() =>
                                      handleQuestionStarHover(question.id, null)
                                    }
                                    className="focus:outline-none cursor-pointer transform transition-all duration-200 hover:scale-110"
                                  >
                                    <Star
                                      size={size}
                                      fill="currentColor"
                                      className={`transition-colors ${
                                        isActive
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>

                            {questionRatings[question.id] > 0 && (
                              <div className="text-center">
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: primaryColor }}
                                >
                                  {RATING_MAP[questionRatings[question.id]]}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </>
                  ) : (
                    <p className="text-center text-gray-600 py-4">
                      Thank you for your rating!
                    </p>
                  )}

                  <div className="bg-gray-50 rounded-xl p-5">
                    <label className="pb-3 text-sm font-medium flex justify-center text-center">
                      <span className="text-gray-800">Your Remarks</span>
                    </label>
                    <textarea
                      value={remark}
                      onChange={handleRemarkChange}
                      placeholder="Please share your feedback..."
                      className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      rows={3}
                    />
                  </div>

                  {reviewData?.questions?.items && !isFormValid() && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center text-red-700 text-sm">
                        <X className="w-4 h-4 mr-2" />
                        Please rate all required questions before submitting
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isSubmitted && (
                <div className="sticky bottom-0 left-0 right-0 bg-gray-50 p-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={reviewData?.questions?.items && !isFormValid()}
                    style={{
                      backgroundColor:
                        !reviewData?.questions?.items || isFormValid()
                          ? primaryColor
                          : "#9ca3af",
                      cursor:
                        !reviewData?.questions?.items || isFormValid()
                          ? "pointer"
                          : "not-allowed",
                    }}
                    className=" w-full px-6 py-2 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                  >
                    {reviewData?.questions?.items ? "Submit Rating" : "Close"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarRating;
