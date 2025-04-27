export const fetchHotelInfo = async (slug: string) => {
    const res = await fetch(`http://localhost:8000/server/guest/v1/entity/${slug}/`);
    // console.log("Hotel info response:", res);
    return res.json();
  };

export const fetchIdInfo = async (id: string) => {
    const res = await fetch(`http://localhost:8000/server/guest/v1/extra/${id}/notices/`);
    // console.log("ID info response:", res);
    return res.json();
  }

export const nearByPlaces = async(id: string) => {
    const res = await fetch(`http://localhost:8000/server/guest/v1/extra/${id}/places/`);
    return res.json();
  } 
export const categoriesList = async(id: string) => {
    const res = await fetch(`http://localhost:8000/server/guest/v1/fnb/${id}/category/list/`);
    return res.json();
  }
export const menuList = async (id: string) => {
    const res = await fetch(`http://localhost:8000/server/guest/v1/fnb/${id}/item/list/`);
    return res.json();
  }

export const fetchLabel = async (id: string, company_id:string) => {
    const res = await fetch(`http://localhost:8000/server/guest/v1/extra/${id}/${company_id}/labels/`);
    return res.json();
  }