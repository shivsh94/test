export const getGuestsByProperty = (propertyId?: string) => {
  const data = JSON.parse(localStorage.getItem("guestData") ?? "null");

  if (!propertyId) return data;

  return {
    mainGuest: data.mainGuest?.property === propertyId ? data.mainGuest : null,
    additionalGuests: data.additionalGuests.filter(
      (guest: any) => guest.property === propertyId
    ),
    currentProperty: data.currentProperty,
  };
};
